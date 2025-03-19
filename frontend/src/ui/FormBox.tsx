import React from 'react';

interface FormBoxProps {
    placeholder?: string;
    value?: string;
    onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function FormBox({ placeholder, value, onChange }: FormBoxProps) {
    const inputType = placeholder?.toLowerCase().includes('password') ? 'password' : 'text';
    
    return (
        <input
            type={inputType}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            className="p-3 border rounded bg-textbox"
        />
    );
}
