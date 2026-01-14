import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAppDispatch } from './hooks/useAppDispatch';
import { useSocket } from './hooks/useSocket';
import { getCurrentUser } from './store/authSlice';
import Navbar from './components/Navbar';
import NotificationContainer from './components/NotificationContainer';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import CreateGig from './pages/CreateGig';
import GigDetails from './pages/GigDetails';
import MyBids from './pages/MyBids';

function App() {
  const dispatch = useAppDispatch();

  // Initialize socket connection
  useSocket();

  useEffect(() => {
    // Check if user is already logged in
    dispatch(getCurrentUser());
  }, [dispatch]);

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <NotificationContainer />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/create-gig"
            element={
              <ProtectedRoute>
                <CreateGig />
              </ProtectedRoute>
            }
          />
          <Route
            path="/gig/:id"
            element={
              <ProtectedRoute>
                <GigDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-bids"
            element={
              <ProtectedRoute>
                <MyBids />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
