import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Home from '@/pages/Home';
import Analyze from '@/pages/Analyze';
import Results from '@/pages/Results';
import './App.css';

import { analytics } from '@/lib/analytics';

function TelemetryRouteListener() {
  const location = useLocation();

  useEffect(() => {
    analytics.page(location.pathname, { search: location.search });
  }, [location.pathname, location.search]);

  return null;
}

function App() {
  return (
    <BrowserRouter>
      <TelemetryRouteListener />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/analyze" element={<Analyze />} />
        <Route path="/results" element={<Results />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
