import { createModuleRouter } from '../../../shared/react-router-dom/createModuleRouter';
import { TasksIndex } from './index';

export const MainRouter = createModuleRouter([
  {
    path: '/',
    element: <TasksIndex />,
  },
]);
