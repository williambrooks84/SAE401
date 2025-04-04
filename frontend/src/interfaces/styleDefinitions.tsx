//Button
export interface ButtonProps {
    variant?: "default" | "greybgless" | "bluebgless" | "nobg" | "black";
    size?: "default" | "bgless";
    textSize?: "small" | "default" | "large";
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
  
//Avatar
export interface AvatarProps {
    avatar: string;
    username: string;
    color?: "white" | "black";
    className?: string;
}