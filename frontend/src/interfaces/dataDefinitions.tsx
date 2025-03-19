//FormBox
export interface FormBoxProps {
    placeholder?: string;
    value?: string;
    onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

//FormLabel
export interface FormLabelProps {
    label: string;
}

//Logo
export interface LogoProps {
    src: string;
    alt: string;
    className?: string;
}

//Post
export interface PostProps {
    id: string;
    content: string;
    created_at: string;
}