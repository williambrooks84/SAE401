import { LogoProps } from "../interfaces/dataDefinitions";

export default function Logo({ src, alt, className }: LogoProps) {
    return (
        <img
            src={src}
            alt={alt}
            className={className}
        />
    );
}