import { HeartIcon, HeartIconTriggered } from "../assets/icons";

interface LikeProps {
  liked: boolean;
  setLiked: (newLiked: boolean) => void;
}

export default function Like({ liked, setLiked }: LikeProps) {
  // This function toggles the 'liked' state.
  const handleLikeToggle = () => {
    setLiked(!liked);  // Toggle the liked state
  };

  return (
    <button onClick={handleLikeToggle} className="focus:outline-none">
      {/* Conditionally render the icon based on the 'liked' state */}
      {liked ? <HeartIconTriggered /> : <HeartIcon className="text-gray-500" />}
    </button>
  );
}
