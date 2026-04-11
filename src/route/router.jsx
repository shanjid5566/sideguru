import { Routes, Route, Navigate } from "react-router-dom";
import PublicLayout from "../layout/publicLayout/PublicLayout";
import Home from "../pages/home/Home";
import Categories from "../pages/categories/Categories";
import Services from "../pages/services/Services";
import ServiceDetail from "../pages/services/ServiceDetail";
import Events from "../pages/events/Events";
import EventDetail from "../pages/events/EventDetail";
import About from "../pages/about/About";
import ContactUs from "../pages/contact/ContactUs";
import Privacy from "../pages/privacy/Privacy";
import SafetyGuide from "../pages/safety/SafetyGuide";
import Login from "../pages/login/Login";
import Signup from "../pages/login/Signup";
import ForgotPassword from "../pages/login/ForgotPassword";
import OTPVerification from "../pages/login/OTPVerification";
import VerifyRegistrationOTP from "../pages/login/VerifyRegistrationOTP";
import ResetPassword from "../pages/login/ResetPassword";
import Profile from "../pages/profile/Profile";
import ManageEvents from "../pages/profile/my-events/ManageEvents";
import EventPurchaseSuccess from "../pages/profile/my-events/EventPurchaseSuccess";
import ManageServices from "../pages/profile/my-services/ManageServices";
import ServicePurchaseSuccess from "../pages/profile/my-services/ServicePurchaseSuccess";
import AccountSettings from "../pages/profile/my-account/AccountSettings";
import { UserRoute } from "../context/ProtectedRoutes";

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
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<ContactUs />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/safety-guide" element={<SafetyGuide />} />
        <Route
          path="/profile"
          element={
            <UserRoute>
              <Profile />
            </UserRoute>
          }
        />
        <Route
          path="/profile/my-events"
          element={
            <UserRoute>
              <ManageEvents />
            </UserRoute>
          }
        />
        <Route
          path="/profile/my-events/purchase-success"
          element={
            <UserRoute>
              <EventPurchaseSuccess />
            </UserRoute>
          }
        />
        <Route
          path="/profile/my-services"
          element={
            <UserRoute>
              <ManageServices />
            </UserRoute>
          }
        />
        <Route
          path="/profile/my-services/purchase-success"
          element={
            <UserRoute>
              <ServicePurchaseSuccess />
            </UserRoute>
          }
        />
        <Route
          path="/profile/account"
          element={
            <UserRoute>
              <AccountSettings />
            </UserRoute>
          }
        />
      </Route>
      {/* Authentication */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route
        path="/verify-registration-otp"
        element={<VerifyRegistrationOTP />}
      />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/otp-verification" element={<OTPVerification />} />
      <Route path="/reset-password" element={<ResetPassword />} />
    </Routes>
  );
};

export default AppRoutes;
