import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button, Card, Typography, Space, Divider, Row, Col, Input, message, Form } from 'antd';
import { UserAddOutlined, UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import { register } from '@services/auth.service';
import { LoginContainer, Logo } from './Login.ts';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const handleRegister = async (values: {
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
    first_name?: string;
    last_name?: string;
  }) => {
    try {
      setLoading(true);
      
      if (values.password !== values.confirmPassword) {
        message.error('Passwords do not match!');
        return;
      }

      const response = await register({
        username: values.username,
        email: values.email,
        password: values.password,
        first_name: values.first_name,
        last_name: values.last_name,
      });
      
      if (response.access_token) {
        localStorage.setItem('token', response.access_token);
        localStorage.setItem('refresh_token', response.refresh_token);
        localStorage.setItem('username', response.user.username);
        localStorage.setItem('email', response.user.email);
        
        message.success('Registration successful! Redirecting...');
        setTimeout(() => {
          navigate('/', { replace: true });
        }, 1000);
      }
    } catch (error: any) {
      const errorMessage = error.message || error.error || 'Registration failed. Please try again.';
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LoginContainer>
      <Row justify="center" align="middle" style={{ minHeight: '100vh', width: '100%' }}>
        <Col xs={22} sm={18} md={14} lg={10} xl={8}>
          <Card
            style={{
              borderRadius: '16px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
              border: 'none',
              overflow: 'hidden'
            }}
            bodyStyle={{ padding: '40px 32px' }}
          >
            {/* Logo Section */}
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <Logo
                src="https://thanhcong.vn/wp-content/uploads/2022/08/logo-tcgroup-342w.png"
                alt="Logo"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
                style={{ height: '60px', width: 'auto', marginBottom: '16px' }}
              />
              <Typography.Title type="secondary" style={{ fontSize: '14px' }}>
                Create a new account
              </Typography.Title>
            </div>

            <Divider style={{ margin: '24px 0' }} />

            {/* Register Form */}
            <Form
              form={form}
              name="register"
              onFinish={handleRegister}
              layout="vertical"
              requiredMark={false}
              scrollToFirstError
            >
              <Form.Item
                name="username"
                label="Username"
                rules={[
                  { required: true, message: 'Please input your username!' },
                  { min: 3, message: 'Username must be at least 3 characters!' },
                ]}
              >
                <Input
                  prefix={<UserOutlined />}
                  placeholder="Username"
                  size="large"
                />
              </Form.Item>

              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: 'Please input your email!' },
                  { type: 'email', message: 'Please enter a valid email!' },
                ]}
              >
                <Input
                  prefix={<MailOutlined />}
                  placeholder="Email"
                  size="large"
                />
              </Form.Item>

              <Form.Item
                name="first_name"
                label="First Name"
              >
                <Input
                  placeholder="First Name (Optional)"
                  size="large"
                />
              </Form.Item>

              <Form.Item
                name="last_name"
                label="Last Name"
              >
                <Input
                  placeholder="Last Name (Optional)"
                  size="large"
                />
              </Form.Item>

              <Form.Item
                name="password"
                label="Password"
                rules={[
                  { required: true, message: 'Please input your password!' },
                  { min: 6, message: 'Password must be at least 6 characters!' },
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="Password"
                  size="large"
                />
              </Form.Item>

              <Form.Item
                name="confirmPassword"
                label="Confirm Password"
                dependencies={['password']}
                rules={[
                  { required: true, message: 'Please confirm your password!' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('password') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('The two passwords do not match!'));
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
                  Register
                </Button>
              </Form.Item>
            </Form>

            <Divider style={{ margin: '16px 0' }} />

            <div style={{ textAlign: 'center' }}>
              <Typography.Text type="secondary">
                Already have an account?{' '}
              </Typography.Text>
              <Link to="/login" style={{ color: '#1A3636', fontWeight: 500 }}>
                Login here
              </Link>
            </div>
          </Card>
        </Col>
      </Row>
    </LoginContainer>
  );
};

export default Register;
