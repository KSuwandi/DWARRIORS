import {
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import InventoryPage from "./pages/InventoryPage";
import FinancePage from "./pages/FinancePage";
import MembersPage from "./pages/MembersPage";
import { useAuth } from "./contexts/AuthContext";
import CraftingPage from "./pages/CraftingPage";
import CraftingRequestsPage from "./pages/CraftingRequestsPage";
import CraftingLogsPage from "./pages/CraftingLogsPage";
import ProfilePage from "./pages/ProfilePage";
import NotificationsPage from "./pages/NotificationsPage";
import RecycleBinPage from "./pages/RecycleBinPage";
import InventoryApprovalPage from "./pages/InventoryApprovalPage";
import ActivityLogsPage from "./pages/ActivityLogsPage";
import RequestsPage from "./pages/RequestsPage";
import FinanceApprovalPage from "./pages/FinanceApprovalPage";
export default function App() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route
        path="/"
        element={<HomePage />}
      />

      <Route
        path="/login"
        element={
          user ? (
            <Navigate to="/dashboard" />
          ) : (
            <LoginPage />
          )
        }
      />

      <Route
        path="/dashboard"
        element={
          user ? (
            <DashboardPage />
          ) : (
            <Navigate to="/login" />
          )
        }
      />

      <Route
        path="/inventory"
        element={
          user ? (
            <InventoryPage />
          ) : (
            <Navigate to="/login" />
          )
        }
      />

      <Route
        path="/finance"
        element={
          user ? (
            <FinancePage />
          ) : (
            <Navigate to="/login" />
          )
        }
      />

      <Route
      path="/members"
      element={<MembersPage />}
    />

    <Route
      path="/crafting"
    element={<CraftingPage />}
    />

    <Route
  path="/crafting-requests"
  element={<CraftingRequestsPage />}
/>

    <Route
      path="/crafting-logs"
      element={<CraftingLogsPage />}
    />

        <Route
  path="/profile"
  element={<ProfilePage />}
/>

        <Route
    path="/notifications"
    element={<NotificationsPage />}
  />

        <Route
  path="/recycle-bin"
  element={<RecycleBinPage />}
/>

    <Route
      path="/inventory-approval"
      element={<InventoryApprovalPage />}
    />

    <Route
      path="/activity-logs"
      element={<ActivityLogsPage />}
    />
    <Route
  path="/requests"
  element={<RequestsPage />}
/>

        <Route
  path="/finance-approval"
  element={<FinanceApprovalPage />}
/>
    </Routes>
  );
}