import type { FormInstance } from "antd";
import Joi from "joi";
import { validate } from "../../utils/validate";

interface UseFormValidationOptions<T> {
  schema: Joi.ObjectSchema;
  form: FormInstance;
  onSubmit: (data: T) => Promise<void>;
  setError?: (error: string | null) => void;
}

export const useFormValidation = <T>({
  schema,
  form,
  onSubmit,
  setError,
}: UseFormValidationOptions<T>) => {
  const onFinish = async (values: any) => {
    try {
      const validatedData = validate<T>(schema, values);
      await onSubmit(validatedData);
    } catch (error: any) {
      if (error.isJoi) {
        const firstError = error.details[0];
        form.setFields([
          {
            name: firstError.path[0] as string,
            errors: [firstError.message],
          },
        ]);
      } else {
        if (setError) {
          setError(error.message || "Validation failed");
        }
      }
    }
  };

  return { onFinish };
};

