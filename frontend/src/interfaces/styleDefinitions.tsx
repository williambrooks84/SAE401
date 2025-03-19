//Button
export interface ButtonProps {
    variant?: "default" | "greybgless" | "bluebgless";
    size?: "default" | "bgless";
    rounded?: "none" | "default" | "full";
    width?: "default";
    onClick?: () => void;
    children?: React.ReactNode;
    className?: string;
}