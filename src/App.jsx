

import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ParentCompLpmKprath from './components/lpmModules/ParentCompLpmKprath'
import './App.css'
import { MapProvider } from './context/MapContext';
import CreateAdminUserForm from './pages/form/UserForm';
import CreatePassword from './pages/form/CreatePassword';
import Login from './pages/form/Login';
import Signup from './pages/form/Signup';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout/Layout';
import { AuthProvider } from './context/AuthContext';
import { useSelector } from 'react-redux';
import { store } from './features/store/index';
import { restoreAuth } from './features/store/authSlice';
import CreateAdminForm from './pages/form/CreateAdminForm';
import ApplicationForm from './components/lpmModules/ApplicationForm';
import { Toaster } from 'react-hot-toast';
import Home from './pages/Home';
import { AdminDash } from './pages/management/AdminDash';
import { SuperuserDash } from './pages/management/SuperuserDash';
import UserDash from './pages/management/UserDash';
import GeneralUserDash from './pages/management/GeneralUserDash';
import ForgotPasswprd from './pages/form/ForgotPasswprd';



function App() {

  const { Role, isAuthenticated } = useSelector((state) => state.auth)

  const [rehydrated, setRehydrated] = useState(false);

  useEffect(() => {
    store.dispatch(restoreAuth());
    setRehydrated(true);
  }, []);

  if (!rehydrated) {
    // Optionally show a loading spinner here
    return null;
  }


  return (
    <>

      <Router>
        <MapProvider>
          <Routes>
            <Route path="/modules/:appName?" element={<ParentCompLpmKprath />} />
            <Route path="/modules/applicationForm" element={<ApplicationForm />} />
            <Route path="/sign-up" element={<Signup />} />
            <Route path="/create-password/:id*" element={<CreatePassword />} />
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPasswprd />} />
            <Route path="/" element={<Home />} />
            {/* <Route path="/" element={<Navigate to="/dashboard" replace />} /> */}

            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Layout />}>
                <Route index element={<Dashboard />} />
                <Route
                  path="users"
                  element={
                    Role === "SU" ? (
                      <SuperuserDash />
                    ) : Role === "AU" ? (
                      <AdminDash />
                    ) : Role === "UU" ? (
                      <UserDash />
                    ) : Role === "GU" ? (
                      <GeneralUserDash />
                    ) : (
                      <div>Unauthorized</div>
                    )
                  }
                />
                <Route path="sign-up-admin" element={<CreateAdminForm />} />
              </Route>
            </Route>
          </Routes>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#1F2937',
                color: '#F9FAFB',
                border: '1px solid #374151',
              },
              success: {
                iconTheme: {
                  primary: '#10B981',
                  secondary: '#F9FAFB',
                },
              },
              error: {
                iconTheme: {
                  primary: '#EF4444',
                  secondary: '#F9FAFB',
                },
              },
            }}
          />
        </MapProvider>
      </Router>
    </>

  )
}

export default App;