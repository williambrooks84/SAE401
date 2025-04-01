import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardHeader from "../ui/DashboardHeader";
import DashboardList from "../ui/DashboardList";
import FormLabel from "../ui/FormLabel";
import FormBox from "../ui/FormBox";
import Button from "../ui/Button";
import { useAuth } from "../context/AuthContext"; // Import useAuth

export default function Dashboard() {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [newUsername, setNewUsername] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newUsernameError, setNewUsernameError] = useState('');
  const [newEmailError, setNewEmailError] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  const { token } = useAuth(); // Access token and user from context

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
          if (data && data.role && data.role.includes("ROLE_ADMIN")) {
            setIsAdmin(true);
          } else {
            alert("Access denied. Admins only.");
            navigate("/"); // Redirect to home or login page
          }
        })
        .catch(() => {
          alert("Failed to authenticate, please log in again.");
          navigate("/login"); // Redirect if token is invalid
        });
    } else {
      navigate("/login"); // Redirect if no token
    }
  }, [token, navigate]);

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleNewEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewEmail(e.target.value);
  };

  const handleNewUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewUsername(e.target.value);
  };

  const handleConfirmClick = () => {
    if (!selectedUserId) {
      alert("Please select a user first.");
      return;
    }
  
    let valid = true;
    if (newUsername === '') {
      setNewUsernameError('Please enter a new username.');
      valid = false;
    } else {
      setNewUsernameError('');
    }
  
    if (!validateEmail(newEmail)) {
      setNewEmailError('Please enter a valid email address.');
      valid = false;
    } else {
      setNewEmailError('');
    }
  
    if (valid) {
      if (!token) {
        alert("No token found, please log in again.");
        return;
      }
  
      fetch('http://localhost:8080/update', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, // Add Authorization header
        },
        body: JSON.stringify({
          id: selectedUserId,
          username: newUsername,
          email: newEmail
        }),
      })
      .then(async (response) => {
        const data = await response.json(); // Convert response to JSON
        
        if (!response.ok) {
          throw new Error(data.error || (data.errors ? data.errors.join(', ') : 'Update failed'));
        }
        return data;
      })
      .then(() => {
        alert('User updated successfully!');
        window.location.reload(); // Reload page
      })
      .catch((error) => {
        alert(`Error: ${error.message}`); // Display error messages
      });
    }
  };

  if (!isAdmin) {
    return null; // Render nothing while checking admin status
  }

  return (
    <div className="flex flex-col gap-4">
      <DashboardHeader />
      <DashboardList onSelectUser={setSelectedUserId} />
      <div className="flex flex-col p-6 gap-4 md:flex md:flex-col md:justify-center md:w-1/3 md:mx-auto">
        <div className="flex flex-col gap-2">
          <FormLabel label="Change username:" />
          <FormBox
            placeholder="New username"
            value={newUsername}
            onChange={handleNewUsernameChange}
          />
          {newUsernameError && <span className="text-error">{newUsernameError}</span>}
        </div>
        <div className="flex flex-col gap-2">
          <FormLabel label="Change email:" />
          <FormBox
            placeholder="New email"
            value={newEmail}
            onChange={handleNewEmailChange}
          />
          {newEmailError && <span className="text-error">{newEmailError}</span>}
        </div>
        <div className="flex flex-col items-center justify-center gap-3">
          <Button 
            variant="default" 
            size="default" 
            rounded="default" 
            width="fit" 
            padding="default" 
            onClick={handleConfirmClick}
          >
            Confirm
          </Button>

          <Button
            variant="greybgless"
            size="bgless"
            rounded="none"
            width="fit"
            onClick={() => navigate("/")}
          >
            Finished? Go back to the home
          </Button>    
        </div>
      </div>
    </div>
  );
}
