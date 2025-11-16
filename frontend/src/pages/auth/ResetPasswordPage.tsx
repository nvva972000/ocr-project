import React from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button, Card, Typography, Divider, Row, Col, Input, Form } from "antd";
import { LockOutlined, CheckCircleOutlined } from "@ant-design/icons";
import { useAppDispatch } from "../../store";
import { addToast, createToast } from "../../store/slices/toast_slice";
import { resetPassword } from "../../api/auth.api";
import "../../styles/auth.css";

const ResetPasswordPage: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email") || "";
  const otp = searchParams.get("otp") || "";
  const [loading, setLoading] = React.useState(false);
  const [success, setSuccess] = React.useState(false);

  React.useEffect(() => {
    if (!email || !otp) {
      dispatch(addToast(createToast.error("Error", "Email and OTP are required")));
      navigate("/forgot-password");
    }
  }, [email, otp, navigate, dispatch]);

  const onFinish = async (values: { password: string; confirmPassword: string }) => {
    try {
      if (values.password !== values.confirmPassword) {
        dispatch(addToast(createToast.error("Error", "Passwords do not match!")));
        return;
      }

      setLoading(true);
      await resetPassword(email, otp, values.password);
      dispatch(addToast(createToast.success("Success", "Password reset successful!")));
      setSuccess(true);
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error: any) {
      dispatch(addToast(createToast.error("Error", error.message || "Failed to reset password")));
    } finally {
      setLoading(false);
    }
  };

  if (success) {
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
              bodyStyle={{ padding: "40px 32px", textAlign: "center" }}
            >
              <CheckCircleOutlined style={{ fontSize: "64px", color: "#52c41a", marginBottom: "24px" }} />
              <Typography.Title level={3}>Password Reset Successful!</Typography.Title>
              <Typography.Text type="secondary">
                Redirecting to login page...
              </Typography.Text>
            </Card>
          </Col>
        </Row>
      </div>
    );
  }

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
              <Typography.Title level={3} style={{ marginBottom: "8px" }}>
                Reset Password
              </Typography.Title>
              <Typography.Text type="secondary" style={{ fontSize: "14px" }}>
                Enter your new password
              </Typography.Text>
            </div>

            <Divider style={{ margin: "24px 0" }} />

            <Form
              form={form}
              name="reset-password"
              onFinish={onFinish}
              layout="vertical"
              requiredMark={false}
            >
              <Form.Item
                name="password"
                rules={[
                  { required: true, message: "Please input your new password!" },
                  { min: 6, message: "Password must be at least 6 characters!" },
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="New Password"
                  size="large"
                />
              </Form.Item>

              <Form.Item
                name="confirmPassword"
                dependencies={["password"]}
                rules={[
                  { required: true, message: "Please confirm your password!" },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue("password") === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error("Passwords do not match!"));
                    },
                  }),
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="Confirm Password"
                  size="large"
                />
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  loading={loading}
                  style={{
                    width: "100%",
                    height: "48px",
                    fontSize: "16px",
                    fontWeight: 500,
                    borderRadius: "8px",
                  }}
                >
                  Reset Password
                </Button>
              </Form.Item>
            </Form>

            <Divider style={{ margin: "16px 0" }} />

            <div style={{ textAlign: "center", marginTop: "16px" }}>
              <Link
                to="/login"
                style={{ color: "#1A3636", fontWeight: 500, fontSize: "14px" }}
              >
                Back to Login
              </Link>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ResetPasswordPage;

