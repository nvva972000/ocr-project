import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Button,
  Card,
  Typography,
  Divider,
  Row,
  Col,
  Input,
  message,
  Form,
} from "antd";
import { LoginOutlined, UserOutlined, LockOutlined } from "@ant-design/icons";
import { login } from "@services/auth.service";
import { LoginContainer, Logo } from "./Login.ts";
import { MOCK_AUTH } from "@services/config";

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const handleLogin = async (values: {
    username: string;
    password: string;
  }) => {
    try {
      setLoading(true);
      
      if (MOCK_AUTH) {
        // Автоматический логин с любыми данными
        const mockResponse = {
          access_token: "mock_access_token_" + Date.now(),
          refresh_token: "mock_refresh_token_" + Date.now(),
          user: {
            username: values.username || "test_user",
            email: values.username + "@example.com",
          },
        };
        
        localStorage.setItem("token", mockResponse.access_token);
        localStorage.setItem("refresh_token", mockResponse.refresh_token);
        localStorage.setItem("username", mockResponse.user.username);
        localStorage.setItem("email", mockResponse.user.email);

        message.success("Login successful! (Mock Mode)");
        navigate("/", { replace: true });
        return;
      }

      const response = await login(values.username, values.password);

      if (response.access_token) {
        localStorage.setItem("token", response.access_token);
        localStorage.setItem("refresh_token", response.refresh_token);
        localStorage.setItem("username", response.user.username);
        localStorage.setItem("email", response.user.email);

        message.success("Login successful!");
        navigate("/", { replace: true });
      }
    } catch (error: any) {
      message.error(
        error.message || "Login failed. Please check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <LoginContainer>
      <Row
        justify="center"
        align="middle"
        style={{ minHeight: "100vh", width: "100%" }}
      >
        <Col xs={22} sm={18} md={12} lg={8} xl={6}>
          <Card
            style={{
              borderRadius: "16px",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
              border: "none",
              overflow: "hidden",
            }}
            bodyStyle={{ padding: "40px 32px" }}
          >
            {/* Logo Section */}
            <div style={{ textAlign: "center", marginBottom: "32px" }}>
              <Logo
                src="https://thanhcong.vn/wp-content/uploads/2022/08/logo-tcgroup-342w.png"
                alt="Logo"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
                style={{ height: "60px", width: "auto", marginBottom: "16px" }}
              />

              <Typography.Title type="secondary" style={{ fontSize: "14px" }}>
                Login to access the system
              </Typography.Title>
            </div>

            <Divider style={{ margin: "24px 0" }} />

            {/* Login Form */}
            <Form
              form={form}
              name="login"
              onFinish={handleLogin}
              layout="vertical"
              requiredMark={false}
            >
              <Form.Item
                name="username"
                rules={[
                  { required: true, message: "Please input your username!" },
                ]}
              >
                <Input
                  prefix={<UserOutlined />}
                  placeholder="Username"
                  size="large"
                />
              </Form.Item>

              <Form.Item
                name="password"
                rules={[
                  { required: true, message: "Please input your password!" },
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="Password"
                  size="large"
                />
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  icon={<LoginOutlined />}
                  loading={loading}
                  style={{
                    width: "100%",
                    height: "48px",
                    fontSize: "16px",
                    fontWeight: 500,
                    borderRadius: "8px",
                  }}
                >
                  Login
                </Button>
              </Form.Item>
            </Form>

            <Divider style={{ margin: "16px 0" }} />

            <div style={{ textAlign: "center", marginTop: "16px" }}>
              <Typography.Text type="secondary" style={{ fontSize: "14px" }}>
                Don't have an account?
              </Typography.Text>
              <Link
                to="/register"
                style={{ color: "#1A3636", fontWeight: 500, fontSize: "14px" }}
              >
                Sign up now
              </Link>
            </div>
          </Card>
        </Col>
      </Row>
    </LoginContainer>
  );
};

export default Login;
