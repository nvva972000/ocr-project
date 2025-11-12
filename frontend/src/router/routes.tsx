import type { RouteObject } from 'react-router-dom';
import PrivateRoute from '@components/common/PrivateRoute';
import MainLayout from '@layout/MainLayout.tsx';
import Login from '@pages/authenticator/Login.tsx';
import Register from '@pages/authenticator/Register';
import Dashboard from '@pages/dashboard/Dashboard';
import OCR from '@pages/ocr/OCR';
import Users from '@pages/users/Users.tsx';
import Roles from '@pages/roles/Roles';
import Org from '@pages/org/Org';
import ActivityLog from '@pages/activity-log/ActivityLog';


export const publicRoutes: RouteObject[] = [
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/register',
    element: <Register />,
  },
];


export const protectedRoutes: RouteObject[] = [
  {
    path: '/',
    element: (
      <PrivateRoute>
        <MainLayout />
      </PrivateRoute>
    ),
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      // Overview routes
      {
        path: 'dashboard',
        element: <Dashboard />,
      },
      // IAM routes
      {
        path: 'users',
        element: <Users />,
      },
      {
        path: 'roles',
        element: <Roles />,
      },
      {
        path: 'org',
        element: <Org />,
      },
      // OCR route
      {
        path: 'ocr',
        element: <OCR />,
      },
      // Activity Log route
      {
        path: 'activity-log',
        element: <ActivityLog />,
      },
    ],
  },
];

/**
 * Tất cả routes
 */
export const allRoutes: RouteObject[] = [
  ...publicRoutes,
  ...protectedRoutes,
];

