import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button, Card, Typography, Divider, Row, Col, Input, Form } from "antd";
import { MailOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import { useAppDispatch } from "../../store";
import { addToast, createToast } from "../../store/slices/toast_slice";
import { forgotPassword } from "../../api/auth.api";
import "../../styles/auth.css";

const ForgotPasswordPage: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [loading, setLoading] = React.useState(false);

  const onFinish = async (values: { email: string }) => {
    try {
      setLoading(true);
      await forgotPassword(values.email);
      dispatch(addToast(createToast.success("Success", "Nếu email tồn tại trong hệ thống, OTP sẽ được gửi tới email đó.")));
      // Navigate to verify OTP page with email
      navigate(`/verify-otp?email=${encodeURIComponent(values.email)}`);
    } catch (error: any) {
      dispatch(addToast(createToast.error("Error", error.message || "Failed to send OTP")));
    } finally {
      setLoading(false);
    }
  };

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
                Forgot Password
              </Typography.Title>
              <Typography.Text type="secondary" style={{ fontSize: "14px" }}>
                Enter your email to receive OTP
              </Typography.Text>
            </div>

            <Divider style={{ margin: "24px 0" }} />

            <Form
              form={form}
              name="forgot-password"
              onFinish={onFinish}
              layout="vertical"
              requiredMark={false}
            >
              <Form.Item
                name="email"
                rules={[
                  { required: true, message: "Please input your email!" },
                  { type: "email", message: "Please enter a valid email address!" },
                ]}
              >
                <Input
                  prefix={<MailOutlined />}
                  placeholder="Email"
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
                  Send OTP
                </Button>
              </Form.Item>
            </Form>

            <Divider style={{ margin: "16px 0" }} />

            <div style={{ textAlign: "center", marginTop: "16px" }}>
              <Link
                to="/login"
                style={{ color: "#1A3636", fontWeight: 500, fontSize: "14px" }}
              >
                <ArrowLeftOutlined /> Back to Login
              </Link>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ForgotPasswordPage;

