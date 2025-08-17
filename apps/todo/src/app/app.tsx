import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { MainRouter } from './todo/pages/routes';
import { Suspense } from 'react';
import { Provider } from '../components/ui/provider';
import { Toaster } from '../components/ui/toaster';

const router = createBrowserRouter([...MainRouter]);

export function App() {
  return (
    <Provider>
      <Suspense fallback={'loading'}>
        <RouterProvider router={router} />
      </Suspense>
      <Toaster />
    </Provider>
  );
}

export default App;
