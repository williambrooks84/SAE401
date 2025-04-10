import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import NavigationBar from "../ui/NavigationBar";
import Post from "./Post";
import { PostData, ProfileProps } from "../interfaces/dataDefinitions";
import ProfileHead from "./ProfileHead";
import { useAuth } from "../context/AuthContext";

export default function Profile() {
  const { userId } = useParams<{ userId: string }>();
  const [profileData, setProfileData] = useState<ProfileProps | null>(null);
  const [posts, setPosts] = useState<PostData[]>([]);
  const [loading, setLoading] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isBlocked, setIsBlocked] = useState<boolean>(false);  // Track if the user is blocked
  const { user, token } = useAuth();
  const connectedUserId = user?.userId;

  // Fetch block status from the backend
  useEffect(() => {
    if (!userId || !token) return;

    fetch(`http://localhost:8080/users/${userId}/is-blocked`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((response) => response.json())
      .then((data) => {
        setIsBlocked(data.isBlocked); // Set the block status
      })
      .catch((error) => console.error("Failed to fetch block status:", error));
  }, [userId, token]);

  // Fetch profile data
  useEffect(() => {
    if (!userId) return;

    // Fetch profile data
    fetch(`http://localhost:8080/profile/${userId}`)
      .then((response) => response.json())
      .then((data) => {
        if (data) {
          setProfileData({
            username: data.username,
            banner: `http://localhost:8080${data.banner}`,
            avatar: `http://localhost:8080${data.avatar}`,
            location: data.location,
            bio: data.bio,
            website: data.website,
            followerCount: data.follower_count,
            followingCount: data.following_count,
            is_blocked: data.is_blocked,
          });
        }
      });
  }, [userId]);

  // Fetch follow status after profile data is loaded
  useEffect(() => {
    if (!userId || !token || !profileData) return;

    // Fetch follow status
    fetch(`http://localhost:8080/users/isFollowing/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((response) => response.json())
      .then((data) => {
        setIsFollowing(data.is_following);
      });
  }, [userId, token, profileData]);

  // Fetch posts only if the user is NOT blocked
  useEffect(() => {
    if (isBlocked) {
      setPosts([]); // Clear posts if the user is blocked
      return; // Skip fetching posts if blocked
    }

    if (!userId || !profileData || !token) return;

    setLoading(true);
    fetch(`http://localhost:8080/posts/user/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((response) => response.json())
      .then((data) => {
        setPosts(data.posts || []); // Set posts if not blocked
      })
      .finally(() => {
        setLoading(false);
      });
  }, [userId, profileData, token, isBlocked]);

  // Follow/unfollow logic
  function handleFollowToggle() {
    if (!token) return;

    fetch(`http://localhost:8080/users/${userId}/${isFollowing ? "unfollow" : "follow"}`, {
      method: isFollowing ? "DELETE" : "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    }).then((response) => {
      if (response.ok) {
        setIsFollowing(!isFollowing);
        setProfileData((prevData) =>
          prevData
            ? { ...prevData, followerCount: isFollowing ? prevData.followerCount - 1 : prevData.followerCount + 1 }
            : null
        );
      }
    });
  }

  // Block/unblock logic (Unfollow on both sides)
  function handleBlockToggle() {
    if (!token) return;

    // Block user logic
    fetch(`http://localhost:8080/users/${userId}/block`, {
      method: isBlocked ? "DELETE" : "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        if (response.ok) {
          // Automatically unfollow when blocked
          if (!isBlocked) {
            setIsFollowing(false); // Unfollow the user on current side
            // Unfollow the current user on the blocked user's side
            fetch(`http://localhost:8080/users/${userId}/unfollow`, {
              method: "DELETE",
              headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
            });
          }
          setIsBlocked(!isBlocked);  // Toggle block status in the state
          window.location.reload(); // Refresh the window
        } else {
          console.error("Failed to toggle block status:", response.status);
          alert("Something went wrong. Please try again later.");
        }
      })
      .catch((error) => {
        console.error("Network error:", error);
        alert("An error occurred. Please check your connection.");
      });
  }

  if (!profileData) return <p>Loading...</p>;

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
          isCurrentUser={String(userId) === String(connectedUserId)}
          isBlocked={isBlocked}
          onBlockToggle={handleBlockToggle}
        />
        
        {/* Show posts or a message if blocked */}
        {isBlocked ? (
          <p>This user is blocked. Posts are hidden.</p>
        ) : (
          <>
            {posts.length === 0 ? (
              <p>No posts to show</p>
            ) : (
              posts.map((post: PostData, index) => (
                <Post
                  key={`${post.id}-${index}`}
                  id={post.id}
                  user_id={post.user_id}
                  avatar={post.avatar}
                  username={post.username}
                  content={post.content}
                  created_at={post.created_at}
                  file_paths={post.file_paths}
                />
              ))
            )}
            {loading && <p>Loading more posts...</p>}
          </>
        )}
      </div>
    </div>
  );
}
