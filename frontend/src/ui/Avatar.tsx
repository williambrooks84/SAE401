import { cva } from "class-variance-authority";
import { cn } from "../utils/cn";
import { AvatarProps } from "../interfaces/styleDefinitions";

const usernameVariants = cva("text-2xl font-semibold", {
    variants: {
        color: {
            white: "text-white",
            black: "text-black",
        },
    },
    defaultVariants: {
        color: "black",
    },
});

export default function Avatar({
    avatar,
    username,
    color,
    className,
    ...props
}: AvatarProps) {
    return (
        <div className={cn("flex items-center gap-2", className)} {...props}>
            <img
                src={avatar}
                alt="avatar"
                className="w-12 h-12 rounded-full object-cover"
            />
            <p className={cn(usernameVariants({ color }))}>{username}</p>
        </div>
    );
}