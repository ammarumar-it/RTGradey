import { useState, useEffect } from "react";
import { Routes, Route, useRoutes, Navigate } from "react-router-dom";
import routes from "tempo-routes";
import Home from "./components/pages/dashboard";
import Landing from "./components/pages/new-landing";
import LoginForm from "./components/auth/LoginForm";
import SignUpForm from "./components/auth/SignUpForm";
import Success from "./components/pages/success";
import Notifications from "./components/pages/notifications";
import Analytics from "./components/pages/analytics";
import Settings from "./components/pages/settings";
import Help from "./components/pages/help";
import Rubrics from "./components/pages/rubrics";
import Essays from "./components/pages/essays";
import Profile from "./components/pages/profile";
import { AuthProvider, useAuth } from "../supabase/auth";
import { Toaster } from "./components/ui/toaster";

function App() {
  // Add Tempo routes if in Tempo environment
  const tempoRoutes = import.meta.env.VITE_TEMPO && useRoutes(routes);

  return (
    <AuthProvider>
      {/* Tempo routes */}
      {tempoRoutes}

      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/dashboard" element={<Home />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/signup" element={<SignUpForm />} />
        <Route path="/success" element={<Navigate to="/dashboard" replace />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/help" element={<Help />} />
        <Route path="/rubrics" element={<Rubrics />} />
        <Route path="/essays" element={<Essays />} />
        <Route path="/profile" element={<Profile />} />
        <Route
          path="/auth/callback"
          element={<Navigate to="/dashboard" replace />}
        />

        {/* Add this before the catchall route */}
        {import.meta.env.VITE_TEMPO && <Route path="/tempobook/*" />}
      </Routes>
      <Toaster />
    </AuthProvider>
  );
}

export default App;
