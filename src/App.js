import './App.css';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import Navbar from './Components/Navbar/Navbar';
import Footer from './Components/Footer/Footer';
import LoginSignup from './Pages/LoginSignup';
import LearningSpaces from './Pages/LearningSpaces';
import AdminPanel from './Pages/admin/admin';
import TechnicalTeamPanel from './Pages/technicalteam/technicalteam';
import { AuthProvider, useAuth } from './Context/AuthContext';
import { AppDataProvider } from './Context/AppDataContext';
import Home from './Pages/Home';
import Equiqment from './Pages/Equiqment';

// Layout wrapper to hide Navbar/Footer on login
function Layout({ children }) {
  const location = useLocation();
  const hideLayout = location.pathname === '/login';
  return (
    <>
      {!hideLayout && <Navbar />}
       <main className="main-content">
        {children}
      </main>
      {!hideLayout && <Footer />}
    </>
  );
}

// ProtectedRoute for authenticated or role-based access
function ProtectedRoute({ children, allowedRoles }) {
  const { user } = useAuth();
  console.log("ProtectedRoute user:", user);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

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
              <LearningSpaces />
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
