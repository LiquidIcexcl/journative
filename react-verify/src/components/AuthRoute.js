import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";

export function AuthRoute({ children }) {
  const { userInfo } = useSelector((state) => state.user);
  const location = useLocation();

  // 检查本地存储作为兜底方案
  const localUser = JSON.parse(localStorage.getItem("super_user"));

  if (!userInfo && !localUser) {
    // 保存原始路径以便登录后跳转
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}
