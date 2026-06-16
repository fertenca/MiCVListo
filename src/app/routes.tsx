import { createBrowserRouter } from 'react-router-dom';
import Layout from '../components/Layout/Layout';
import Landing from '../pages/Landing';
import Wizard from '../pages/Wizard';
import Preview from '../pages/Preview';
import Privacy from '../pages/Privacy';

/**
 * Definición de rutas de la V0. Slugs en español.
 * Layout es la ruta padre; cada página se renderiza en su <Outlet />.
 */
export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Landing /> },
      { path: 'crear', element: <Wizard /> },
      { path: 'vista-previa', element: <Preview /> },
      { path: 'privacidad', element: <Privacy /> },
    ],
  },
]);
