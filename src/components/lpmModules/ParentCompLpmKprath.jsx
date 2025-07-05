import React, { useEffect, useState, Suspense, lazy, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  PanelGroup, Panel, PanelResizeHandle
} from 'react-resizable-panels';
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import MapMount from './MapMount'
import { useMap } from "../../context/MapContext"; // Import the context
import { Spin } from 'antd';
import MapContent from './mapContent/MapContent';
import { Navigate } from 'react-router-dom';
import { CircleArrowLeft } from 'lucide-react';


// Lazy components
const LpmKprathPanel = lazy(() => import('./apps/LpmKprathPanel'));
const ApplicationForm = lazy(() => import('./ApplicationForm'));
const SettingsPanel = lazy(() => import('./apps/SettingsPanel'));

const appComponents = {
  LpmKprathPanel: { name: 'Lpm:Kprath', component: LpmKprathPanel },
  ApplicationForm: { name: 'Application Form', component: ApplicationForm },
  settings: { name: 'Settings Panel', component: SettingsPanel },
};

const LpmKprathDashBord = () => {
  const { appName } = useParams();
  const navigate = useNavigate();
  const { mapRef,
    mapContainerRef,
    selectedBasemap,
    setSelectedBasemap,
    mapLoading, setMapLoading,
    loadingWmsCount, setLoadingWmsCount,
    progress, setProgress } = useMap();
  const currentParcelLayer = useRef(null);
  // const [layerVisibility, setLayerVisibility] = useState({
  //   village: true,
  //   selectedParcel: true,
  //   adjacentParcels: true
  // });

  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [selectedParcel, setSelectedParcel] = useState(null);
  const [selectedTaluka, setSelectedTaluka] = useState(null);
  const [selectedVillage, setSelectedVillage] = useState(null);
  const [selectedState, setSelectedState] = useState(null);
  const [activeApp, setActiveApp] = useState(appName || localStorage.getItem('lastApp') || null);
  const [showRightPanel, setShowRightPanel] = useState(!!activeApp); // show Lpm:Kprath only if there's active app

  useEffect(() => {
    if (appName !== activeApp) {
      setActiveApp(appName || null);
      setShowRightPanel(!!appName); // show Lpm:Kprath only if appName exists
    }
  }, [appName]);

  useEffect(() => {
    if (activeApp) {
      localStorage.setItem('lastApp', activeApp);
      setShowRightPanel(true); // show panel when activeApp changes
    } else {
      localStorage.removeItem('lastApp');
      setShowRightPanel(false); // hide Lpm:Kprath if no active app
    }
  }, [activeApp]);

  const handleTabClick = (key) => navigate(`/modules/${key}`);

  // Close Lpm:Kprath and clear active app
  const handleCloseRightPanel = () => {
    setActiveApp(null);
    setShowRightPanel(false);
    navigate('/modules');
  };

  const Component = activeApp ? appComponents[activeApp]?.component : null;
  return (
    <div >
      <div className="bg-white overflow-hidden flex flex-col">

        {/* Header */}
        <header className="h-14 bg-gray-800 text-white flex items-center justify-between px-6 text-lg font-semibold">
          Lpm
          <div className="space-x-2 text-sm">
            {Object.entries(appComponents).map(([key, { name }]) => (
              <button
                key={key}
                onClick={() => handleTabClick(key)}
                className={`px-3 py-1 rounded ${activeApp === key ? 'bg-blue-600' : 'bg-blue-500 hover:bg-blue-600'
                  }`}
              >
                {name}
              </button>
            ))}
          </div>
        </header>

        {/* Resizable Panels */}
        <div className="flex-1">
          <PanelGroup direction="horizontal">
            {/* Map Content */}
            <Panel defaultSize={showRightPanel ? 15 : 30} minSize={10}>
              <div className="h-full bg-gray-200">
                <div className="flex items-center justify-between px-4 py-2 bg-gray-300 font-medium text-sm border-b">
                  <span>Map Content</span>
                </div>
                <MapContent selectedParcel={selectedParcel}
                  setSelectedParcel={setSelectedParcel}
                  selectedDistrict={selectedDistrict}
                  setSelectedDistrict={setSelectedDistrict}
                  selectedTaluka={selectedTaluka}
                  setSelectedTaluka={setSelectedTaluka}
                  selectedVillage={selectedVillage}
                  setSelectedVillage={setSelectedVillage}
                  selectedBasemap={selectedBasemap}
                  selectedState={selectedState}
                  setSelectedState={setSelectedState}
                // layerVisibility={layerVisibility}
                // setLayerVisibility={setLayerVisibility}
                />
              </div>
            </Panel>

            <PanelResizeHandle className="w-1 bg-gray-400 cursor-col-resize" />

            {/* Map */}
            <Panel defaultSize={showRightPanel ? 60 : 70} minSize={10}>
              <div className="h-full bg-white">
                <div className="flex items-center justify-between px-4 py-2 bg-gray-100 font-medium text-sm border-b">
                  <span>Map</span>
                </div>
                {mapLoading && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundColor: 'rgb(255 255 255 / 18%)',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      zIndex: 9999,
                    }}
                  >
                    <Spin size="large" />
                  </div>
                )}
                <MapMount style={{ height: "90vh", width: "100%" }} />
                {/* <div ref={mapContainerRef} id="LPMmap" style={{ height: "90vh", width: "100%" }} >
                  {mapLoading && (
                    <div
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgb(255 255 255 / 18%)',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        zIndex: 9999,
                      }}
                    >
                      <Spin size="large" />
                    </div>
                  )}
                </div> */}
                {/* Progress Bar at the Top of the Map */}
                {/* <div ref={mapContainerRef} id="LPMmap" style={{ height: "90vh", width: "100%" }}>
                  {mapLoading && (
                    <div
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        height: '4px',
                        width: `${progress}%`,
                        backgroundColor: '#1890ff',
                        transition: 'width 0.2s ease',
                        zIndex: 9999,
                      }}
                    />
                  )}
                </div> */}

              </div>
            </Panel>

            {/* Conditionally render Lpm:Kprath only if visible */}
            {showRightPanel && (
              <>
                <PanelResizeHandle className="w-1 bg-gray-400 cursor-col-resize" />

                <Panel defaultSize={20} minSize={10}>
                  <div className="h-full bg-gray-100 flex flex-col">
                    <div className="flex items-center justify-between px-4 py-2 bg-gray-200 font-medium text-sm border-b">
                      <span>
                        {activeApp === "ApplicationForm" ? "Application form" : "Lpm:Kprath"}
                      </span>
                      <button
                        className="text-red-600 hover:text-red-800"
                        onClick={handleCloseRightPanel}
                        aria-label="Close Lpm:Kprath"
                      >
                        ✕
                      </button>
                    </div>
                    <div className="p-4 overflow-auto transition-all duration-500 ease-in-out flex-grow">
                      {Component ? (
                        <Suspense fallback={<div className="text-center">Loading...</div>}>
                          {(() => {
                            if (activeApp === 'LpmKprathPanel') {
                              return (
                                <Component
                                  selectedParcel={selectedParcel}
                                  setSelectedParcel={setSelectedParcel}
                                  selectedDistrict={selectedDistrict}
                                  setSelectedDistrict={setSelectedDistrict}
                                  selectedTaluka={selectedTaluka}
                                  setSelectedTaluka={setSelectedTaluka}
                                  selectedVillage={selectedVillage}
                                  setSelectedVillage={setSelectedVillage}
                                  selectedBasemap={selectedBasemap}
                                  selectedState={selectedState}
                                  setSelectedState={setSelectedState}
                                  mapRef={mapRef}
                                // layerVisibility={layerVisibility}
                                // setLayerVisibility={setLayerVisibility}
                                />
                              );
                            } else if (activeApp === 'ApplicationForm') {
                              return <Navigate to="/modules/applicationForm" replace />;
                              // return <Component />;
                              return null;
                            } else if (activeApp === 'settings') {
                              return <Component />;
                            }
                          })()}
                        </Suspense>
                      ) : (
                        <div className="text-center text-gray-400 mt-20">No application open</div>
                      )}

                    </div>
                  </div>
                </Panel>
              </>
            )}
          </PanelGroup>
        </div>
      </div>
    </div>
  );
};


export default LpmKprathDashBord;
