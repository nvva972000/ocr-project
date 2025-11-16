import { Controller, type FieldErrors, type Control } from "react-hook-form";
import styled from "styled-components";

interface InputFormProps {
    control: Control<any>;
    errors: FieldErrors<any>;
    name: string;
    label: string;
    required: boolean;
    options: { value: string; label: string }[];
}

const SelectForm = ({ control, errors, name, label, required, options }: InputFormProps) => {
    const isError = !!errors[name]?.message;
    return (
        <SelectWrapper $isError={isError}>
            <label>{label} {required && <span style={{ color: 'red' }}>*</span>}</label>
            <Controller
                name={name}
                control={control}
                rules={required ? { required: `${name} is required` } : {}}
                render={({ field }) => (
                    <OptionMenu>
                        {options.map((item) => (
                            <Autocomplete
                                className="autocomplete-item" key={item.value}
                                onClick={(e) => { e.stopPropagation(); field.onChange(item.value) }}
                            >
                                <AutocompleteItem>
                                    {item.label}
                                </AutocompleteItem>
                            </Autocomplete>
                        ))}
                    </OptionMenu>
                )}
            />
            {errors[name] && <span style={{ color: 'red' }}>{errors[name].message?.toString().replace(errors[name].message.toString().charAt(0), errors[name].message.toString().charAt(0).toUpperCase())}</span>}
        </SelectWrapper>

    )
};

const Autocomplete = styled.div`
    cursor: pointer;
    width: 100%;

`;

const AutocompleteItem = styled.div`
    cursor: pointer;
    padding: 8px;
    display: flex;
    align-items: center;
    gap: 8px;
    &:hover {
        background-color: #f0f0f0;
    }
`;

const OptionMenu = styled.div`
    position: absolute;
    top: 40;
    left: 0;
    background: #fff;
    border: 1px solid #e6e6e6;
    overflow-y: auto;
    overflow-x: hidden;
    max-height: 200px;
    border-radius: 8px;
    box-shadow: 0 4px 16px rgba(0,0,0,0.12);
    width: 50%;
    z-index: 1000;
    display: flex;
    flex-direction: column;
    gap: 4px;

    /* Custom scrollbar styling */
  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 3px;
    transition: background 0.2s ease;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: #94a3b8;
  }

  /* Firefox scrollbar */
  scrollbar-width: thin;
  scrollbar-color: #cbd5e1 transparent;
`;

const SelectWrapper = styled.div<{ $isError: boolean }>`
    display: flex;
    flex-direction: column;
    gap: 8px;

    label {
        font-size: 13px;
        font-weight: 600;
        color: #000;
    }

    select {
        border: ${({ $isError }) => $isError ? '1px solid red' : '1px solid #e0e0e0'};
        border-radius: 4px;
        padding: 8px;
        font-size: 13px;
        color: #000;
        border-radius: 4px;
    }
    option {
        font-size: 13px;
        color: #000;
    }
`;

export default SelectForm;


