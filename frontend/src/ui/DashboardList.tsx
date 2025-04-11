import { useState, useEffect } from "react";
import { UserProps } from "../interfaces/dataDefinitions";
import { DashboardListProps } from "../interfaces/dataDefinitions";
import { API_BASE_URL } from "../utils/config";

export default function DashboardList({ onSelectUser }: DashboardListProps) {
    const [users, setUsers] = useState<UserProps[]>([]);
    const [selectedUserId, setSelectedUserId] = useState<string>("");

    useEffect(() => {
        fetch(`${API_BASE_URL}/users`)
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Failed to fetch users");
                }
                return response.json();
            })
            .then((data) => {
                setUsers(data);
            });
    }, []);

    const handleUserChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const userId = e.target.value;
        setSelectedUserId(userId);
        onSelectUser(userId); // Pass the selected user ID to the parent component
    };

    return (
        <div className="flex flex-col items-center justify-center gap-4">
            <select 
                value={selectedUserId} 
                onChange={handleUserChange} 
                className="w-2/3 md:w-1/4 text-center text-lg font-semibold border border-border-grey rounded-4xl p-2"
            >
                <option value="">Select a user</option>
                {users.map((user) => (
                    <option key={user.id} value={user.id}>
                        {user.username}
                    </option>
                ))}
            </select>
            <div className="flex flex-col items-center w-full">
                <div className="text-left w-2/3 md:w-1/4">
                    {selectedUserId ? (
                        <>
                            <p className="text-post-grey text-sm font-medium">Selected username: <span className="text-black">{users.find(user => user.id === Number(selectedUserId))?.username || "N/A"}</span></p>
                            <p className="text-post-grey text-sm font-medium mt-2">Selected email: <span className="text-black">{users.find(user => user.id === Number(selectedUserId))?.email || "N/A"}</span></p>
                        </>
                    ) : (
                        <>
                            <p className="text-post-grey text-sm font-medium">Selected username: <span className="text-black">N/A</span></p>
                            <p className="text-post-grey text-sm font-medium mt-2">Selected email: <span className="text-black">N/A</span></p>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
