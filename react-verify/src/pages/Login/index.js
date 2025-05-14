import "./index.scss";
import { Card, Form, Input, Button, message } from "antd";
//import { loginSuperAPI } from "@/lib/appwrite";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { fetchLogin } from "@/store/modules/user";

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();

  const onFinish = async (values) => {
    try {
      // 调用Redux异步action处理登录
      await dispatch(
        fetchLogin({
          super_name: values.super_name,
          super_password: values.super_password,
        })
      );

      message.success("登录成功");
      // 登录后跳转到原始页面或默认页面
      const from = location.state?.from || "/article";
      navigate(from, { replace: true });
    } catch (error) {
      message.error(error.message);
    }
  };

  return (
    <div className="login">
      <Card title="审核管理系统" className="login-container">
        <Form onFinish={onFinish} validateTrigger="onBlur">
          <Form.Item
            name="super_name"
            rules={[{ required: true, message: "请输入用户名" }]}
          >
            <Input placeholder="用户名" size="large" />
          </Form.Item>

          <Form.Item
            name="super_password"
            rules={[{ required: true, message: "请输入密码" }]}
          >
            <Input.Password placeholder="密码" size="large" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" size="large" block>
              登录
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default Login;
