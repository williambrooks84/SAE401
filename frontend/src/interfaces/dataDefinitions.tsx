//FormBox
export interface FormBoxProps {
    placeholder?: string;
    value?: string;
    onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

//Logo
export interface LogoProps {
    src: string;
    alt: string;
    className?: string;
}

//Post
export interface PostProps {
    key: string;
    id: string;
    content: string;
    created_at: string;
}

//PostData
export interface PostData {
    id: string;
    content: string;
    created_at: string;
}

//TextArea
export interface TextAreaProps {
    placeholder: string;
    value: string;
    onChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
    rows?: number;
}

export interface LetterCounterProps {
    value: string;
    limit: string;
}