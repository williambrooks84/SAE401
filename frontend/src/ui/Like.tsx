import { HeartIcon, HeartIconTriggered } from "../assets/icons";

interface LikeProps {
  liked: boolean;
  setLiked: (newLiked: boolean) => void;
}

export default function Like({ liked, setLiked }: LikeProps) {
  const handleLikeToggle = () => {
    setLiked(!liked); 
  };

  return (
    <button onClick={handleLikeToggle} className="focus:outline-none">
      {liked ? <HeartIconTriggered /> : <HeartIcon className="text-gray-500" />}
    </button>
  );
}
