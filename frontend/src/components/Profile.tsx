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
  const { user, token } = useAuth();
  const connectedUserId = user?.userId;

  // Fetch profile data
  useEffect(() => {
    if (!userId) return;

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

  // Fetch posts only if the user is NOT blocked
  useEffect(() => {
    if (!userId || !profileData) return;

    if (profileData.is_blocked) {
      setPosts([]);
      return;
    }

    setLoading(true);
    fetch(`http://localhost:8080/posts/user/${userId}`)
      .then((response) => response.json())
      .then((data) => {
        setPosts(data.posts || []);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [userId, profileData]);

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

  // Check follow status
  useEffect(() => {
    if (!userId || !token) return;

    fetch(`http://localhost:8080/users/isFollowing/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((response) => response.json())
      .then((data) => {
        setIsFollowing(data.is_following);
      });
  }, [userId, token]);

  if (!profileData) return <p>Loading...</p>;

  return (
    <div className="flex flex-col gap-2 items-center">
      <NavigationBar />

      {profileData.is_blocked ? (
        <div className="p-5 text-xl text-red-500">
          This user has been blocked for violation of terms of service.
        </div>
      ) : (
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
          />
          {/* Only show posts if the user is NOT blocked */}
          {profileData.is_blocked ? (
            <p>This user has been blocked and their posts are hidden.</p>
          ) : (
            <>
              {posts.length > 0 ? (
                posts.map((post) => (
                  <Post key={post.id} {...post} />
                ))
              ) : loading ? (
                <p>Loading posts...</p>
              ) : (
                <p>No posts available.</p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
