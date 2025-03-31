import DateTime from "../ui/DateTime";
import { PostProps } from "../interfaces/dataDefinitions";
import Avatar from "../ui/Avatar";
import { useState, useEffect } from "react";
import Like from "../ui/Like";
import { DeleteIcon } from "../assets/icons";

export default function Post({ id, avatar, username, content, created_at, user_id }: PostProps) {
    const [liked, setLiked] = useState<boolean>(false);
    const [loggedInUserId, setUserId] = useState<string | null>(null); // Store the ID

    const token = localStorage.getItem("access_token");

    useEffect(() => {
        if (token) {
            // Fetch user data by token
            fetch("http://localhost:8080/token", {  // Updated endpoint name here
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,  // Pass the token for authentication
            },
            })
            .then((response) => response.json())
            .then((data) => {
                if (data && data.user_id) {
                setUserId(data.user_id);
                } else {
                console.error("User data not found.");
                }
            });
        }
    }, [token]);

    const handleDetetePost = () => {
        if (window.confirm("Are you sure you want to delete this post?")) {
            fetch(`http://localhost:8080/posts/${id}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
                .then((response) => {
                    if (!response.ok) {
                        throw new Error("Failed to delete the post.");
                    }
                    return response.json();
                })
                .then((data) => {
                    console.log(data.message);
                    // Optionally, trigger a state update or refresh the post list
                })
                .catch((error) => {
                    console.error("Error deleting post:", error);
                });
                window.location.reload();
        }
    }

    return (
        <div className="flex flex-col p-5 gap-4 w-full md:w-1/2 rounded-4xl bg-post-background">
            <Avatar avatar={avatar} username={username} color="black" />
            <div>
                <p className="text-xl text-post-text">{content}</p>
                <hr className="my-4 border-post-grey" />
                <div className="flex flex-row justify-between items-center">
                    <DateTime date={created_at} />
                    <div className="flex flex-row justify-center items-center gap-2">
                        {String(loggedInUserId) === String(user_id) && (
                            <div
                                className="cursor-pointer"
                                onClick={() => { handleDetetePost(); }}
                            >
                                <DeleteIcon className="cursor-pointer" />
                            </div>
                        )}
                        <Like liked={liked} setLiked={setLiked} />
                    </div>
                </div>
            </div>
        </div>
    );
}
