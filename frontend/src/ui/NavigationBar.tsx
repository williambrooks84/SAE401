import { HomeIcon, ProfileIcon, PublishIcon, SettingsIcon } from "../assets/icons";

export default function NavigationBar() {
    return (
        <nav className="flex w-full bg-primary justify-around items-center md:justify-center md:gap-20 px-4 py-2 bg-nav-green">
            <ul className="flex w-full justify-around items-center md:justify-center md:gap-20">
            <li>
                <a href="/" aria-label="Home">
                <HomeIcon />
                </a>
            </li>
            <li>
                {/* <a href="/settings" aria-label="Settings"> */}
                <SettingsIcon />
                {/* </a> */}
            </li>
            <li>
                <a href="/publish" aria-label="Publish">
                <PublishIcon />
                </a>
            </li>
            <li>
                {/* <a href="/profile" aria-label="Profile"> */}
                <ProfileIcon />
                {/* </a> */}
            </li>
            </ul>
        </nav>
    );
}