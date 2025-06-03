// Completely New AppWrapper.tsx

// Instead of importing from App.tsx, recreate the basic structure:
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Success from './pages/Success';
import Cancel from './pages/Cancel';
import AccountDetails from './pages/AccountDetails';
import LanguageSettings from './pages/LanguageSettings';
import NotificationSettings from './pages/NotificationSettings';
import Legal from './pages/Legal';
import Home from './pages/Home'; // We'll need to create this file

function AppWrapper() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/success" element={<Success />} />
        <Route path="/cancel" element={<Cancel />} />
        <Route path="/account" element={<AccountDetails />} />
        <Route path="/settings/language" element={<LanguageSettings />} />
        <Route path="/settings/notifications" element={<NotificationSettings />} />
        <Route path="/settings/legal" element={<Legal />} />
        <Route path="/" element={<Home />} />
      </Routes>
    </Router>
  );
}

export default AppWrapper;