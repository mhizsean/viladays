import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { AdminRoute, ProtectedRoute, UserOnlyRoute } from "./components/ProtectedRoute";
import EventsPage from "./pages/EventsPage";
import ItineraryPage from "./pages/ItineraryPage";
import { Layout } from "./components/Layout";
import AdminPage from "./pages/AdminPage";
import CalendarPage from "./pages/CalendarPage";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout>
                <EventsPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-trips"
          element={
            <UserOnlyRoute>
              <Layout>
                <ItineraryPage />
              </Layout>
            </UserOnlyRoute>
          }
        />
        <Route
          path="/calendar"
          element={
            <UserOnlyRoute>
              <Layout>
                <CalendarPage />
              </Layout>
            </UserOnlyRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <Layout>
                <AdminPage />
              </Layout>
            </AdminRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
