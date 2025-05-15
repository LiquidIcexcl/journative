//import "@ant-design/v5-patch-for-react-19";
import { clearUserInfo, fetchUserInfo } from "@/store/modules/user";
import { DiffOutlined, LogoutOutlined } from "@ant-design/icons";
import { Layout, Popconfirm } from "antd";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import "./index.scss";

const { Header, Sider } = Layout;

const items = [
  {
    label: "审核管理",
    key: "/article",
    icon: <DiffOutlined />,
  },
];

const MyLayout = () => {
  const navigate = useNavigate();
  const userInfo = useSelector((state) => state.user.userInfo);
  const onMenuClick = (route) => {
    console.log("菜单被点击了", route);
    const path = route.key;
    navigate(path);
  };

  // 反向高亮
  // 1. 获取当前路由路径
  const location = useLocation();
  console.log(location.pathname);
  const selectedkey = location.pathname;

  // 触发个人用户信息action
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(fetchUserInfo());
  }, [dispatch]);

  // 退出登录确认回调
  const onConfirm = () => {
    console.log("确认退出");
    dispatch(clearUserInfo());
    navigate("/login");
  };

  //const name = useSelector((state) => state.user.userInfo.name);
  return (
    <Layout>
      <Header className="header" style={{ background: "#FFFFFF" }}>
        {/* <div className="logo" /> */}
        <div className="title">
          <h2 className="title-text">审核管理系统</h2>
        </div>
        <div className="user-info">
          <span className="user-name">
            {userInfo?.super_name} (
            {userInfo?.super_type === 1 ? "管理员" : "审核员"})
          </span>
          <span className="user-logout">
            <Popconfirm
              title="是否确认退出？"
              okText="退出"
              cancelText="取消"
              onConfirm={onConfirm}
            >
              <LogoutOutlined /> 退出
            </Popconfirm>
          </span>
        </div>
      </Header>
      <Layout>
        {/* <Sider width={200} className="site-layout-background">
          <Menu
            mode="inline"
            theme="dark"
            selectedKeys={selectedkey}
            onClick={onMenuClick}
            items={items}
            style={{ height: "100%", borderRight: 0 }}
          ></Menu>
        </Sider> */}
        <Layout className="layout-content" style={{ padding: 20 }}>
          {/* 二级路由的出口 */}
          <Outlet />
        </Layout>
      </Layout>
    </Layout>
  );
};
export default MyLayout;
