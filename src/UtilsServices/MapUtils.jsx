import * as turf from '@turf/turf';
import axios from 'axios';
import { SimpleMapScreenshoter } from "leaflet-simple-map-screenshoter"
import { normaliseEpsg, ensureProj, reprojectGeoJSON } from "./crsLoader"
export function getAdjacentParcels(selectedFeature, villageFeatureCollection) {
  const adjacentParcels = [];

  villageFeatureCollection.features.forEach((feature) => {
    // Skip if it's the same parcel
    // if (feature.properties.PARCEL_NO === selectedFeature.properties.PARCEL_NO) {
    //   return;
    // }

    // Check if the parcel intersects or touches the selected parcel
    const intersects = turf.booleanIntersects(selectedFeature, feature);

    if (intersects) {
      adjacentParcels.push(feature);
    }
  });

  return {
    type: 'FeatureCollection',
    features: adjacentParcels,
    crs: villageFeatureCollection?.crs
  };
}

export const removeLayers = (mapRef, currentParcelLayer) => {
  const map = mapRef.current;

  // Remove currentParcelLayer as before (if needed)
  const layerId = currentParcelLayer.current?.id;
  const sourceId = currentParcelLayer.current?.source;

  if (map && layerId) {
    if (map.getLayer && map.getLayer(layerId)) {
      map.removeLayer(layerId);
    }
    if (map.getSource && sourceId && map.getSource(sourceId)) {
      map.removeSource(sourceId);
    }
    currentParcelLayer.current = null;
  }

  // Remove all layers with options.layers matching the target names
  const targetLayerNames = ["lpmkparth:MHADMINPO_DHULE", "lpmkparth:MHADMINPO"];
  Object.values(map._layers).forEach(layer => {
    if (
      layer.options &&
      targetLayerNames.includes(layer.options.layers)
    ) {
      map.removeLayer(layer);
    }
  });
  if (mapRef.current) {
    mapRef.current.setView([21.5937, 79.9629], 4)
  }
};

export const removeWmsLayerByName = (mapRef, layerNames = []) => {
  const map = mapRef.current;

  if (!map) return;

  // Remove WMS layers by matching layer.options.layers
  Object.values(map._layers).forEach(layer => {
    if (
      layer.options &&
      layer.options.layers &&
      layerNames.includes(layer.options.layers)
    ) {
      map.removeLayer(layer);
    }
  });
};


export function clearUserLayers(map, currentParcelLayer) {
  // Remove WMS layer: selected parcel
  if (currentParcelLayer.current?.selectedParcel) {
    if (map.hasLayer(currentParcelLayer.current.selectedParcel)) {
      map.removeLayer(currentParcelLayer.current.selectedParcel);
    }
    currentParcelLayer.current.selectedParcel = null;
  }

  // Remove WMS layer: adjacent parcels (optional)
  if (currentParcelLayer.current?.adjacentParcels) {
    if (Array.isArray(currentParcelLayer.current.adjacentParcels)) {
      currentParcelLayer.current.adjacentParcels.forEach(layer => {
        if (map.hasLayer(layer)) {
          map.removeLayer(layer);
        }
      });
    } else {
      if (map.hasLayer(currentParcelLayer.current.adjacentParcels)) {
        map.removeLayer(currentParcelLayer.current.adjacentParcels);
      }
    }
    currentParcelLayer.current.adjacentParcels = null;
  }

  // Remove client-side GeoJSON layer
  if (currentParcelLayer.current?.adjacentGeoJsonLayer) {
    if (map.hasLayer(currentParcelLayer.current.adjacentGeoJsonLayer)) {
      map.removeLayer(currentParcelLayer.current.adjacentGeoJsonLayer);
    }
    currentParcelLayer.current.adjacentGeoJsonLayer = null;
  }
}
let url = "http://192.168.1.139:8080"

export const fetchWFSFeatures = async ({
  workspace,
  layerName,
  propertyNames = [],
  additionalParams = {},
}) => {
  try {
    const response = await axios.get(
      // `${import.meta.env.VITE_GEOSERVER_IPBASE_BASE_URL}/geoserver/${workspace}/ows`,
      `${import.meta.env.VITE_GOSERVER_BASE_URL}/geoserver/${workspace}/ows`,
      {
        params: {
          service: 'WFS',
          version: '1.0.0',
          request: 'GetFeature',
          typeName: `${workspace}:${layerName}`,
          outputFormat: 'application/json',
          propertyName: propertyNames.join(','),
          ...additionalParams,
        },
      }
    );

    return response.data.features;
  } catch (error) {
    console.error('Error fetching WFS features:', error);
    return [];
  }
};

export const changeBaseMap = (selectedBasemap) => {
  let sldName = '';
  if (selectedBasemap === "Open Street Map") {
    sldName = "street.sld";
  } else if (selectedBasemap === "ESRI WorldImagery") {
    sldName = "esri.sld";
  } else {
    sldName = "blank.sld";
  }
  return sldName;
}



import extract from "png-chunks-extract";
import encode from "png-chunks-encode";
import text from "png-chunk-text";

// function flattenProperties(obj) {
//   const flat = {};
//   for (const [key, value] of Object.entries(obj || {})) {
//     flat[key] = typeof value === "object" ? "[object]" : value;
//   }
//   return flat;
// }

/*
 * Safely flattens a possibly‑cyclic object to { "a.b.c": value, … }.
 * Cycles are detected with a WeakSet and silently skipped.
 *
 * @param {Object} obj              the source object
 * @param {Object} [options]
 * @param {number} [options.maxDepth=10]      bail out after this depth
 * @param {string[]} [options.skipKeys=[]]    property names to ignore
 * @returns {Object}                a 1‑level object of dotted paths
 */
export function flattenProperties(
  obj,
  { maxDepth = 10, skipKeys = [] } = {}
) {
  const out = {};
  const seen = new WeakSet();
  const omit = new Set(skipKeys);

  // stack‑based DFS avoids recursive calls
  const stack = [{ value: obj, prefix: "", depth: 0 }];

  while (stack.length) {
    const { value, prefix, depth } = stack.pop();

    if (value && typeof value === "object" && !seen.has(value)) {
      if (depth >= maxDepth) continue;   // too deep → stop drilling

      seen.add(value);

      for (const [k, v] of Object.entries(value)) {
        if (omit.has(k)) continue;       // user‑specified blacklist
        const path = prefix ? `${prefix}.${k}` : k;

        if (v && typeof v === "object") {
          stack.push({ value: v, prefix: path, depth: depth + 1 });
        } else {
          out[path] = v;
        }
      }
    }
  }
  return out;
}

/**
 * Fast, safe way to turn a Uint8Array into a Base‑64 string
 * without exceeding the argument‑count limit.
 */
function uint8ToBase64(uint8) {
  const CHUNK = 0x8000;           // 32 768‑byte slices
  let binary = "";

  for (let i = 0; i < uint8.length; i += CHUNK) {
    binary += String.fromCharCode.apply(
      null,
      uint8.subarray(i, i + CHUNK)
    );
  }
  return btoa(binary);
}

// Alternate one‑liner (uses Blob + FileReader)
// async function uint8ToBase64(uint8) {
//   const blob = new Blob([uint8], { type: "image/png" });
//   const data = await blobToDataURL(blob);          // helper below
//   return data.split(",")[1];                       // strip "data:image/png;base64,"
// }

// function blobToDataURL(blob) {
//   return new Promise(r => {
//     const fr = new FileReader();
//     fr.onload = () => r(fr.result);
//     fr.readAsDataURL(blob);
//   });
// }



export function embedGeoJsonMeta(dataURL, geojson, extra = {}) {
  if (!dataURL.startsWith("data:image/png;base64,")) {
    throw new Error("Provided dataURL is not a PNG.");
  }

  const targetFeature = geojson.features.find(
    f => f?.properties?.target === 1
  );

  // const flatProps = flattenProperties(targetFeature?.properties ?? {});
  const flatProps = flattenProperties(targetFeature?.properties ?? {}, {
    maxDepth: 10,                      // tweak if you need deeper
    skipKeys: ["image_data_xml"],      // skip megabyte‑sized blobs
  });

  // const meta = JSON.stringify(flatProps);
  const meta = JSON.stringify({ ...flatProps, ...extra });

  const b64 = dataURL.split(",")[1];
  const binary = atob(b64);
  const bytes = Uint8Array.from(binary, c => c.charCodeAt(0));

  if (bytes.length < 100) {
    throw new Error("PNG byte stream too short — likely an invalid screenshot.");
  }

  let chunks;
  try {
    chunks = extract(bytes);
  } catch (err) {
    console.error("Failed to extract PNG chunks", err);
    throw new Error("Invalid PNG structure — cannot embed metadata.");
  }

  chunks.splice(chunks.length - 1, 0, text.encode("geojson-properties", meta));
  console.log("chunks ", chunks)
  const output = encode(chunks);
  console.log("output ", output)
  // const newB64 = btoa(String.fromCharCode(...output));
  const newB64 = uint8ToBase64(output);
  console.log(newB64);
  return `data:image/png;base64,${newB64}`;
}






/*
 * Screenshot one or many GeoJSON features and (optionally) download the PNG.
 *
 * @param {L.Map}   map               Leaflet map instance
 * @param {Object|Object[]} data      GeoJSON Feature / FeatureCollection – or an array of either
 * @param {Object} [options]
 * @param {number}  [options.padding=0.015]        Extra lat/lon padding around the features
 * @param {number}  [options.screenResolution=2]   1 = CSS pixels, 2 = “retina”, etc.
 * @param {string}  [options.fileName="map.png"]   Name to use when downloading
 * @param {boolean} [options.download=false]       Immediately download the PNG
 *
 * @returns {Promise<{ image: string, center: { lat:number, lng:number } }>}
 */
export async function screenshotGeoJsonFeature(map, data, options = {}) {
  if (!map || !data) {
    throw new Error("Map instance or GeoJSON data missing.");
  }

  console.log(data)


  const {
    padding = 0.010,
    screenResolution = 2,
    fileName = "map.png",
    download = false,
  } = options;

  /* ---------- 1. Normalise the input ---------- */
  const asFeatureCollection = Array.isArray(data)
    ? {
      type: "FeatureCollection",
      features: data.flatMap(d => (d.type === "Feature" ? [d] : d.features)),
    }
    : data.type === "Feature"
      ? { type: "FeatureCollection", features: [data] }
      : data; // already a collection

  if (!asFeatureCollection.features.length) {
    throw new Error("No features found in supplied GeoJSON.");
  }

  // A. get the raw value from the GeoJSON
  const rawCrs = data?.crs?.properties?.name        // {type:"name",properties:{name:"urn:…32643"}}
    || data?.crs?.name                    // { crs:"EPSG:32643" }
    || null;

  // B. turn it into something proj4/epsg.io understand
  const epsgCode = normaliseEpsg(rawCrs);
  console.log(epsgCode)
  let featureCollection = asFeatureCollection;
  if (epsgCode && !/4326|3857/i.test(epsgCode)) {
    await ensureProj(epsgCode);                       // ← your projection loader
    featureCollection = reprojectGeoJSON(asFeatureCollection,
      epsgCode,
      "EPSG:4326");
  }
  console.log(featureCollection)
  /* ---------- 2. Temporary style (pixel-perfect tiles) ---------- */
  const styleEl = document.createElement("style");
  styleEl.textContent = `
    .leaflet-tile {
      image-rendering: pixelated !important;
      transform: scale(1.05);
      transform-origin: top left;
      border: none !important;
    }`;
  document.head.appendChild(styleEl);

  /* ---------- 3. Create helper objects ---------- */
  const screenshoter = new L.simpleMapScreenshoter({
    hidden: true,
    preventDownload: true,
    screenResolution,
    position: "topright",
    hideElementsWithSelectors: [".leaflet-control-container"],
    mimeType: "image/png",
    domToImageOptions: {
      style: {
        transform: "none",
      },
      filter: (node) => {
        if (node.tagName === "IMG") {
          node.style.imageRendering = "pixelated";
          node.style.border = "none";
        }
        return true;
      },
    },
  }).addTo(map);

  const layer = L.geoJSON(featureCollection, {
    style: {
      color: "#ff0000",
      weight: 2,
      fillColor: "pink",
      fillOpacity: 0.2,
    },
    interactive: false,
    renderer: L.canvas(),
  })//.addTo(map);

  /* ---------- 4. Fit map to combined bounds ---------- */
  const bounds = layer.getBounds();
  const buffered = L.latLngBounds(
    [bounds.getSouth() - padding, bounds.getWest() - padding],
    [bounds.getNorth() + padding, bounds.getEast() + padding]
  );
  // map.fitBounds(buffered, { animate: false, duration: 0 });

  /* ---------- 5. Wait until every tile is ready (≤1500 ms) ---------- */
  await new Promise(resolve => {
    let remaining = 0;

    const onStart = () => ++remaining;
    const onDone = () => (--remaining <= 0) && finish();

    const finish = () => {
      map.off("tileloadstart", onStart);
      map.off("tileload", onDone);
      map.off("tileerror", onDone);
      resolve();
    };

    map.on("tileloadstart", onStart);
    map.on("tileload", onDone);
    map.on("tileerror", onDone);

    setTimeout(finish, 1500); // fallback
  });

  /* ---------- 6. Grab the canvas ---------- */
  const fullCanvas = await screenshoter.takeScreen("canvas");

  /* ---------- 7. Crop to the buffered bounds ---------- */
  const nw = map.latLngToContainerPoint(buffered.getNorthWest());
  const se = map.latLngToContainerPoint(buffered.getSouthEast());

  const cropX = Math.floor(nw.x) + 2;
  const cropY = Math.floor(nw.y) + 2;
  const cropWidth = Math.ceil(se.x - nw.x) - 4;
  const cropHeight = Math.ceil(se.y - nw.y) - 4;

  const cropped = document.createElement("canvas");
  cropped.width = cropWidth;
  cropped.height = cropHeight;
  cropped.getContext("2d").drawImage(
    fullCanvas,
    cropX, cropY, cropWidth, cropHeight,
    0, 0, cropWidth, cropHeight
  );


  const croppedDataURL = cropped.toDataURL("image/png");
  const enriched = embedGeoJsonMeta(
    croppedDataURL,
    featureCollection,                 // the (re‑projected) GeoJSON you drew
    options.extraMeta                  // 👈 merge the caller’s extra keys
  );
  const dataURL = enriched;         // the PNG now carries embedded meta

  /* ---------- 8. Download if requested ---------- */
  if (download) {
    const a = document.createElement("a");
    a.href = dataURL;
    a.download = fileName;
    a.click();
  }

  /* ---------- 9. Clean up ---------- */
  layer.remove();
  screenshoter.remove();
  styleEl.remove();

  return {
    image: dataURL,
    center: {
      lat: buffered.getCenter().lat,
      lng: buffered.getCenter().lng,
    },
  };
}
