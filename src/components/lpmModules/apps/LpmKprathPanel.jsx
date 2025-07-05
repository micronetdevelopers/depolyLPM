import React, { useState, useEffect, useRef } from 'react';
import { Button, Select, Typography, Spin, Alert } from 'antd';
import axios from 'axios';
import { useMap } from '../../../context/MapContext';
import '../ParentCompLpmKprath.css'  //ParentCompLpmKrath
import { screenshotGeoJsonFeature, clearUserLayers, changeBaseMap, fetchWFSFeatures, removeLayers, removeWmsLayerByName, getAdjacentParcels } from '../../../UtilsServices/MapUtils'
import L from 'leaflet';
const { Option } = Select;
const { Title } = Typography;
import { ensureProj, bboxToLatLngBounds } from "../../../UtilsServices/crsLoader";
import * as turf from '@turf/turf';

const LpmKprathPanel = (
  { selectedParcel, setSelectedParcel, selectedDistrict, setSelectedDistrict, selectedTaluka, setSelectedTaluka,
    selectedVillage, setSelectedVillage, selectedState, setSelectedState }
) => {

  const { mapRef,
    selectedBasemap,
    currentParcelLayer,
    setSelectedBasemap,
    mapLoading, setMapLoading,
    loadingWmsCount, setLoadingWmsCount, layerVisibility, setLayerVisibility,
    progress, setProgress } = useMap();

  let url = "http://192.168.1.139:8080"

  const [features, setFeatures] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [talukas, setTalukas] = useState([]);
  const [villages, setVillages] = useState([]);
  const [parcels, setParcels] = useState([]);
  const [states, setStates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ResetPanle, setResetPanle] = useState(false);
  const [geoJsonVillage, setGeoJsonVillage] = useState(null);
  const [chatursima, setChatursima] = useState(null)

  let selectedVillLayerName = `LPMKPRATH:LPMKPRATH_TALUK_${selectedTaluka?.toUpperCase()}_DATA`
  // const parseVillage = (village) => {
  //   const match = village.match(/\((\d+)\)\s*$/); // Match last number in parentheses
  //   const villageName = village.replace(/\s*\(.*?\)\s*/g, '').trim(); // Remove all parentheses parts

  //   return {
  //     villageName,
  //     villageNo: match ? match[1].trim() : '',
  //   };
  // };

  const parseVillage = (village) => {
    // console.log(village)
    const match = village.match(/\((\d+)\)\s*$/); // Match last number in parentheses at the end
    const villageNo = match ? match[1].trim() : '';

    // Remove the last parentheses group (village number)
    const villageName = village.replace(/\(\d+\)\s*$/, '').trim();
    // console.log(villageName)
    return {
      villageName,
      villageNo,
    };
  };
  // const extractVillageName = (village) => {
  //   return village.replace(/\s*\(.*?\)\s*/g, '').trim();
  // };

  const handleClearSelected = (label) => {
    // console.log(`${label} selection was cleared`);
    // Optionally reset dependent dropdowns or perform logic here
    if (label === 'State') {
      setSelectedDistrict(null);
      setSelectedTaluka(null);
      setSelectedVillage(null);
      setSelectedParcel(null);
      setChatursima(null);
      setDistricts([]);
      setTalukas([]);
      setVillages([]);
      setParcels([]);
      removeWmsLayerByName(mapRef, [selectedVillLayerName])
    } else if (label === 'District') {
      setSelectedTaluka(null);
      setSelectedVillage(null);
      setSelectedParcel(null);
      setChatursima(null);
      setTalukas([]);
      setVillages([]);
      setParcels([]);
      removeWmsLayerByName(mapRef, [selectedVillLayerName])
    } else if (label === 'Taluka') {
      setSelectedVillage(null);
      setSelectedParcel(null);
      setChatursima(null);
      setVillages([]);
      setParcels([]);
      removeWmsLayerByName(mapRef, [selectedVillLayerName])
    } else if (label === 'Village') {
      setSelectedVillage(null);
      setSelectedParcel(null);
      setChatursima(null);
      setParcels([]);
      removeWmsLayerByName(mapRef, [selectedVillLayerName])
    } else if (label === 'Parcel') {
      setSelectedParcel(null);
      setChatursima(null);
      const map = mapRef.current;
      clearUserLayers(map, currentParcelLayer);
    }
  };

  const handleReset = async () => {
    setLoading(true);
    // Optionally remove layers from the map
    removeLayers(mapRef, currentParcelLayer);
    const map = mapRef.current;
    clearUserLayers(map, currentParcelLayer);
    // Reset all selections and dependent arrays
    removeWmsLayerByName(mapRef, [selectedVillLayerName])
    setSelectedState(null);

    setSelectedDistrict(null);
    setSelectedTaluka(null);
    setSelectedVillage(null);
    setSelectedParcel(null);
    setChatursima(null);
    setStates([]);
    setTalukas([]);
    setVillages([]);
    setParcels([]);
    setResetPanle(true);


    // Re-fetch base administrative boundaries just like initial useEffect
    try {
      const res = await axios.get(`${import.meta.env.VITE_GOSERVER_BASE_URL}/geoserver/LPMKPRATH/ows`, {
        params: {
          service: 'WFS',
          version: '1.0.0',
          request: 'GetFeature',
          typeName: 'LPMKPRATH:MHADMINPO',
          outputFormat: 'application/json',
          propertyName: 'STENAME,DIST_NAME,TEHSIL_NAM,VIL_ANNO',
        },
      });

      const feats = res.data.features;
      setFeatures(feats);
      setStates([...new Set(feats.map(f => f.properties.STENAME))]);
    } catch (err) {
      console.error('Failed to fetch WFS data', err);
      setFeatures([]);
      setStates([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadFeatures = async () => {
      const feats = await fetchWFSFeatures({
        workspace: 'LPMKPRATH',
        layerName: 'MHADMINPO',
        propertyNames: ['STENAME', 'DIST_NAME', 'TEHSIL_NAM', 'VIL_ANNO'],
      });

      setFeatures(feats);

      const stateList = [...new Set(feats.map(f => f.properties.STENAME))];
      setStates(stateList);
      setLoading(false);
    };

    loadFeatures();
  }, []);



  // Filter districts after selecting state
  useEffect(() => {
    if (selectedState) {
      const districtList = features
        .filter(f => f.properties.STENAME === selectedState)
        .map(f => f.properties.DIST_NAME);

      setDistricts([...new Set(districtList)]);
      setSelectedDistrict(null);
      setSelectedTaluka(null);
      setSelectedVillage(null);
      setSelectedParcel(null);
      setTalukas([]);
      setVillages([]);
      setParcels([]);
    } else {
      setDistricts([]);
      setSelectedDistrict(null);
    }
  }, [selectedState]);


  // Talukas based on district
  useEffect(() => {
    if (selectedDistrict) {
      const talukaList = features
        .filter(
          f =>
            f.properties.STENAME === selectedState &&
            f.properties.DIST_NAME === selectedDistrict
        )
        .map(f => f.properties.TEHSIL_NAM);

      setTalukas([...new Set(talukaList)]);
      setSelectedTaluka(null);
      setSelectedVillage(null);
      setSelectedParcel(null);
      setVillages([]);
      setParcels([]);
    }
  }, [selectedDistrict]);


  // Villages based on taluka
  useEffect(() => {
    if (selectedTaluka) {
      const villageList = features
        .filter(
          f =>
            f.properties.STENAME === selectedState &&
            f.properties.DIST_NAME === selectedDistrict &&
            f.properties.TEHSIL_NAM === selectedTaluka
        )
        .map(f => f.properties.VIL_ANNO);

      setVillages([...new Set(villageList)]);
      setSelectedVillage(null);
      setSelectedParcel(null);
      setParcels([]);
    }
  }, [selectedTaluka]);


  // Fetch parcels after village selection
  useEffect(() => {
    const map = mapRef.current;

    const fetchParcels = async () => {
      if (selectedVillage && selectedDistrict) {
        try {
          const layerName = selectedVillLayerName;
          const vil_no = parseVillage(selectedVillage);

          // Remove only village layer
          if (currentParcelLayer.current.village) {
            map.removeLayer(currentParcelLayer.current.village);
            currentParcelLayer.current.village = null;
          }

          let sldName = changeBaseMap(selectedBasemap);
          const cqlFilter = `DTENAME='${selectedDistrict}' AND THENAME='${selectedTaluka}' AND VLNCODE='${vil_no.villageNo}'`;

          const wmsLayer = L.tileLayer.wms(`${import.meta.env.VITE_GOSERVER_BASE_URL}/geoserver/LPMKPRATH/wms`, {
            layers: layerName,
            format: "image/png",
            transparent: true,
            version: "1.1.1",
            tiled: true,
            crs: L.CRS.EPSG3857,
            CQL_FILTER: cqlFilter,
            zIndex: 10,
            styles: sldName,
          });

          wmsLayer.addTo(map);
          currentParcelLayer.current.village = wmsLayer;

          const cqlFilterWFS = `DTENAME='${selectedDistrict}' AND THENAME='${selectedTaluka}' AND VLENAME_01='${vil_no.villageName}' AND VLNCODE='${vil_no.villageNo}'`;

          const wfsUrl = `${import.meta.env.VITE_GOSERVER_BASE_URL}/geoserver/LPMKPRATH/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=${layerName}&outputFormat=application/json&CQL_FILTER=${encodeURIComponent(cqlFilterWFS)}`;

          if (!selectedParcel) {
            const res = await fetch(wfsUrl);
            const data = await res.json();
            /* ---- 4  — compute bounds in map CRS ------------------ */
            if (data.features.length > 0) {
              setGeoJsonVillage(data);
              const nativeBbox = turf.bbox(data);     // [minx,miny,maxx,maxy] in src CRS
              const srcEpsg = data.crs.properties.name.split("::").pop(); // "EPSG:32643"
              const bounds = await bboxToLatLngBounds(nativeBbox, srcEpsg);
              map.fitBounds(bounds, { padding: [30, 30] });
            }
          }

          const response = await axios.get(`${import.meta.env.VITE_GOSERVER_BASE_URL}/geoserver/LPMKPRATH/ows`, {
            params: {
              service: 'WFS',
              version: '1.0.0',
              request: 'GetFeature',
              typeName: layerName,
              outputFormat: 'application/json',
              CQL_FILTER: cqlFilterWFS,
            },
          });

          const parcelList = response.data.features.map(f => f.properties?.PARCEL_NO);
          setParcels([...new Set(parcelList)]);

          const villageFeature = features.find(
            f =>
              f.properties.DIST_NAME === selectedDistrict &&
              f.properties.TEHSIL_NAM === selectedTaluka &&
              f.properties.VIL_ANNO === selectedVillage &&
              f.geometry
          );

          if (villageFeature && mapRef.current) {
            const layer = L.geoJSON(villageFeature);
            mapRef.current.fitBounds(layer.getBounds());
          }

        } catch (err) {
          console.error("Failed to fetch parcel data", err);
        }
      }
    };

    if (layerVisibility?.village !== false) {
      fetchParcels();
    }
  }, [selectedVillage, selectedBasemap, layerVisibility]);

  // const generateScreenshots = async () => {
  //   if (!mapRef?.current || !chatursima?.features?.length) {
  //     return;
  //   }

  //   let groupedScreenshots = {}

  //   try {
  //     const { image, center } = await screenshotGeoJsonFeature(mapRef.current, chatursima);
  //     groupedScreenshots = { image, center };
  //   } catch (error) {
  //     console.error(`Error capturing screenshot for :`, error);
  //   }
  // };

  const generateScreenshots = async () => {
    if (!mapRef.current || !chatursima?.features?.length) return;

    try {
      const result = await screenshotGeoJsonFeature(
        mapRef.current,
        chatursima,                       // FeatureCollection straight from your state
        {
          fileName: "chatursima.png", download: true,
          extraMeta: {
            createdAt: new Date().toISOString(),
          },
        }
      );

      console.log("Screenshot centre:", result.center);
      // result.image is the Base-64 PNG if you still need it in JS
    } catch (err) {
      console.error("Failed to capture screenshot:", err);
    }
  };


  useEffect(() => {
    if (
      selectedParcel &&
      selectedDistrict &&
      selectedTaluka &&
      selectedVillage &&
      mapRef.current instanceof L.Map
    ) {
      const map = mapRef.current;

      // Cleanup previous layers
      ['selectedParcel', 'adjacentParcels', 'adjacentGeoJsonLayer'].forEach(key => {
        if (currentParcelLayer.current[key]) {
          map.removeLayer(currentParcelLayer.current[key]);
          currentParcelLayer.current[key] = null;
        }
      });

      const layerName = selectedVillLayerName;
      const vil_no = parseVillage(selectedVillage);

      const selectedCql = `DTENAME='${selectedDistrict}' AND THENAME='${selectedTaluka}' AND VLENAME_01='${vil_no.villageName}' AND VLNCODE='${vil_no.villageNo}' AND PARCEL_NO='${selectedParcel}'`;

      const wfsUrl = `${import.meta.env.VITE_GOSERVER_BASE_URL}/geoserver/LPMKPRATH/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=${layerName}&outputFormat=application/json&CQL_FILTER=${encodeURIComponent(selectedCql)}`;

      fetch(wfsUrl)
        .then(res => res.json())
        .then(data => {
          if (data.features.length === 1) {
            const selectedFeature = data.features[0];
            const allowedKeys = ["STENAME", "DTENAME", "THENAME", "VLENAME_01", "VLNCODE", "PARCEL_NO"];

            const GetResultadjacentFeatures = getAdjacentParcels(selectedFeature, geoJsonVillage);

            const adjacentFeatures = {
              ...GetResultadjacentFeatures,
              features: GetResultadjacentFeatures?.features.map(item => {
                const props = Object.fromEntries(
                  Object.entries(item?.properties || {}).filter(([key]) => allowedKeys.includes(key))
                );

                const isMatch =
                  props.STENAME === selectedState &&
                  props.DTENAME === selectedDistrict &&
                  props.THENAME === selectedTaluka &&
                  props.VLENAME_01 === vil_no.villageName &&
                  props.VLNCODE === vil_no.villageNo &&
                  props.PARCEL_NO === selectedParcel;

                return {
                  ...item,
                  properties: {
                    ...props,
                    target: isMatch ? 1 : 0,
                  },
                };
              }),
            };

            setChatursima(adjacentFeatures);

            // const geojsonLayer = L.geoJSON(adjacentFeatures);
            // map.fitBounds(geojsonLayer.getBounds(), { padding: [20, 20] });
            const nativeBbox = turf.bbox(adjacentFeatures);
            const srcEpsg = adjacentFeatures.crs.properties.name.split("::").pop(); // "EPSG:32643"
            bboxToLatLngBounds(nativeBbox, srcEpsg)
              .then(bounds => {
                // console.log("bounds →", bounds);
                map.fitBounds(bounds, { padding: [20, 20] });
              })
              .catch(console.error);
            const adjacentParcelNos = adjacentFeatures.features.map(f => `'${f.id}'`).join(',');

            if (adjacentParcelNos) {
              const props = selectedFeature.properties;
              const adjacentCql = `
              VLNCODE='${props.VLNCODE}' AND 
              id IN (${adjacentParcelNos})
            `.replace(/\s+/g, ' ').trim();

              const adjacentLayer = L.tileLayer.wms(`${import.meta.env.VITE_GOSERVER_BASE_URL}/geoserver/LPMKPRATH/wms`, {
                layers: layerName,
                format: "image/png",
                transparent: true,
                CQL_FILTER: adjacentCql,
                zIndex: 9999,
                styles: "selChatu.sld",
                tiled: true,
                crs: L.CRS.EPSG3857,
              });

              adjacentLayer.addTo(map);
              currentParcelLayer.current.adjacentParcels = adjacentLayer;
            }

            const selectedLayer = L.tileLayer.wms(`${import.meta.env.VITE_GOSERVER_BASE_URL}/geoserver/LPMKPRATH/wms`, {
              layers: layerName,
              format: "image/png",
              transparent: true,
              CQL_FILTER: `DTENAME='${selectedDistrict}' AND THENAME='${selectedTaluka}' AND VLNCODE='${vil_no.villageNo}' AND PARCEL_NO='${selectedParcel}'`,
              zIndex: 10,
              styles: "selected.sld",
              tiled: true,
              crs: L.CRS.EPSG3857,
            });

            selectedLayer.addTo(map);
            currentParcelLayer.current.selectedParcel = selectedLayer;
            // const takess = generateScreenshots()
            // console.log(takess)
          } else {
            alert("Selected Parcel is not unique, please select a different one.");
            setSelectedParcel(null);
          }
        })
        .catch(err => {
          console.error("Error fetching selected parcel geometry:", err);
        });
    }
  }, [selectedParcel, selectedDistrict, selectedTaluka, selectedVillage]);





  const renderField = (label, options, value, onChange) => {
    // Sort options alphabetically
    const sortedOptions = [...options].sort((a, b) => a.localeCompare(b));
    const handleChange = (newValue) => {
      if (newValue === null || newValue === undefined) {
        // Handle the clearing case
        handleClearSelected(label); // Your custom logic on clear
      }
      onChange(newValue); // Always update the value
    };

    return (
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
        <label style={{ width: 80, marginRight: 8, fontSize: 14 }}>{label}:</label>

        <Select
          size="small"
          placeholder={`Select ${label}`}
          style={{ width: 200 }}
          value={value}
          onChange={handleChange}
          disabled={loading || options.length === 0}
          allowClear
          showSearch
          filterOption={(input, option) =>
            option?.children?.toLowerCase().includes(input.toLowerCase())
          }
        >

          {sortedOptions.map(option => (
            <Option key={option} value={option}>
              {option}
            </Option>
          ))}
        </Select>
      </div>
    );
  };

  const storeSelectionInSession = (selectedState, selectedDistrict, selectedTaluka, selectedVillage, selectedParcel, adjacentParcels) => {
    if (selectedParcel) {
      const selectionData = {
        selectedState,
        selectedDistrict,
        selectedTaluka,
        selectedVillage,
        selectedParcel,
        adjacentParcels
      };

      sessionStorage.setItem('parcelSelection', JSON.stringify(selectionData));
    } else {
      alert("First Select Parcel");
    }
  };


  const saveJsonToFile = (data, fileName = 'data.json') => {
    if (data != null) {
      storeSelectionInSession(selectedState, selectedDistrict, selectedTaluka, selectedVillage, selectedParcel, data)
      const jsonString = JSON.stringify(data, null, 2); // pretty format
      const blob = new Blob([jsonString], { type: 'application/json' });

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');

      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();

      // Clean up
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } else {
      alert("First Selete Parcel")
    }
  };

  return (


    <div style={{ maxWidth: 400 }}>
      <Title level={4}>Lpm:Kparth</Title>
      {loading ? (
        <Spin />
      ) : (
        <>
          {renderField('State', states, selectedState, setSelectedState)}
          {renderField('District', districts, selectedDistrict, setSelectedDistrict)}
          {renderField('Taluka', talukas, selectedTaluka, setSelectedTaluka)}
          {renderField('Village', villages, selectedVillage, setSelectedVillage)}
          <hr className='mb-[10px]' />
          {renderField('Parcel', parcels, selectedParcel, setSelectedParcel)}
          <Button
            style={{ marginTop: 16 }}
            onClick={() => saveJsonToFile(chatursima, 'adjacent_parcels.json')}
            type="default"
            disabled={!chatursima}
          >
            Save Chatursima
          </Button>
          <Button
            style={{ marginTop: 16, marginLeft: 10 }}
            onClick={handleReset}
            type="default"
            disabled={!selectedState || !selectedDistrict || !selectedTaluka}
          >
            Reset
          </Button>
          <Button
            style={{ marginTop: 16, marginLeft: 10 }}
            onClick={generateScreenshots}
            type="default"
            disabled={!chatursima}
          >
            takess
          </Button>
        </>
      )}
    </div>


  );
};

export default LpmKprathPanel;