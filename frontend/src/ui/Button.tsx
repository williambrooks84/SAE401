import { cva } from "class-variance-authority";
import { cn } from "../utils/cn";
import { ButtonProps } from "../interfaces/styleDefinitions";

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
            fit: "w-fit",
        },
        disabled:{
            false: "false",
        }
    },
    defaultVariants: {
        variant: "default",
        size: "default",
        rounded: "default",
        width: "default",
    },
});

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