import Joi from "joi";

export function validate<T>(schema: Joi.ObjectSchema, payload: unknown): T {
  const { error, value } = schema.validate(payload, { abortEarly: false });
  if (error) {
    error.isJoi = true;
    throw error;
  }
  return value as T;
}
