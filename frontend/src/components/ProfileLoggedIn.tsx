import Button from "../ui/Button";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { ProfileButtonIcon } from "../assets/icons";

export default function ProfileLoggedIn() {
  const navigate = useNavigate();
  const [username, setUsername] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null); 
  const token = localStorage.getItem("access_token");
  
  useEffect(() => {
    if (token) {
      fetch("http://localhost:8080/token", { 
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,  
        },
      })
        .then((response) => response.json())
        .then((data) => {
          if (data && data.username) {
            setUsername(data.username);
          } 
          if (data && data.user_id) {
            setUserId(data.user_id);
          } else {
            console.error("User data not found.");
          }
        });
    }
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    fetch("http://localhost:8080/logout", {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to log out on the server.");
        }
      })
      .catch((error) => {
        console.error("Error during logout:", error);
      });
    navigate("/login");
  };

  return (
    <div className="flex flex-col items-center gap-7">
      <p className="text-center text-lg font-bold">Welcome, {username}!</p>
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
        variant="default"
        size="default"
        rounded="default"
        width="fit"
        padding="default"
        onClick={handleLogout} // Calls the logout function when clicked
      >
        Logout
      </Button>
    </div>
  );
}
