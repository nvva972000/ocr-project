import { Avatar } from "antd";
import React, { useState } from "react"
import { Controller, type Control, type FieldErrors, type UseFormSetValue } from "react-hook-form";
import styled from "styled-components";

interface AutoCompleteFormProps {
    control: Control<any>;
    errors: FieldErrors<any>;
    name: string;
    label: string;
    placeholder: string;
    required: boolean;
    data: { value: string; label: string }[];
    onChange: (value: string) => void;
    setValue: UseFormSetValue<any>;
}
const AutoCompleteForm: React.FC<AutoCompleteFormProps> = ({ control, errors, name, label, placeholder, required, data, onChange, setValue }) => {
    const [open, setOpen] = useState(false);

    return (
        <InputWrapper $isError={!!errors[name]?.message}>
            <label>{label} {required && <span style={{ color: 'red' }}>*</span>}</label>
            <Controller
                name={name}
                control={control}
                rules={required ? { required: `${name} is required` } : {}}
                render={({ field }) => (
                    <div style={{ position: 'relative' }}>
                        <input
                            {...field}
                            placeholder={placeholder}
                            onChange={(e) => { onChange(e.target.value); setOpen(true) }}
                            autoComplete="off"
                            onMouseEnter={() => { setOpen(true) }}
                        />
                        {open && data && (
                            <OptionMenu>
                                {data.map((item) => (
                                    <Autocomplete
                                        className="autocomplete-item" key={item.value}
                                        onClick={(e) => { e.stopPropagation(); setValue(name, item.value); setOpen(false) }}
                                        onMouseLeave={() => { setOpen(false) }}
                                    >
                                        <AutocompleteItem>
                                            <div>
                                                <Avatar
                                                    src={"https://i.pinimg.com/736x/cd/4b/d9/cd4bd9b0ea2807611ba3a67c331bff0b.jpg"}
                                                    size={32}
                                                />
                                            </div>
                                            <div>
                                                <div>{item.label.split('||')[0]} </div>
                                                <div>{item.label.split('||')[1]}</div>
                                            </div>
                                        </AutocompleteItem>
                                    </Autocomplete>
                                ))}
                            </OptionMenu>
                        )}
                    </div>
                )}
            />
        </InputWrapper>
    )
}

const InputWrapper = styled.div<{ $isError: boolean }>`
    display: flex;
    flex-direction: column;
    gap: 8px;
    font-size: 13px;
    width: 100%;
   

    label {
        font-size: 13px;
        font-weight: 600;
        color: #000;
        height: 20px;
    }

    input {
        border: ${({ $isError }) => $isError ? '1px solid red' : '1px solid #e0e0e0'};
        border-radius: 4px;
        padding: 8px;
        font-size: 13px;
        color: #000;
        width: 100%;
        box-sizing: border-box;
    }
`;

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
export default AutoCompleteForm;
