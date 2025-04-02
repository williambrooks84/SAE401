import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import NavigationBar from "../ui/NavigationBar";
import Post from "./Post";
import { PostData, ProfileProps } from "../interfaces/dataDefinitions";
import ProfileHead from "./ProfileHead";
import { useAuth } from "../context/AuthContext"; // Import useAuth

export default function Profile() {
  const { userId } = useParams<{ userId: string }>();
  const [profileData, setProfileData] = useState<ProfileProps | null>(null);
  const [posts, setPosts] = useState<PostData[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);

  const { user, token } = useAuth();  // Use the user and token from AuthContext
  const connectedUserId = user?.userId;  // Use userId from AuthContext

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
              followerCount: data.follower_count,
              followingCount: data.following_count,
            });
          }
        });
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
        .finally(() => setLoading(false));
    }
  }, [userId]);

  function handleFollowToggle() {
    if (token) {
      fetch(`http://localhost:8080/users/${userId}/${isFollowing ? "unfollow" : "follow"}`, {
        method: isFollowing ? "DELETE" : "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })
        .then((response) => {
          if (response.ok) {
            setIsFollowing((prevState) => !prevState);
            setProfileData((prevData) => {
              if (!prevData) return null; // Ensure prevData exists
              return {
                ...prevData,
                followerCount: isFollowing
                  ? prevData.followerCount - 1
                  : prevData.followerCount + 1, // Update count locally
              };
            });
          } else {
            response.json().then((data) => {
              console.error(data.error || "An error occurred");
            });
          }
        })
        .catch((error) => {
          console.error("Network error:", error);
        });
    }
  }
  

  useEffect(() => {
    if (userId && token) {
      fetch(`http://localhost:8080/users/isFollowing/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((response) => response.json())
        .then((data) => {
          if (data && typeof data.is_following === "boolean") {
            setIsFollowing(data.is_following); // Corrected key name
          }
        })
        .catch((error) => console.error("Error fetching follow status:", error));
    }
  }, [userId, token]);

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
          followerCount={profileData.followerCount}
          followingCount={profileData.followingCount}
          onFollowToggle={handleFollowToggle}
          isCurrentUser={String(userId) === String(connectedUserId)} // Compare userIds correctly
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
