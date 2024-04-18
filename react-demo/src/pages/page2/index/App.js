import {
  createBrowserRouter,
  RouterProvider
} from "react-router-dom";
import routes from './routes'

const router = createBrowserRouter(routes, {
  basename: process.env.PUBLIC_URL
});

function App() {
  return (
    <div className="App">
      <RouterProvider router={router} />
    </div>
  );
}

export default App;