import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Auth/Login';
import Dashboard from './components/Dashboard/Dashboard';
import Inventory from './components/Inventory/Inventory';
import InventoryDetail from './components/Inventory/InventoryDetail';
import CreateInventory from './components/Inventory/CreateInventory';
import EditInventory from './components/Inventory/EditInventory';
import Categories from './components/Inventory/Categories';
import CreateCategory from './components/Inventory/CreateCategory';
import EditCategory from './components/Inventory/EditCategory';
import Requests from './components/Requests/Requests';
import CreateRequest from './components/Requests/CreateRequest';
import RequestDetail from './components/Requests/RequestDetail';
import UpdateRequestStatus from './components/Requests/UpdateRequestStatus';
import CollectRequest from './components/Requests/CollectRequest';
import DeletedRequests from './components/Requests/DeletedRequests';
import Purchases from './components/Purchases/Purchases';
import CreatePurchase from './components/Purchases/CreatePurchase';
import Reports from './components/Reports/Reports';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout/Layout';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/*" element={
              <ProtectedRoute>
                <Layout>
                  <Routes>
                    <Route path="/dashboard" element={<Dashboard />} />
                    
                    {/* Inventory Routes */}
                    <Route path="/inventory" element={<Inventory />} />
                    <Route path="/inventory/create" element={<CreateInventory />} />
                    <Route path="/inventory/:id" element={<InventoryDetail />} />
                    <Route path="/inventory/:id/edit" element={<EditInventory />} />
                    
                    {/* Category Routes */}
                    <Route path="/categories" element={<Categories />} />
                    <Route path="/categories/create" element={<CreateCategory />} />
                    <Route path="/categories/:id/edit" element={<EditCategory />} />
                    
                    {/* Request Routes */}
                    <Route path="/requests" element={<Requests />} />
                    <Route path="/requests/create" element={<CreateRequest />} />
                    <Route path="/requests/my" element={<Requests userOnly={true} />} />
                    <Route path="/requests/deleted" element={<DeletedRequests />} />
                    <Route path="/requests/:id" element={<RequestDetail />} />
                    <Route path="/requests/:id/status" element={<UpdateRequestStatus />} />
                    <Route path="/requests/:id/collect" element={<CollectRequest />} />
                    
                    {/* Purchase Routes */}
                    <Route path="/purchases" element={<Purchases />} />
                    <Route path="/purchases/new" element={<CreatePurchase />} />
                    
                    {/* Reports Routes */}
                    <Route path="/reports" element={<Reports />} />
                    
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  </Routes>
                </Layout>
              </ProtectedRoute>
            } />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="loading">Loading...</div>;
  }
  
  return user ? children : <Navigate to="/login" replace />;
}

export default App;