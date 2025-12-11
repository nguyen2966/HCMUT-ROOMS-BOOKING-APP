import './App.css';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import Navbar from './Components/Navbar/Navbar';
import Footer from './Components/Footer/Footer';
import LoginSignup from './Pages/LoginSignup';
import AdminPanel from './Pages/admin/admin';
import TechnicalTeamPanel from './Pages/technicalteam/technicalteam';
import { AuthProvider, useAuth } from './Context/AuthContext';
import { AppDataProvider } from './Context/AppDataContext';
import Home from './Pages/Home';
import Equiqment from './Pages/Equiqment';
import Rooms from './Pages/Rooms';

// Layout wrapper to hide Navbar/Footer on login
function Layout({ children }) {
  const location = useLocation();
  const hideLayout = location.pathname === '/login';
  return (
    <>
      {!hideLayout && <Navbar />}
       <main className={`main-content ${hideLayout ? 'no-navbar' : ''}`}>
        {children}
      </main>
      {!hideLayout && <Footer />}
    </>
  );
}

// ProtectedRoute for authenticated or role-based access
// ProtectedRoute for authenticated or role-based access
function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();

  // Show loading screen while checking auth
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        fontSize: '18px',
        color: '#666'
      }}>
        Loading...
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check role-based access
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/home" replace />;
  }

  return children;
}

function AppContent() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginSignup />} />
        <Route 
          path="/rooms" 
          element={
            <ProtectedRoute>
              <Rooms />
            </ProtectedRoute>
          } 
        />
          <Route 
          path="/equiqment" 
          element={
            <ProtectedRoute>
              <Equiqment />
            </ProtectedRoute>
          } 
        />
        <Route
          path = "/home"
          element={
            <ProtectedRoute>
              <Home/>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <AdminPanel />
            </ProtectedRoute>
          }
        />
        <Route
          path="/technicalteam"
          element={
            <ProtectedRoute allowedRoles={["Technical Team"]}>
              <TechnicalTeamPanel />
            </ProtectedRoute>
          }
        />

      </Routes>
    </Layout>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppDataProvider>
         <BrowserRouter>
          <AppContent />
         </BrowserRouter>
      </AppDataProvider>
    </AuthProvider>
  );
}

export default App;
