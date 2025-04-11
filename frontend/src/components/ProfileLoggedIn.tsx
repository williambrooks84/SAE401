import Button from "../ui/Button";
import { useNavigate } from "react-router-dom";
import { ProfileButtonIcon } from "../assets/icons";
import { useAuth } from "../context/AuthContext"; 

export default function ProfileLoggedIn() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const username = user?.username;
  const userId = user?.userId;

  const handleLogout = () => {
    logout(); 
    navigate("/login"); 
  };

  return (
    <div className="flex flex-col items-center gap-7">
      <p className="text-center text-lg font-bold">Welcome, {username || 'User'}!</p> 
      {userId && (
        <Button
          variant="nobg"
          size="default"
          rounded="default"
          width="fit"
          padding="default"
          onClick={() => navigate(`/profile/${userId}`)} 
          className="flex flex-row items-center gap-2"
        >
          <ProfileButtonIcon className="w-4 h-4" />
          <p className="text-sm">Profile</p>
        </Button>
      )}
      <Button
        variant="nobg"
        size="default"
        textSize="large"
        rounded="default"
        width="fit"
        padding="default"
        onClick={() => navigate("/foryou")}
      >
        For you
      </Button>

      <Button
        variant="default"
        size="default"
        rounded="default"
        width="fit"
        padding="default"
        onClick={handleLogout} 
      >
        Logout
      </Button>
    </div>
  );
}
