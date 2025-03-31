import { cva } from "class-variance-authority";
import { cn } from "../utils/cn";
import { ButtonProps } from "../interfaces/styleDefinitions";

const buttonVariants = cva("rounded-md font-medium focus:outline-none", {
    variants: {
        variant: {
            default: "bg-button-green hover:bg-button-green-hover text-button-green-text",
            greybgless: "text-button-grey-text",
            bluebgless: "text-button-blue-text",
            nobg: "text-button-black-text",
            black: "bg-button-black hover:bg-button-black-hover text-button-white-text",
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
        padding:{
            default: "px-5",
            none: "px-0",
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
        padding: "none",
    },
});

const Button = ({
    variant,
    size,
    rounded,
    width,
    padding,
    onClick,
    className,
    children,
    ...props
}: ButtonProps) => {
    return (
        <button
            className={cn(buttonVariants({ variant, size, rounded, width, padding, className }))}
            onClick={onClick}
            {...props}
        >
            {children}
        </button>
    );
};

export default Button;