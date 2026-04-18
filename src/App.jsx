import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import RoomDetail from './pages/RoomDetail';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import UserDashboard from './pages/UserDashboard';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/kamar/:tipe" element={<RoomDetail />} />
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/user" element={<UserDashboard />} />
      </Routes>
    </Router>
  );
};

export default App;