import React from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button, Card, Typography, Divider, Row, Col, Input, Form } from "antd";
import { SafetyOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import { useAppDispatch } from "../../store";
import { addToast, createToast } from "../../store/slices/toast_slice";
import { verifyOTP } from "../../api/auth.api";
import "../../styles/auth.css";

const VerifyOTPPage: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email") || "";
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (!email) {
      dispatch(addToast(createToast.error("Error", "Email is required")));
      navigate("/forgot-password");
    }
  }, [email, navigate, dispatch]);

  const onFinish = async (values: { otp: string }) => {
    try {
      setLoading(true);
      await verifyOTP(email, values.otp);
      dispatch(addToast(createToast.success("Success", "OTP verified successfully")));
      // Navigate to reset password page with email and OTP
      navigate(`/reset-password?email=${encodeURIComponent(email)}&otp=${encodeURIComponent(values.otp)}`);
    } catch (error: any) {
      dispatch(addToast(createToast.error("Error", error.message || "Invalid OTP")));
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
                Verify OTP
              </Typography.Title>
              <Typography.Text type="secondary" style={{ fontSize: "14px" }}>
                Enter the 6-digit OTP sent to {email}
              </Typography.Text>
            </div>

            <Divider style={{ margin: "24px 0" }} />

            <Form
              form={form}
              name="verify-otp"
              onFinish={onFinish}
              layout="vertical"
              requiredMark={false}
            >
              <Form.Item
                name="otp"
                rules={[
                  { required: true, message: "Please input OTP!" },
                  { len: 6, message: "OTP must be 6 digits!" },
                  { pattern: /^\d+$/, message: "OTP must contain only numbers!" },
                ]}
              >
                <Input
                  prefix={<SafetyOutlined />}
                  placeholder="Enter 6-digit OTP"
                  size="large"
                  maxLength={6}
                  style={{ textAlign: "center", letterSpacing: "8px", fontSize: "20px" }}
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
                  Verify OTP
                </Button>
              </Form.Item>
            </Form>

            <Divider style={{ margin: "16px 0" }} />

            <div style={{ textAlign: "center", marginTop: "16px" }}>
              <Link
                to="/forgot-password"
                style={{ color: "#1A3636", fontWeight: 500, fontSize: "14px" }}
              >
                <ArrowLeftOutlined /> Back
              </Link>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default VerifyOTPPage;

