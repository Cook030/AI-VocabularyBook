import React from 'react';
import { RouterProvider } from 'react-router-dom';
import router from './router';
import { ThemeProvider } from './contexts/ThemeContext';
import './App.css';

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <RouterProvider router={router} />
    </ThemeProvider>
  );
};

export default App;