import { FormLabelProps } from "../interfaces/styleDefinitions";
import { cva } from "class-variance-authority";
import { cn } from "../utils/cn";

const formLabelVariants = cva("text-sm font-medium text-default", {
    variants: {
        size: {
            small: "text-xs",
            medium: "text-sm",
            large: "text-lg",
            extralarge: "text-xl",
            extralarge2: "text-2xl",
        },
        weight: {
            medium: "font-medium",
            semibold: "font-semibold",
        },
        color: {
            default: "text-default",

        },
    },
    defaultVariants: {
        size: "medium",
        weight: "medium",
        color: "default",
    },
});

export default function FormLabel({ label, className, size, weight, color }: FormLabelProps) {
    return (
        <label className={cn(formLabelVariants({ size, weight, color }), className)}>
            {label}
        </label>
    );
}