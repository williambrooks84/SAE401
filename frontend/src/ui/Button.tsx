import { cva } from "class-variance-authority";
import { cn } from "../utils/cn";

const buttonVariants = cva("rounded-md font-medium focus:outline-none", {
    variants: {
        variant: {
            default: "bg-button-green text-button-green-text",
            greybgless: "text-button-grey-text",
            bluebgless: "text-button-blue-text",
        },
        size: {
            default: "h-12",
            bgless: "h-10",
        },
        rounded: {
            none: "rounded-none",
            default: "rounded-md",
            full: "rounded-full",
        },
        width: {
            default: "w-full",
        }
    },
    defaultVariants: {
        variant: "default",
        size: "default",
        rounded: "default",
        width: "default",
    },
});

interface ButtonProps {
    variant?: "default" | "greybgless" | "bluebgless";
    size?: "default" | "bgless";
    rounded?: "none" | "default" | "full";
    width?: "default";
    onClick?: () => void;
    children?: React.ReactNode;
    className?: string;
}

const Button = ({
    variant,
    size,
    rounded,
    width,
    onClick,
    className,
    children,
    ...props
}: ButtonProps) => {
    return (
        <button
            className={cn(buttonVariants({ variant, size, rounded, width, className }))}
            onClick={onClick}
            {...props}
        >
            {children}
        </button>
    );
};

export default Button;