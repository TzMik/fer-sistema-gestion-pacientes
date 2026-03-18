import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Login from './components/Login';
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import PatientList from './pages/patients/PatientList';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route 
            path="/*" 
            element={
              <PrivateRoute>
                <Layout />
              </PrivateRoute>
            } 
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="patients" element={<PatientList />} />
            {/* Future routes: appointments, services, settings */}
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
