import { HomeIcon, ProfileIcon, PublishIcon, SettingsIcon } from "../assets/icons";
import { useState } from "react";
import ProfileMenu from "../components/ProfileMenu";
import Settings from "../components/Settings";

export default function NavigationBar() {
    const [isProfileMenuVisible, setIsProfileMenuVisible] = useState(false);
    const [isSettingsVisible, setIsSettingsVisible] = useState(false);
    return (
        <>
            <nav className="sticky top-0 flex w-full bg-primary justify-around items-center md:justify-center md:gap-20 px-4 py-3 bg-nav-green z-10">
                <ul className="flex w-full justify-around items-center md:justify-center md:gap-20">
                <li>
                    <a href="/" aria-label="Home">
                    <HomeIcon />
                    </a>
                </li>
                <li>
                    <a aria-label="Settings" onClick = {() => setIsSettingsVisible(true)}>
                    <SettingsIcon />
                    </a>
                </li>
                <li>
                    <a href="/publish" aria-label="Publish">
                    <PublishIcon />
                    </a>
                </li>
                <li>
                    <a aria-label="Profile" onClick={() => setIsProfileMenuVisible(true)}
                    >
                    <ProfileIcon />
                    </a>
                </li>
                </ul>
            </nav>
            <ProfileMenu
            isVisible={isProfileMenuVisible}
            onClose={() => setIsProfileMenuVisible(false)}
        />
            <Settings isVisible={isSettingsVisible}  onClose={() => setIsSettingsVisible(false)}/>
        </>
    );
}