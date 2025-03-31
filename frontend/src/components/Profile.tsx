import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import NavigationBar from "../ui/NavigationBar";
import Post from "./Post";
import { PostData, ProfileProps } from "../interfaces/dataDefinitions";
import ProfileHead from "./ProfileHead";

export default function Profile() {
    const { userId } = useParams<{ userId: string }>();
    const [profileData, setProfileData] = useState<ProfileProps | null>(null);
    const [posts, setPosts] = useState<PostData[]>([]);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [isFollowing, setIsFollowing] = useState(false);

    const connectedUserId = localStorage.getItem("connectedUserId");

    useEffect(() => {
        if (userId) {
            fetch(`http://localhost:8080/profile/${userId}`)
                .then((response) => response.json())
                .then((data) => {
                    if (data && data.username) {
                        setProfileData({
                            username: data.username,
                            banner: data.banner,
                            avatar: data.avatar,
                            location: data.location,
                            bio: data.bio,
                            website: data.website,
                        });
                    }
                })
                .catch((error) => console.error("Error fetching profile data:", error));
        }
    }, [userId]);

    useEffect(() => {
        if (userId) {
            setLoading(true);
            fetch(`http://localhost:8080/posts/user/${userId}`)
                .then((response) => response.json())
                .then((data) => {
                    setPosts(data.posts || []);
                    setHasMore((data.posts || []).length > 0);
                })
                .catch((error) => console.error("Error fetching posts:", error))
                .finally(() => setLoading(false));
        }
    }, [userId]);

    function handleFollowToggle() {
        const token = localStorage.getItem("access_token");
        if (token) {
            fetch(`http://localhost:8080/${isFollowing ? "unfollow" : "follow"}/${userId}`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            })
                .then((response) => {
                    if (response.ok) {
                        setIsFollowing(!isFollowing);
                    } else {
                        console.error("Error toggling follow state");
                    }
                })
                .catch((error) => console.error("Error:", error));
        }
    }

    if (!profileData) {
        return <p>Loading...</p>;
    }

    return (
        <div className="flex flex-col gap-2 items-center">
            <NavigationBar />

            <div className="flex flex-col items-center justify-center gap-5 w-full md:max-w-2/3 p-5">

                <ProfileHead
                    username={profileData.username}
                    banner={profileData.banner}
                    avatar={profileData.avatar}
                    location={profileData.location}
                    bio={profileData.bio}
                    website={profileData.website}
                    isFollowing={isFollowing}
                    onFollowToggle={handleFollowToggle}
                    isCurrentUser={String(userId) === String(connectedUserId)}
                />

                {posts.map((post: PostData, index) => (
                    <Post key={`${post.id}-${index}`} {...post} />
                ))}
                {loading && <p>Loading more posts...</p>}
                {!hasMore && <p>No more posts to load.</p>}
            </div>
        </div>
    );
}
