import { useRoutes } from 'react-router-dom';
import { allRoutes } from './routes';

export const AppRouter = () => {
  const routes = useRoutes(allRoutes);
  return routes;
};
