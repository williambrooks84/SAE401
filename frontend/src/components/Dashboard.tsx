import { useState } from "react";
import DashboardHeader from "../ui/DashboardHeader";
import DashboardList from "../ui/DashboardList";
import FormLabel from "../ui/FormLabel";
import FormBox from "../ui/FormBox";
import Button from "../ui/Button";

export default function Dashboard() {
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
    const [newUsername, setNewUsername] = useState("");
    const [newEmail, setNewEmail] = useState("");
    const [newUsernameError, setNewUsernameError] = useState('');
    const [newEmailError, setNewEmailError] = useState('');

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
            fetch('http://localhost:8080/update', { // URL remains the same
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                id: selectedUserId,  // ✅ Send user ID
                username: newUsername, 
                email: newEmail 
            }),
            })
            .then((response) => {
            if (!response.ok) {
                return response.json().then((data) => {
                throw new Error(data.error || 'Update failed');
                });
            }
            return response.json();
            })
            .then(() => {
            alert('Update complete!');
            window.location.reload(); // Refresh the page
            })
            .catch(() => {
            alert('An error occurred while updating the user.');
            });
        }
    }    
    
    return (
        <div className="flex flex-col gap-4">
            <DashboardHeader />
            <DashboardList onSelectUser={setSelectedUserId} /> {/* Pass function to get user ID */}
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
                <div className="flex justify-center">
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
                </div>
            </div>
        </div>
    );
}
