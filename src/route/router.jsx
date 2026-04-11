import { Routes, Route, Navigate } from "react-router-dom";
import PublicLayout from "../layout/publicLayout/PublicLayout";
import Home from "../pages/home/Home";
import Categories from "../pages/categories/Categories";
import Services from "../pages/services/Services";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Layout Routes */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/categories" element={<Categories />} />
                <Route path="/services" element={<Services />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
