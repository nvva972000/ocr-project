import { Controller, type FieldErrors, type Control } from "react-hook-form";
import styled from "styled-components";

interface InputFormProps {
    control: Control<any>;
    errors: FieldErrors<any>;
    name: string;
    label: string;
    placeholder: string;
    required: boolean;
}

const InputForm = ({ control, errors, name, label, placeholder, required }: InputFormProps) => {
    const isError = !!errors[name]?.message;;
    return (
        <InputWrapper $isError={isError}>
            <label>{label} {required && <span style={{ color: 'red' }}>*</span>}</label>
            <Controller
                name={name}
                control={control}
                rules={required ? { required: `${name} is required` } : {}}
                render={({ field }) => (
                    <input
                        {...field}
                        placeholder={placeholder}
                    />
                )}
            />
            {errors[name] && <span style={{ color: 'red' }}>{errors[name].message?.toString().replace(errors[name].message.toString().charAt(0), errors[name].message.toString().charAt(0).toUpperCase())}</span>}
        </InputWrapper>
    )
};


const InputWrapper = styled.div<{ $isError: boolean }>`
    display: flex;
    flex-direction: column;
    gap: 8px;
    font-size: 13px;
    label {
        font-size: 13px;
        font-weight: 600;
        color: #000;
    }

    input {
        border: ${({ $isError }) => $isError ? '1px solid red' : '1px solid #e0e0e0'};
        border-radius: 4px;
        padding: 8px;
        font-size: 13px;
        color: #000;
    }
`;
export default InputForm;


