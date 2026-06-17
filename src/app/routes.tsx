import { createBrowserRouter } from 'react-router-dom';
import Layout from '../components/Layout/Layout';
import Landing from '../pages/Landing';
import Crear from '../pages/Crear';
import Wizard from '../pages/Wizard';
import Preview from '../pages/Preview';
import Privacy from '../pages/Privacy';
import Guia from '../pages/Guia';
import NotFound from '../pages/NotFound';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    errorElement: <NotFound />,
    children: [
      { index: true, element: <Landing /> },
      { path: 'crear', element: <Crear /> },
      { path: 'wizard', element: <Wizard /> },
      { path: 'vista-previa', element: <Preview /> },
      { path: 'privacidad', element: <Privacy /> },
      { path: 'guia', element: <Guia /> },
      { path: '*', element: <NotFound /> },
    ],
  },
]);
