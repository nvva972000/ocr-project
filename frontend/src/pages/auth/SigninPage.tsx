import React from 'react';
import { Link } from 'react-router-dom';
import { Button, Card, Typography, Divider, Row, Col, Input, Form } from 'antd';
import { UserAddOutlined, UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import { useRegister } from '../../hooks/auth/useRegister';
import { useFormValidation } from '../../hooks/common/useFormValidation';
import '../../styles/auth.css';
import { registerValidationRules, registerSchema } from './schemas';

const SigninPage: React.FC = () => {
  const [form] = Form.useForm();
  const { handleRegister, loading, error, setError } = useRegister();

  const { onFinish } = useFormValidation({
    schema: registerSchema,
    form,
    onSubmit: handleRegister,
    setError,
  });

  return (
    <div className="auth-container">
      <Row justify="center" align="middle" style={{ minHeight: '100vh', width: '100%' }}>
        <Col xs={22} sm={18} md={12} lg={8} xl={6}>
          <Card
            style={{
              borderRadius: '16px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
              border: 'none',
              overflow: 'hidden',
            }}
            bodyStyle={{ padding: '40px 32px' }}
          >
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <img
                src="/assets/logo.png"
                alt="Logo"
                className="auth-logo"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
                style={{ height: '60px', width: 'auto', marginBottom: '16px' }}
              />
              <Typography.Title level={3} style={{ marginBottom: '8px' }}>
                Create Account
              </Typography.Title>
              <Typography.Text type="secondary" style={{ fontSize: '14px' }}>
                Sign up to get started
              </Typography.Text>
            </div>

            <Divider style={{ margin: '24px 0' }} />

            {error && (
              <div
                style={{
                  textAlign: 'center',
                  color: '#ff4d4f',
                  fontSize: '14px',
                  marginBottom: '16px',
                  cursor: 'pointer',
                }}
                onClick={() => setError(null)}
              >
                {error}
              </div>
            )}

            <Form
              form={form}
              name="register"
              onFinish={onFinish}
              layout="vertical"
              requiredMark={false}
            >
              <Form.Item
                name="username"
                rules={registerValidationRules.username}
              >
                <Input
                  prefix={<UserOutlined />}
                  placeholder="Username"
                  size="large"
                />
              </Form.Item>

              <Form.Item
                name="email"
                rules={registerValidationRules.email}
              >
                <Input
                  prefix={<MailOutlined />}
                  placeholder="Email"
                  size="large"
                />
              </Form.Item>

              <Form.Item
                name="first_name"
                rules={registerValidationRules.first_name}
              >
                <Input
                  placeholder="First Name (Optional)"
                  size="large"
                />
              </Form.Item>

              <Form.Item
                name="last_name"
                rules={registerValidationRules.last_name}
              >
                <Input
                  placeholder="Last Name (Optional)"
                  size="large"
                />
              </Form.Item>

              <Form.Item
                name="password"
                rules={registerValidationRules.password}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="Password"
                  size="large"
                />
              </Form.Item>

              <Form.Item
                name="confirmPassword"
                dependencies={['password']}
                rules={registerValidationRules.confirmPassword}
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
                  icon={<UserAddOutlined />}
                  loading={loading}
                  style={{
                    width: '100%',
                    height: '48px',
                    fontSize: '16px',
                    fontWeight: 500,
                    borderRadius: '8px',
                  }}
                >
                  Sign In
                </Button>
              </Form.Item>
            </Form>

            <Divider style={{ margin: '16px 0' }} />

            <div style={{ textAlign: 'center', marginTop: '16px' }}>
              <Typography.Text type="secondary" style={{ fontSize: '14px' }}>
                Already have an account?
              </Typography.Text>
              <Link
                to="/login"
                style={{ color: '#1A3636', fontWeight: 500, fontSize: '14px', marginLeft: '8px' }}
              >
                Login now
              </Link>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default SigninPage; 