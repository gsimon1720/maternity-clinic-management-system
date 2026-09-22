import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import AppRoutes from './routes/AppRoutes';
import { AuthProvider } from './context/AuthContext';
import './assets/styles/global.css';
import './assets/styles/variables.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Toaster position="top-right" toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#F48FB1',
              secondary: '#fff',
            },
          },
        }} />
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;