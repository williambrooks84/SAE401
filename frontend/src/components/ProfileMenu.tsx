import React from "react";
import ProfileLogin from "./ProfileLogin";
import { CrossIcon } from "../assets/icons";
import { ProfileMenuProps } from "../interfaces/styleDefinitions";

const ProfileMenu: React.FC<ProfileMenuProps> = ({ isVisible, onClose }) => {
    if (!isVisible) return null;

    return (
        <div className="fixed top-0 right-0 w-2/3 md:w-1/4 shadow-lg z-50 h-fit bg-post-background px-5 py-10 rounded-tl-4xl rounded-bl-4xl">
            <button onClick={onClose} className="absolute top-3 left-3">
            <CrossIcon />
            </button>
            <ProfileLogin />
        </div>
    );
};

export default ProfileMenu;
