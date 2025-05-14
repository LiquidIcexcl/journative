import Layout from "@/pages/Layout";
import Login from "@/pages/Login";
import { createBrowserRouter } from "react-router-dom";
import { AuthRoute } from "@/components/AuthRoute";
//import Home from "@/pages/Home";
import Article from "@/pages/Article";
import { Navigate } from "react-router-dom";
//import Publish from "@/pages/Publish";

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <AuthRoute>
        <Layout />
      </AuthRoute>
    ),
    children: [
      // {
      //   path: "home",
      //   element: <Home />,
      // },
      {
        index: true, // 默认子路由
        element: <Navigate to="/article" replace />,
      },
      {
        path: "article",
        element: <Article />,
      },
    ],
  },
  {
    path: "/login",
    element: <Login />,
  },
]);

export default router;
