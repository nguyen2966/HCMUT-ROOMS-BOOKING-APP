import './App.css';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import Navbar from './Components/Navbar/Navbar';
import Footer from './Components/Footer/Footer';
import LoginSignup from './Pages/LoginSignup';
import Rooms from './Pages/Rooms';
import AdminPanel from './Pages/admin/admin';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </div>
  );
}

// Inner component so we can use React Router hooks
function AppContent() {
  const location = useLocation();

  // Hide Navbar and Footer on the login page
  const hideLayout = location.pathname === '/login';

  return (
    <>
      {!hideLayout && <Navbar />}
      
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginSignup />} />
        <Route path="/rooms" element={<Rooms />} />
        <Route path="/admin" element={<AdminPanel/>}/>
      </Routes>

      {!hideLayout && <Footer />}
    </>
  );
}

export default App;
