import { Routes, Route, Navigate } from "react-router-dom";
import PublicLayout from "../layout/publicLayout/PublicLayout";
import Home from "../pages/home/Home";
import Categories from "../pages/categories/Categories";
import Services from "../pages/services/Services";
import ServiceDetail from "../pages/services/ServiceDetail";
import Events from "../pages/events/Events";
import EventDetail from "../pages/events/EventDetail";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Layout Routes */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/services" element={<Services />} />
        <Route path="/services/:id" element={<ServiceDetail />} />
        <Route path="/events" element={<Events />} />
        <Route path="/events/:id" element={<EventDetail />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
