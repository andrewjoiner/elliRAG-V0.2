import { Suspense } from "react";
import { useRoutes, Routes, Route } from "react-router-dom";
import Home from "./components/home";
import routes from "tempo-routes";
import DocumentsPage from "./pages/Documents.tsx";
import ConfigurationPage from "./pages/Configuration.tsx";
import AnalyticsPage from "./pages/Analytics.tsx";

function App() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <div className="dark">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/documents" element={<DocumentsPage />} />
          <Route path="/config" element={<ConfigurationPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
        </Routes>
        {import.meta.env.VITE_TEMPO === "true" && useRoutes(routes)}
      </div>
    </Suspense>
  );
}

export default App;
