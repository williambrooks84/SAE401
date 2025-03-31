import { HeartIcon, HeartIconTriggered } from "../assets/icons";

interface LikeProps {
    liked: boolean;
    setLiked: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function Like({ liked, setLiked }: LikeProps) {
    return (
        <button
            onClick={() => setLiked((prev) => !prev)}
            className="focus:outline-none"
        >
            {liked ? <HeartIconTriggered /> : <HeartIcon className="text-gray-500" />}
        </button>
    );
}

