import Button from "../ui/Button";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { API_BASE_URL } from "../utils/config";

export default function ProfileLoggedIn() {
  const navigate = useNavigate();
  const [username, setUsername] = useState<string | null>(null); // Store the username
  const token = localStorage.getItem("access_token");
  
  useEffect(() => {
    if (token) {
      // Fetch user data by token
      fetch(`${API_BASE_URL}/token`, {  // Updated endpoint name here
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,  // Pass the token for authentication
        },
      })
        .then((response) => response.json())
        .then((data) => {
          if (data && data.username) {
            setUsername(data.username); // Set the username in state
          } else {
            console.error("User data not found.");
          }
        })
        .catch((error) => {
          console.error("Error fetching user data:", error);
        });
    }
  }, [token]);

  const handleLogout = () => {
    // Remove the token from localStorage (effectively logging out the user)
    localStorage.removeItem("access_token");

    // Redirect the user to the login page
    navigate("/login");
  };

  return (
    <div className="flex flex-col items-center gap-7">
      <p className="text-center text-lg font-bold">Welcome, {username}!</p>
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
