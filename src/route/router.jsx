import { Routes, Route, Navigate } from "react-router-dom";
import PublicLayout from "../layout/publicLayout/PublicLayout"
import Home from "../pages/home/Home";

const AppRoutes = () => {
  return (
    <Routes>

      {/* Public Layout Routes */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        </Route>
    </Routes>
  )
}

export default AppRoutes