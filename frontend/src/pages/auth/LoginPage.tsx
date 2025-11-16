import React from "react";
import { Link } from "react-router-dom";
import {
  Button,
  Card,
  Typography,
  Divider,
  Row,
  Col,
  Input,
  Form,
} from "antd";
import { LoginOutlined, UserOutlined, LockOutlined } from "@ant-design/icons";
import { useLogin } from "../../hooks/auth/useLogin";
import { useFormValidation } from "../../hooks/common/useFormValidation";
import "../../styles/auth.css";
import { loginValidationRules, loginSchema } from "./schemas";

const LoginPage: React.FC = () => {
  const [form] = Form.useForm();
  const { handleLogin, loading, error, setError } = useLogin();

  const { onFinish } = useFormValidation({
    schema: loginSchema,
    form,
    onSubmit: handleLogin,
    setError,
  });

  return (
    <div className="auth-container">
      <Row justify="center" align="middle" style={{ minHeight: "100vh", width: "100%" }}>
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
            <div style={{ textAlign: "center", marginBottom: "32px" }}>
              <img
                src="/assets/logo.png"
                alt="Logo"
                className="auth-logo"
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

            {error && (
              <div
                style={{
                  textAlign: "center",
                  color: "#ff4d4f",
                  fontSize: "14px",
                  marginBottom: "16px",
                  cursor: "pointer",
                }}
                onClick={() => setError(null)}
              >
                {error}
              </div>
            )}

            <Form
              form={form}
              name="login"
              onFinish={onFinish}
              layout="vertical"
              requiredMark={false}
            >
              <Form.Item
                name="usernameOrEmail"
                rules={loginValidationRules.usernameOrEmail}
              >
                <Input
                  prefix={<UserOutlined />}
                  placeholder="Username or Email"
                  size="large"
                />
              </Form.Item>

              <Form.Item
                name="password"
                rules={loginValidationRules.password}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="Password"
                  size="large"
                />
              </Form.Item>

              <Form.Item>
                <div style={{ textAlign: 'right', marginBottom: '8px' }}>
                  <Link to="/forgot-password" style={{ fontSize: '14px' }}>
                    Forgot password?
                  </Link>
                </div>
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
    </div>
  );
};

export default LoginPage;