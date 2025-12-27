import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Equipment from './pages/Equipment';
import WorkCenters from './pages/WorkCenters';
import Requests from './pages/Requests';
import AddEquipmentCategory from './pages/AddEquipmentCategory';
import Calendar from './pages/Calendar';
import Teams from './pages/Teams';
import './App.css';

const PrivateRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    return token ? children : <Navigate to="/login" />;
};

const Navbar = () => {
  const token = localStorage.getItem('token');
  if (!token) return null;
  
  return (
    <nav className="navbar">
      <div className="nav-brand">GearGuard</div>
      <div className="nav-links">
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/equipment">Equipment</Link>
        <Link to="/work-centers">Work Centers</Link>
        <Link to="/requests">Requests</Link>
        <Link to="/calendar">Calendar</Link>
        <Link to="/teams">Teams</Link>
        <Link to="/add-equipment-category">Add Category</Link>
      </div>
    </nav>
  );
};

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route 
            path="/dashboard" 
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/equipment" 
            element={
              <PrivateRoute>
                <Equipment />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/work-centers" 
            element={
              <PrivateRoute>
                <WorkCenters />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/requests" 
            element={
              <PrivateRoute>
                <Requests />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/add-equipment-category" 
            element={
              <PrivateRoute>
                <AddEquipmentCategory />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/calendar" 
            element={
              <PrivateRoute>
                <Calendar />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/teams" 
            element={
              <PrivateRoute>
                <Teams />
              </PrivateRoute>
            } 
          />
          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
