
import { Routes, Route, Outlet, Navigate } from "react-router-dom";

// Employee components
import Header from "./components/Header.jsx";
import Sidebar from "./components/Sidebar.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

// HR components
import HRHeader from "./components/HRHeader.jsx";
import HRSidebar from "./components/HRSidebar.jsx";
import HRProtectedRoute from "./components/HRProtectedRoute.jsx";

// Authentication contexts
import { useAuth } from "./contexts/AuthContext";
import {
  HRAuthProvider,
  useHRAuth,
} from "./contexts/HRAuthContext";

// Employee pages
import LoginPage from "./pages/LoginPage.jsx";
import ChangePasswordPage from "./pages/ChangePasswordPage.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import SkillsPage from "./pages/SkillsPage.jsx";

// HR pages
import HRDashboard from "./pages/HRDashboard.jsx";
import HRBiasAudit from "./pages/HRBiasAudit.jsx";


// ==================================================
// PLACEHOLDER PAGES
// ==================================================

function PlaceholderPage({ title, description }) {
  return (
    <div className="flex min-h-full items-center justify-center bg-slate-50 px-6">
      <div className="w-full max-w-lg rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-slate-200">

        <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
          Inclusive Talent Navigator
        </p>

        <h1 className="mt-3 text-2xl font-semibold text-slate-900">
          {title}
        </h1>

        <p className="mt-3 text-sm leading-6 text-slate-600">
          {description}
        </p>

      </div>
    </div>
  );
}


// ==================================================
// EMPLOYEE APPLICATION LAYOUT
// ==================================================

function AppLayout() {
  return (
    <div className="flex h-screen flex-col overflow-hidden">

      {/* Employee Header */}
      <div className="z-50 h-16 shrink-0">
        <Header />
      </div>

      <div className="relative flex min-h-0 flex-1 overflow-hidden">

        {/* Employee Sidebar */}
        <Sidebar />

        {/* Employee Main Content */}
        <main className="min-h-0 w-full flex-1 overflow-y-auto lg:ml-60">
          <Outlet />
        </main>

      </div>
    </div>
  );
}


// ==================================================
// HR APPLICATION LAYOUT
// ==================================================

function HRLayout() {
  return (
    <div className="flex h-screen flex-col overflow-hidden">

      {/* HR Header */}
      <div className="z-50 h-16 shrink-0">
        <HRHeader />
      </div>

      <div className="relative flex min-h-0 flex-1 overflow-hidden">

        {/* HR Sidebar */}
        <HRSidebar />

        {/* HR Main Content */}
        <main className="min-h-0 w-full flex-1 overflow-y-auto">
          <Outlet />
        </main>

      </div>
    </div>
  );
}


// ==================================================
// PUBLIC LOGIN ROUTE
// ==================================================

function LoginRoute() {
  const {
    employee,
    loading: employeeLoading,
  } = useAuth();

  const {
    hr,
    loading: hrLoading,
  } = useHRAuth();

  // Wait until both authentication contexts
  // finish restoring their sessions.
  if (employeeLoading || hrLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-sm text-slate-500">
          Checking session...
        </p>
      </div>
    );
  }

  // HR users go to the HR workspace.
  if (hr) {
    return <Navigate to="/hr/dashboard" replace />;
  }

  // Employee users go to the employee workspace.
  if (employee) {
    return (
      <Navigate
        to={
          employee.must_change_password
            ? "/change-password"
            : "/dashboard"
        }
        replace
      />
    );
  }

  return <LoginPage />;
}


// ==================================================
// EMPLOYEE PASSWORD CHANGE ROUTE
// ==================================================

function PasswordChangeRoute() {
  const {
    employee,
    loading,
  } = useAuth();

  if (loading) return null;

  if (!employee) {
    return <Navigate to="/" replace />;
  }

  if (!employee.must_change_password) {
    return <Navigate to="/dashboard" replace />;
  }

  return <ChangePasswordPage />;
}


// ==================================================
// APPLICATION ROUTES
// ==================================================

function AppRoutes() {
  return (
    <Routes>

      {/* ==================================================
          PUBLIC LOGIN
          ================================================== */}

      <Route
        path="/"
        element={<LoginRoute />}
      />


      {/* ==================================================
          EMPLOYEE PASSWORD CHANGE
          ================================================== */}

      <Route
        path="/change-password"
        element={<PasswordChangeRoute />}
      />


      {/* ==================================================
          EMPLOYEE WORKSPACE
          ================================================== */}

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>

          {/* Employee Dashboard */}
          <Route
            path="/dashboard"
            element={<Dashboard />}
          />

          {/* Skills Discovery */}
          <Route
            path="/skills"
            element={<SkillsPage />}
          />

          {/* Role Matching */}
          <Route
            path="/matching"
            element={
              <PlaceholderPage
                title="Role Matching"
                description="Recommended internal roles will appear here after employee skill confirmation."
              />
            }
          />

          {/* Employee Fairness Review */}
          <Route
            path="/bias-audit"
            element={
              <PlaceholderPage
                title="Fairness Review"
                description="Fairness signals and human review will be implemented in the next stage."
              />
            }
          />

          {/* Learning Path */}
          <Route
            path="/learning"
            element={
              <PlaceholderPage
                title="Learning Path"
                description="Recommended learning opportunities will appear here."
              />
            }
          />

          {/* Audit Log */}
          <Route
            path="/audit-log"
            element={
              <PlaceholderPage
                title="Audit Log"
                description="The audit trail for AI actions and employee confirmations will appear here."
              />
            }
          />

        </Route>
      </Route>


      {/* ==================================================
          HR PARTNER WORKSPACE
          ================================================== */}

      <Route element={<HRProtectedRoute />}>
        <Route element={<HRLayout />}>

          {/* HR Dashboard */}
          <Route
            path="/hr/dashboard"
            element={<HRDashboard />}
          />

          {/* HR Bias Audit */}
          <Route
            path="/hr/bias-audit"
            element={<HRBiasAudit />}
          />

        </Route>
      </Route>


      {/* ==================================================
          UNKNOWN ROUTES
          ================================================== */}

      <Route
        path="*"
        element={<Navigate to="/" replace />}
      />

    </Routes>
  );
}


// ==================================================
// MAIN APPLICATION
// ==================================================

function App() {
  return (
    <HRAuthProvider>
      <AppRoutes />
    </HRAuthProvider>
  );
}

export default App;
