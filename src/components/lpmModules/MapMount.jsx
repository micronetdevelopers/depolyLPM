// MapMount.jsx
import React, { useLayoutEffect, useRef } from "react";
import { useMap } from "../../context/MapContext";

export default function MapMount({ style = { height: "90vh", width: "100%" } }) {
    const { mapRef, mapContainerRef,
        selectedBasemap,
        currentParcelLayer,
        setSelectedBasemap,
        mapLoading, setMapLoading,
        loadingWmsCount, setLoadingWmsCount, layerVisibility, setLayerVisibility,
        progress, setProgress, map, setMap } = useMap();
    useLayoutEffect(() => {
        let map = null;
        if (!mapContainerRef.current || mapRef.current) return;

        if (!mapContainerRef.current) {
            console.error("Error: Map container not found.");
            return;
        }

        if (!mapRef.current) {
            map = L.map(mapContainerRef.current, {
                scrollWheelZoom: true,
                minZoom: 3,
                maxZoom: 18,// after this zoom level tiles not load
                maxBounds: [
                    [-85, -180],
                    [85, 180],
                ],
                maxBoundsViscosity: 1.0,
            }).setView([21.5937, 79.9629], 4);
            mapRef.current = map;
        }

        const baseMaps = {
            "ESRI WorldImagery": L.tileLayer(
                "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
                {
                    maxZoom: 20,
                    zIndex: 1,
                }
            ),
            "Open Street Map": L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                maxZoom: 20,
                zIndex: 1,
            }),
            "Blank Map": L.tileLayer("", {
                noWrap: true,
                zIndex: 1,
            }),
        };

        const currentBaseMap = baseMaps["ESRI WorldImagery"];
        currentBaseMap.addTo(map);
        L.control.layers(baseMaps, null, { position: "topleft" }).addTo(map);

        // Basemap change event
        map.on("baselayerchange", (e) => {
            setSelectedBasemap(e.name);
            if (e.name === "Blank Map") {
                map.getContainer().style.backgroundColor = "white";
            } else {
                map.getContainer().style.backgroundColor = "";
            }
        });

        // Add WMS layer
        const wmsLayer = L.tileLayer.wms('http://192.168.1.139:8080/geoserver/LPMKPRATH/wms', {
            layers: 'LPMKPRATH:india_India_Country_Boundary',
            format: 'image/png',
            transparent: true,
            version: '1.1.0',
            zIndex: 5,
            tiled: true,
            crs: L.CRS.EPSG3857,
        });

        // 🔄 Add loading events
        // wmsLayer.on('loading', () => setMapLoading(true));
        // wmsLayer.on('load', () => setMapLoading(false));
        // wmsLayer.on('tileerror', () => setMapLoading(false)); // Fallback on error

        // wmsLayer.addTo(map);

        // Set loading and simulate progress
        wmsLayer.on('loading', () => {
            setMapLoading(true);
            setProgress(0);
            let percent = 0;
            const interval = setInterval(() => {
                percent += 10;
                setProgress(percent);
                if (percent >= 90) clearInterval(interval); // wait for actual 'load'
            }, 100);
        });

        wmsLayer.on('load', () => {
            setProgress(100);
            setTimeout(() => {
                setMapLoading(false);
                setProgress(0);
            }, 300); // small delay to show full bar
        });

        wmsLayer.on('tileerror', () => {
            setMapLoading(false);
            setProgress(0);
        });

        wmsLayer.addTo(map);

        const resizeObserver = new ResizeObserver(() => {
            if (mapRef.current) {
                mapRef.current.invalidateSize();
            }
        });
        resizeObserver.observe(mapContainerRef.current);

        // Disable propagation for toolbar buttons
        const buttonElements = document.querySelectorAll(".leaflet-pm-toolbar .button-container");
        buttonElements.forEach((button) => {
            L.DomEvent.disableClickPropagation(button);
        });
        setMap(map);

        // destroy the map **only** when the provider itself unmounts
        return () => {
            if (resizeObserver && mapContainerRef.current) {
                resizeObserver.unobserve(mapContainerRef.current);
            }
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }, [mapContainerRef.current]);

    return <div ref={mapContainerRef} style={style} />;
}