import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import NavigationBar from "../ui/NavigationBar";
import { BlockedUserProps } from "../interfaces/dataDefinitions";

export default function Blocklist(){
    const { token } = useAuth(); 
    const { userId } = useParams<{ userId: string }>();

    const [blockedUsers, setBlockedUsers] = useState<BlockedUserProps[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        async function fetchBlockedUsers() {
            if (loading) return;

            setLoading(true);

            try {
                const response = await fetch(`http://localhost:8080/blocklist/${userId}`, {
                    method: "GET",
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (!response.ok) {
                    if (response.status === 404) {
                        console.warn("No blocked users found.");
                        setBlockedUsers([]);
                    } else {
                        console.error("Failed to fetch blocked users");
                    }
                    setLoading(false);
                    return;
                }

                const data = await response.json();
                setBlockedUsers(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error("Error fetching blocked users:", err);
            } finally {
                setLoading(false);
            }
        }

        fetchBlockedUsers();
    }, [token, userId, loading]);

    return (
        <div className="flex flex-col gap-2 items-center">
            <NavigationBar />

            <div className="flex flex-col items-center justify-center gap-5 w-full md:max-w-2/3 p-5">
            <h1 className="text-xl font-bold">Blocked Users</h1>
            {blockedUsers.length === 0 ? (
            <p>No blocked users to display.</p>
            ) : (
            <ul className="flex flex-col gap-3 w-full">
            {blockedUsers.map(user => (
                <div
                key={user.id}
                className="flex items-center gap-3 p-3 border rounded-md shadow-sm w-full">
                <p className="text-2xl font-semibold">{user.username}</p>
                </div>
            ))}
            </ul>
            )}
            </div>
        </div>
    );
}