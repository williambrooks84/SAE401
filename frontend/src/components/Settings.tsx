import { CrossIcon } from "../assets/icons";
import { Link } from "react-router-dom";

interface ProfileLoginProps {
    isVisible: boolean;
    onClose: () => void;
}

export default function ProfileLogin({ isVisible, onClose }: ProfileLoginProps) {
    if (!isVisible) return null;
    
    return (
        <div className="fixed top-18 left-1/2 transform -translate-x-1/2 w-2/3 md:w-1/4 shadow-lg z-50 h-fit bg-post-background px-5 py-10 rounded-4xl">
            <button onClick={onClose} className="absolute top-3 left-3">
                <CrossIcon className="w-6 h-6" />
            </button>
            <Link to="/dashboard" aria-label="Dashboard" className="text-center text-lg font-bold">Administrator Dashboard</Link>
        </div>
    )
}