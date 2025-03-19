import { HomeIcon, ProfileIcon, PublishIcon, SettingsIcon } from "../assets/icons";

export default function NavigationBar() {
    return (
        <div className="flex w-full bg-primary justify-around items-center md:justify-center md:gap-20 px-4 py-2 bg-nav-green">
            <HomeIcon/>
            <SettingsIcon/>
            <PublishIcon/>
            <ProfileIcon/>
        </div>
    );
}