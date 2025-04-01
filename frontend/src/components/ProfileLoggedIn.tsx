import Button from "../ui/Button";
import { useNavigate } from "react-router-dom";
import { ProfileButtonIcon } from "../assets/icons";
import { useAuth } from "../context/AuthContext"; // Use AuthContext

export default function ProfileLoggedIn() {
  const navigate = useNavigate();
  const { user, logout } = useAuth(); // Destructure user and logout from AuthContext

  // Use user data directly from context
  const username = user?.username;  // Directly access the username from context
  const userId = user?.userId;  // Directly access the userId from context

  const handleLogout = () => {
    logout(); // Call logout from context to handle logout
    navigate("/login");  // Navigate to the login page after logout
  };

  return (
    <div className="flex flex-col items-center gap-7">
      {/* Display username */}
      <p className="text-center text-lg font-bold">Welcome, {username || 'User'}!</p>  {/* Show username or 'User' if not available */}
      {userId && (
        <Button
          variant="nobg"
          size="default"
          rounded="default"
          width="fit"
          padding="default"
          onClick={() => navigate(`/profile/${userId}`)} // Navigate to the user's profile
          className="flex flex-row items-center gap-2"
        >
          <ProfileButtonIcon className="w-4 h-4" />
          <p className="text-sm">Profile</p>
        </Button>
      )}
      <Button
        variant="default"
        size="default"
        rounded="default"
        width="fit"
        padding="default"
        onClick={handleLogout} // Logout when clicked
      >
        Logout
      </Button>
    </div>
  );
}
