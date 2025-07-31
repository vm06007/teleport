// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import  { lazy } from 'react';
import { Navigate, createBrowserRouter } from "react-router";
import Loadable from '../layouts/full/shared/loadable/Loadable';


/* ***Layouts**** */
const FullLayout = Loadable(lazy(() => import('../layouts/full/FullLayout')));
const Kanban = Loadable(lazy(() => import('../views/apps/kanban/Kanban')));
const Dashboard3 = Loadable(lazy(() => import('../views/dashboard/Dashboard3')));

const Router = [
  {
    path: '/',
    element: <FullLayout />,
    children: [
      { path: '/', exact: true, element: <Dashboard3 /> },
      { path: '/apps/kanban', exact: true, element: <Kanban /> },
      { path: '/dashboards/dashboard3', exact: true, element: <Dashboard3 /> },
      { path: '*', element: <Navigate to="/auth/404" /> },
    ],
  }
];

const router = createBrowserRouter(Router)

export default router;
