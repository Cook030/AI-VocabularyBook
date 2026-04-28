import { createBrowserRouter, Navigate } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';
import Home from '../pages/Home';
import Login from '../pages/Login';
import Notebook from '../pages/Notebook';
import Query from '../pages/Query';
import Register from '../pages/Register';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/query" replace />,
  },
  {
    path: '/home',
    element: (
      <ProtectedRoute>
        <Home />
      </ProtectedRoute>
    ),
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/register',
    element: <Register />,
  },
  {
    path: '/query',
    element: (
      <ProtectedRoute>
        <Query />
      </ProtectedRoute>
    ),
  },
  {
    path: '/notebook',
    element: (
      <ProtectedRoute>
        <Notebook />
      </ProtectedRoute>
    ),
  },
  {
    path: '*',
    element: <Navigate to="/query" replace />,
  },
], {
  future: {
    v7_startTransition: true,
  },
});

export default router;