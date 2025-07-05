import React, { useState } from 'react';
import { Checkbox } from 'antd';
import { useMap } from '../../../context/MapContext';
import { changeBaseMap } from '../../../UtilsServices/MapUtils';

const MapContent = ({
    selectedParcel,
    selectedDistrict,
    selectedTaluka,
    selectedVillage,
    selectedState,
    selectedBasemap,
    // layerVisibility, setLayerVisibility
}) => {
    const { currentParcelLayer, mapRef, layerVisibility, setLayerVisibility } = useMap();

    let sldName = changeBaseMap(selectedBasemap);


    const wmsLayersMeta = [
        {
            key: 'village',
            name: 'Village Layer',
            style: sldName,
            visibleCondition: !!selectedVillage
        },
        {
            key: 'selectedParcel',
            name: 'Target Parcel',
            style: 'selected.sld',
            visibleCondition: !!selectedParcel
        },
        {
            key: 'adjacentParcels',
            name: 'Chatursima Parcels',
            style: 'selChatu.sld',
            visibleCondition: !!selectedParcel
        }
    ];

    // const [layerVisibility, setLayerVisibility] = useState({
    //     village: true,
    //     selectedParcel: true,
    //     adjacentParcels: true
    // });

    const toggleLayer = (key) => {
        const map = mapRef.current;
        const layer = currentParcelLayer.current[key];

        setLayerVisibility((prev) => {
            const newVisibility = !prev[key];

            if (layer && map) {
                if (newVisibility) {
                    layer.addTo(map);
                } else {
                    map.removeLayer(layer);
                }
            }

            return { ...prev, [key]: newVisibility };
        });
    };

    return (
        <div className='p-[5px]'>
            <h3 className="text-lg font-semibold mb-4">Layer Controls</h3>
            {wmsLayersMeta.map(({ key, name, style, visibleCondition }) => {
                // ✅ Only render if visibleCondition is true
                if (!visibleCondition) return null;

                const map = mapRef.current;
                const layer = currentParcelLayer.current[key];
                const isVisibleOnMap = map && layer && map.hasLayer(layer);
                let url = "http://192.168.1.139:8080"
                const legendUrl = `${import.meta.env.VITE_GOSERVER_BASE_URL
                    }/geoserver/wms?REQUEST=GetLegendGraphic&VERSION=1.0.0&FORMAT=image/png&LAYER=LPMKPRATH:LPMKPRATH_TALUK_DHULE_DATA&STYLE=${style}`;

                return (
                    <div key={key} className="mb-4">
                        <Checkbox
                            checked={layerVisibility[key]}
                            onChange={() => toggleLayer(key)}
                            className="text-gray-800"
                        >
                            {name}
                        </Checkbox>

                        {/* ✅ Only show legend if layer is visible on the map */}
                        {isVisibleOnMap && (
                            <div className="mt-2 ml-[25px]">
                                <img
                                    src={legendUrl}
                                    alt={`${name} legend`}
                                />
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default MapContent;
