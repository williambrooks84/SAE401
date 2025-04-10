import { LocationIcon, LinkIcon } from "../assets/icons";
import { ProfileHeadProps } from "../interfaces/dataDefinitions";
import Button from "../ui/Button";
import Avatar from "../ui/Avatar";
import FollowerCounter from "../ui/FollowerCounter";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export default function ProfileHead({
    username,
    banner,
    avatar,
    location,
    bio,
    website,
    followerCount,
    followingCount,
    isFollowing,
    onFollowToggle,
    isCurrentUser,
    isBlocked,
    onBlockToggle,
}: ProfileHeadProps) {
    const navigate = useNavigate();

    // Maintain a local state for blocked user
    const [localIsBlocked, setLocalIsBlocked] = useState(isBlocked);

    // Check if the blocked state is in localStorage
    useEffect(() => {
        const storedBlockedStatus = localStorage.getItem(`blocked_${username}`);
        if (storedBlockedStatus) {
            setLocalIsBlocked(storedBlockedStatus === "true");
        }
    }, [username]);

    // Update localStorage when the block status changes
    const handleBlockToggle = () => {
        // Trigger the block/unblock callback passed from the parent (Profile)
        onBlockToggle();

        // Toggle local blocked state
        const newBlockedState = !localIsBlocked;
        setLocalIsBlocked(newBlockedState);

        // Store the new block status in localStorage
        localStorage.setItem(`blocked_${username}`, newBlockedState.toString());
    };

    return (
        <div className="flex flex-col justify-center p-5 gap-5 w-full md:w-1/2 rounded-4xl bg-post-background mx-auto">
            <div
                className="relative h-48 md:h-80 bg-cover bg-center rounded-lg"
                style={{
                    backgroundImage: `url(${banner})`,
                    backgroundPosition: "center",
                }}
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
                <FollowerCounter followerCount={followerCount} followingCount={followingCount} />
            </div>

            {isCurrentUser && (
                <div className="flex justify-center">
                    <Button
                        variant="nobg"
                        size="default"
                        rounded="default"
                        width="fit"
                        className="min-w-28"
                        onClick={() => navigate("/editprofile")}
                    >
                        Edit your profile
                    </Button>
                </div>
            )}

            {/* Show Follow/Unfollow Button if Not Current User and Not Blocked */}
            {!isCurrentUser && !localIsBlocked && (
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

            {/* Block/Unblock button if Not Current User */}
            {!isCurrentUser && (
                <div className="flex justify-center">
                    <Button
                        variant="nobg"
                        size="default"
                        rounded="default"
                        width="fit"
                        className="min-w-28"
                        onClick={handleBlockToggle}
                    >
                        {/* If user is blocked, show 'Unblock', otherwise 'Block' */}
                        {localIsBlocked ? "Unblock" : "Block"}
                    </Button>
                </div>
            )}
        </div>
    );
}
