import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import SimplifiedAdvisory from './pages/SimplifiedAdvisory';
import DiseaseDetection from './pages/DiseaseDetection';
import DiseaseHistory from './pages/DiseaseHistory';
import MarketPrices from './pages/MarketPrices';
import Farms from './pages/Farms';
import CropRecommendation from './pages/CropRecommendation';
import IrrigationScheduler from './pages/IrrigationScheduler';
import PestAlerts from './pages/PestAlerts';
import YieldPrediction from './pages/YieldPrediction';
import PriceForecast from './pages/PriceForecast';
import FarmMap from './pages/FarmMap';
import ReportExport from './pages/ReportExport';
import SoilLabLocator from './pages/SoilLabLocator';
import Roadmap from './pages/Roadmap';
import Navbar from './components/Navbar';

const authPages = ['/', '/login', '/register'];

// Wraps page content with a mount animation
function AnimatedPage({ children }) {
  const location = useLocation();
  const [key, setKey] = useState(location.pathname);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (location.pathname !== key) {
      setVisible(false);
      const timer = setTimeout(() => {
        setKey(location.pathname);
        setVisible(true);
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [location.pathname, key]);

  return (
    <div
      key={key}
      className={visible ? 'page-enter' : ''}
      style={{
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.15s ease',
      }}
    >
      {children}
    </div>
  );
}

function AppLayout() {
  const location = useLocation();
  const isAuth = authPages.includes(location.pathname);

  if (isAuth) {
    return (
      <AnimatedPage>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </AnimatedPage>
    );
  }

  return (
    <div className="min-h-screen bg-[#f0f4f3]">
      <Navbar />
      <div className="lg:ml-[260px] pt-0">
        <AnimatedPage>
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/advisory" element={<SimplifiedAdvisory />} />
            <Route path="/disease-detection" element={<DiseaseDetection />} />
            <Route path="/disease-history" element={<DiseaseHistory />} />
            <Route path="/market-prices" element={<MarketPrices />} />
            <Route path="/farms" element={<Farms />} />
            <Route path="/crop-recommend" element={<CropRecommendation />} />
            <Route path="/irrigation" element={<IrrigationScheduler />} />
            <Route path="/pest-alerts" element={<PestAlerts />} />
            <Route path="/yield-prediction" element={<YieldPrediction />} />
            <Route path="/price-forecast" element={<PriceForecast />} />
            <Route path="/farm-map" element={<FarmMap />} />
            <Route path="/reports" element={<ReportExport />} />
            <Route path="/soil-labs" element={<SoilLabLocator />} />
            <Route path="/roadmap" element={<Roadmap />} />
          </Routes>
        </AnimatedPage>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppLayout />
    </Router>
  );
}

export default App;
