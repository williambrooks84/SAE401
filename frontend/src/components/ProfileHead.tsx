import { LocationIcon, LinkIcon } from "../assets/icons";
import { ProfileHeadProps } from "../interfaces/dataDefinitions";
import Button from "../ui/Button";
import Avatar from "../ui/Avatar";
import FollowerCounter from "../ui/FollowerCounter";
import { useNavigate } from "react-router-dom";

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
  blockedMe,
}: ProfileHeadProps) {
  const navigate = useNavigate();

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

        {!isCurrentUser && !blockedMe && !isBlocked && (
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
      {!isCurrentUser && (
        <div className="flex justify-center">
          <Button
            variant="nobg"
            size="default"
            rounded="default"
            width="fit"
            className="min-w-28"
            onClick={onBlockToggle}
          >
            {isBlocked ? "Unblock" : "Block"}
          </Button>
        </div>
      )}
    </div>
  );
}