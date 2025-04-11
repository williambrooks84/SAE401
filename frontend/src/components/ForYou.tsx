import { useEffect, useState } from "react";
import Post from "./Post";
import { PostData } from "../interfaces/dataDefinitions";
import NavigationBar from "../ui/NavigationBar";
import Button from "../ui/Button";
import { useAuth } from "../context/AuthContext";
import { API_BASE_URL } from "../utils/config";

export default function ForYou() {
  const { token } = useAuth(); // Retrieve the token from the AuthContext
  const [posts, setPosts] = useState<PostData[]>([]);
  const [loading, setLoading] = useState(false);

  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(30);

  // Automatically refresh posts based on interval
  useEffect(() => {
    if (!autoRefresh) return;

    const intervalId = setInterval(() => {
      refreshPosts();
    }, refreshInterval * 1000);

    return () => clearInterval(intervalId);
  }, [autoRefresh, refreshInterval]);

  // Fetch posts from the /posts/following endpoint
  useEffect(() => {
    async function fetchPosts() {
      if (loading) return;

      setLoading(true);

      const response = await fetch(`${API_BASE_URL}/posts/following`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!response.ok) {
        setLoading(false);
        return;
      }

      const data = await response.json();

      const filteredPosts = data.posts.filter((post: PostData) => post.is_blocked !== true);

      setPosts(filteredPosts);
      setLoading(false);
    }

    fetchPosts();
  }, [token]);

  const refreshPosts = async () => {
    setLoading(true);

    const response = await fetch(`${API_BASE_URL}/posts/following`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    if (!response.ok) {
      setLoading(false);
      return;
    }

    const data = await response.json();

    const filteredPosts = data.posts.filter((post: PostData) => post.is_blocked !== true);
    setPosts(filteredPosts);

    setLoading(false);
  };

  useEffect(() => {
    const savedAutoRefresh = localStorage.getItem("autoRefresh");
    const savedInterval = localStorage.getItem("refreshInterval");

    if (savedAutoRefresh !== null) {
      setAutoRefresh(savedAutoRefresh === "true");
    }
    if (savedInterval !== null) {
      setRefreshInterval(Number(savedInterval));
    }
  }, []);

  return (
    <div>
      <NavigationBar />
      <div className="p-5 flex flex-col items-center justify-center max-w-full md:max-w-2/3 space-y-5 mx-auto">
        <Button
          variant="nobg"
          size="default"
          textSize="large"
          rounded="default"
          width="fit"
          padding="default"
          onClick={refreshPosts}
        >
          Refresh the feed
        </Button>
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
            />
          ))
        )}
        {loading && <p>Loading more posts...</p>}
      </div>
    </div>
  );
}
