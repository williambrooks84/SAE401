//Button
export interface ButtonProps {
    variant?: "default" | "greybgless" | "bluebgless";
    size?: "default" | "bgless";
    rounded?: "none" | "default" | "full";
    width?: "default" | "fit";
    padding?: "default" | "none";
    onClick?: () => void;
    disabled?: boolean;
    children?: React.ReactNode;
    className?: string;
}

//Icons
export interface IconProps {
    className?: string;
}


//FormLabel
export interface FormLabelProps {
    label: string;
    className?: string;
    size?: "small" | "medium" | "large" | "extralarge" | "extralarge2";
    weight?: "medium" | "semibold";
    color?: "default";
}

//ProfileMenu
export interface ProfileMenuProps {
    isVisible: boolean;
    onClose: () => void;
  }
  