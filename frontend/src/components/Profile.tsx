import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import NavigationBar from "../ui/NavigationBar";
import Post from "./Post";
import { PostData, ProfileProps } from "../interfaces/dataDefinitions";
import ProfileHead from "./ProfileHead";
import { useAuth } from "../context/AuthContext";
import { API_BASE_URL } from "../utils/config";

export default function Profile() {
  const { userId } = useParams<{ userId: string }>();
  const [profileData, setProfileData] = useState<ProfileProps | null>(null);
  const [posts, setPosts] = useState<PostData[]>([]);
  const [loading, setLoading] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isBlocked, setIsBlocked] = useState<boolean>(false); 
  const [blockedMe, setBlockedMe] = useState<boolean>(false); 
  const { user, token } = useAuth();
  const connectedUserId = user?.userId;

  useEffect(() => {
    if (!userId || !token) return;

    const storedIsBlocked = localStorage.getItem(`isBlocked_${userId}`);
    const storedBlockedMe = localStorage.getItem(`blockedMe_${userId}`);
    
    if (storedIsBlocked && storedBlockedMe) {
      setIsBlocked(storedIsBlocked === "true");
      setBlockedMe(storedBlockedMe === "true");
    }

    fetch(`${API_BASE_URL}/users/${userId}/is-blocked`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((response) => response.json())
      .then((data) => {
        if (data && typeof data.isBlockedByCurrentUser !== 'undefined' && typeof data.isBlockedByProfileUser !== 'undefined') {
          setIsBlocked(data.isBlockedByCurrentUser);
          setBlockedMe(data.isBlockedByProfileUser);

          localStorage.setItem(`isBlocked_${userId}`, data.isBlockedByCurrentUser.toString());
          localStorage.setItem(`blockedMe_${userId}`, data.isBlockedByProfileUser.toString());
        } else {
          console.error("Block status data is invalid:", data);
        }
      })
      .catch((error) => {
        console.error("Failed to fetch block status:", error);
      });
  }, [userId, token]);

  useEffect(() => {
    if (!userId) return;

    fetch(`${API_BASE_URL}/profile/${userId}`)
      .then((response) => response.json())
      .then((data) => {
        if (data) {
          setProfileData({
            username: data.username,
            banner: `${API_BASE_URL}${data.banner}`,
            avatar: `${API_BASE_URL}${data.avatar}`,
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

  useEffect(() => {
    if (!userId || !token || !profileData) return;

    fetch(`${API_BASE_URL}/users/isFollowing/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((response) => response.json())
      .then((data) => {
        setIsFollowing(data.is_following);
      });
  }, [userId, token, profileData]);

  useEffect(() => {
    if (isBlocked || blockedMe) {
      setPosts([]);
      return;
    }

    if (!userId || !profileData || !token) return;

    setLoading(true);
    fetch(`${API_BASE_URL}/posts/user/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((response) => response.json())
      .then((data) => {
        setPosts(data.posts || []);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [userId, profileData, token, isBlocked, blockedMe]);

  function handleFollowToggle() {
    if (!token) return;

    fetch(`${API_BASE_URL}/users/${userId}/${isFollowing ? "unfollow" : "follow"}`, {
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

  function handleBlockToggle() {
    if (!token) return;
  
    fetch(`${API_BASE_URL}/users/${userId}/block`, {
      method: isBlocked ? "DELETE" : "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        if (response.ok) {
          const newBlockStatus = !isBlocked;
          setIsBlocked(newBlockStatus); 
          setBlockedMe(newBlockStatus);
  
          localStorage.setItem(`isBlocked_${userId}`, newBlockStatus.toString());
          localStorage.setItem(`blockedMe_${userId}`, newBlockStatus.toString());
  
          console.log("Block status updated:", { isBlocked: newBlockStatus, blockedMe: newBlockStatus });
  
          if (newBlockStatus) {
            setIsFollowing(false);
            fetch(`${API_BASE_URL}/users/${userId}/unfollow`, {
              method: "DELETE",
              headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
            });
          }
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
          followerCount={profileData.followerCount}
          followingCount={profileData.followingCount}
          isFollowing={isFollowing}
          onFollowToggle={handleFollowToggle}
          isCurrentUser={String(userId) === String(connectedUserId)}
          isBlocked={isBlocked}
          onBlockToggle={handleBlockToggle}
          blockedMe={blockedMe}
        />
        
        {blockedMe ? (
          <div className="flex flex-col items-center">
            <p>This user has blocked you. You cannot see their posts or follow them.</p>
          </div>
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
