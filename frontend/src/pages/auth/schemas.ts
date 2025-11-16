import Joi from "joi";

// Joi Schemas - Dùng để validate trước khi submit
export const loginSchema = Joi.object({
  usernameOrEmail: Joi.string()
    .required()
    .messages({
      "string.empty": "Please input your username or email!",
      "any.required": "Please input your username or email!",
    })
    .custom((value, helpers) => {
      if (value && value.includes("@")) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          return helpers.error("string.email");
        }
      }
      return value;
    }, "email validation")
    .message("Please enter a valid email address!"),
  password: Joi.string()
    .required()
    .messages({
      "string.empty": "Please input your password!",
      "any.required": "Please input your password!",
    }),
});

export const registerSchema = Joi.object({
  username: Joi.string()
    .min(3)
    .max(64)
    .required()
    .messages({
      "string.empty": "Please input your username!",
      "string.min": "Username must be at least 3 characters!",
      "string.max": "Username must not exceed 64 characters!",
      "any.required": "Please input your username!",
    }),
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required()
    .messages({
      "string.empty": "Please input your email!",
      "string.email": "Please enter a valid email address!",
      "any.required": "Please input your email!",
    }),
  first_name: Joi.string()
    .max(64)
    .allow("")
    .optional()
    .messages({
      "string.max": "First name must not exceed 64 characters!",
    }),
  last_name: Joi.string()
    .max(64)
    .allow("")
    .optional()
    .messages({
      "string.max": "Last name must not exceed 64 characters!",
    }),
  password: Joi.string()
    .min(6)
    .required()
    .messages({
      "string.empty": "Please input your password!",
      "string.min": "Password must be at least 6 characters!",
      "any.required": "Please input your password!",
    }),
  confirmPassword: Joi.string()
    .valid(Joi.ref("password"))
    .required()
    .messages({
      "any.only": "Passwords do not match!",
      "string.empty": "Please confirm your password!",
      "any.required": "Please confirm your password!",
    }),
});

// Ant Design Validation Rules - Dùng để hiển thị lỗi real-time trong form
// Validation rules cho Login Form
export const loginValidationRules = {
    usernameOrEmail: [
      { required: true, message: "Please input your username or email!" },
      {
        validator: (_: any, value: string) => {
          if (value && value.includes('@')) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
              return Promise.reject(new Error('Please enter a valid email address!'));
            }
          }
          return Promise.resolve();
        },
      },
    ],
    password: [
      { required: true, message: "Please input your password!" },
    ],
  };
  
  // Validation rules cho Register Form
  export const registerValidationRules = {
    username: [
      { required: true, message: 'Please input your username!' },
      { min: 3, message: 'Username must be at least 3 characters!' },
      { max: 64, message: 'Username must not exceed 64 characters!' },
    ],
    email: [
      { required: true, message: 'Please input your email!' },
      { type: 'email' as const, message: 'Please enter a valid email address!' },
      {
        validator: (_: any, value: string) => {
          if (value && value.includes('@')) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
              return Promise.reject(new Error('Please enter a valid email address!'));
            }
          }
          return Promise.resolve();
        },
      },
    ],
    first_name: [
      { max: 64, message: 'First name must not exceed 64 characters!' },
    ],
    last_name: [
      { max: 64, message: 'Last name must not exceed 64 characters!' },
    ],
    password: [
      { required: true, message: 'Please input your password!' },
      { min: 6, message: 'Password must be at least 6 characters!' },
    ],
    confirmPassword: [
      { required: true, message: 'Please confirm your password!' },
      ({ getFieldValue }: any) => ({
        validator(_: any, value: string) {
          if (!value || getFieldValue('password') === value) {
            return Promise.resolve();
          }
          return Promise.reject(new Error('Passwords do not match!'));
        },
      }),
    ],
  };
  
  