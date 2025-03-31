import { LocationIcon, LinkIcon } from "../assets/icons";
import { ProfileHeadProps } from "../interfaces/dataDefinitions";
import Button from "../ui/Button";
import Avatar from "../ui/Avatar";

export default function ProfileHead({
    username,
    banner,
    avatar,
    location,
    bio,
    website,
    isFollowing,
    onFollowToggle,
    isCurrentUser,
}: ProfileHeadProps) {
    return (
        <div className="flex flex-col justify-center p-5 gap-5 w-full md:w-1/2 rounded-4xl bg-post-background mx-auto">
            <div
                className="relative h-24 md:h-40 bg-cover bg-center rounded-lg"
                style={{ backgroundImage: `url(${banner})` }}
            >
                <div className="absolute inset-0 flex items-center justify-center">
                    <Avatar avatar={avatar} username={username} color="white" />
                </div>
            </div>

            <div className="flex flex-col gap-2.5">
                <div className="flex items-center gap-2">
                    <LocationIcon className="w-4 h-4" />
                    <p>{location}</p>
                </div>
                <p>{bio}</p>
                <div className="flex items-center gap-2">
                    <LinkIcon className="w-4 h-4" />
                    <a href={website} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                        {website}
                    </a>
                </div>
            </div>

            {!isCurrentUser && (
                <div className="flex justify-center">
                    <Button
                        variant={isFollowing ? "black" : "default"}
                        size="default"
                        rounded="default"
                        width="fit"
                        className="min-w-28"
                        onClick={onFollowToggle}
                    >
                        {isFollowing ? "Unfollow" : "Follow"}
                    </Button>
                </div>
            )}
        </div>
    );
}
