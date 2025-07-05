import React, { createContext, useRef, useContext, useState, useCallback, useLayoutEffect, useEffect } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// internal context
const MapContext = createContext(null);
// public hook
export const useMap = () => useContext(MapContext);


export const MapProvider = ({ children }) => {
    const mapRef = useRef(null);
    const [map, setMap] = useState(null);

    const [selectedBasemap, setSelectedBasemap] = useState("ESRI WorldImagery"); // Default Basemap
    const mapContainerRef = useRef(null);
    const [mapLoading, setMapLoading] = useState(true);
    const [loadingWmsCount, setLoadingWmsCount] = useState(0);
    const [progress, setProgress] = useState(0);
    const currentParcelLayer = useRef({
        village: null,
        selectedParcel: null,
        adjacentParcels: null,
    });
    const [layerVisibility, setLayerVisibility] = useState({
        village: true,
        selectedParcel: true,
        adjacentParcels: true
    });

    const contextValue = {
        map, setMap,
        mapRef,
        mapContainerRef,
        selectedBasemap,
        setSelectedBasemap,
        mapLoading, setMapLoading,
        loadingWmsCount, setLoadingWmsCount,
        progress, setProgress,
        currentParcelLayer, layerVisibility, setLayerVisibility
    };

    return <MapContext.Provider value={contextValue}>{children}</MapContext.Provider>;
};
