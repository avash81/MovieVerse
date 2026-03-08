import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import Home from "./components/Home";
import MovieDetails from "./components/MovieDetails";
import MovieDetailsEnhanced from "./components/MovieDetailsEnhanced";
import MoviePage from "./pages/MoviePage";
import GenrePage from "./pages/GenrePage";
import YearPage from "./pages/YearPage";
import AIAutomation from "./components/AIAutomation";
import TaskAutomation from "./components/TaskAutomation";
import HDHub4U from "./components/HDHub4U";
import AutoPilot from "./components/AutoPilot";

function App() {
  return (
    <HelmetProvider>
      <Router>
        <Routes>
          {/* SEO-Optimized Routes */}
          <Route path="/" element={<HDHub4U />} />
          <Route path="/movie/:slug" element={<MovieDetailsEnhanced />} />
          <Route path="/genre/:genre" element={<GenrePage />} />
          <Route path="/year/:year" element={<YearPage />} />

          {/* Legacy Routes */}
          <Route
            path="/movies/:source/:externalId"
            element={<MovieDetails />}
          />

          {/* Admin Routes */}
          <Route path="/ai-automation" element={<AIAutomation />} />
          <Route path="/task-automation" element={<TaskAutomation />} />
          <Route path="/auto-pilot" element={<AutoPilot />} />
          <Route path="/admin" element={<Home />} />
        </Routes>
      </Router>
    </HelmetProvider>
  );
}

export default App;
