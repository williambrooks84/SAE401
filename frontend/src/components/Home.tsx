import { useEffect, useState } from "react";
import Post from "./Post";
import { PostData } from "../interfaces/dataDefinitions";
import NavigationBar from "../ui/NavigationBar";
import Button from "../ui/Button";
import { useAuth } from "../context/AuthContext"; 

export default function Home() {
  const { token } = useAuth(); 
  const [posts, setPosts] = useState<PostData[]>([]);
  const [nextPage, setNextPage] = useState<number | null>(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(30);

  const checkIfBlocked = async (blockedUserId: string) => {
    if (!token) {
      console.warn("User is not authenticated. Skipping block status check.");
      return { isBlockedByCurrentUser: false, isBlockedByProfileUser: false, isBlockedByAdmin: false }; 
    }

    try {
      const response = await fetch(`http://localhost:8080/users/${blockedUserId}/is-blocked`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        console.error("Failed to fetch block status");
        return { isBlockedByCurrentUser: false, isBlockedByProfileUser: false, isBlockedByAdmin: false };
      }

      const data = await response.json();
      return {
        isBlockedByCurrentUser: data.isBlockedByCurrentUser,
        isBlockedByProfileUser: data.isBlockedByProfileUser,
        isBlockedByAdmin: data.isBlockedByAdmin,
      };
    } catch (err) {
      console.error("Error fetching block status:", err);
      return { isBlockedByCurrentUser: false, isBlockedByProfileUser: false, isBlockedByAdmin: false }; 
    }
  };

  useEffect(() => {
    async function fetchPosts() {
      if (loading || !hasMore || nextPage === null) return;

      setLoading(true);

      const response = await fetch(`http://localhost:8080/posts?page=${nextPage}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        setLoading(false);
        return;
      }

      const data = await response.json();

      const filteredPosts = await Promise.all(
        data.posts.map(async (post: PostData) => {
          const blockStatus = await checkIfBlocked(post.user_id);

          if (blockStatus.isBlockedByCurrentUser || blockStatus.isBlockedByProfileUser || blockStatus.isBlockedByAdmin) {
            return null; 
          }

          return post;
        })
      );

      setPosts((prevPosts) => {
        const uniquePosts = [...prevPosts, ...filteredPosts.filter((post) => post !== null)];
        return uniquePosts.filter((post, index, self) => 
          post && self.findIndex(p => p?.id === post.id) === index
        );
      });

      if (data.next_page) {
        setNextPage(data.next_page);
      } else {
        setHasMore(false);
      }

      setLoading(false);
    }

    fetchPosts();
  }, [nextPage, loading, hasMore, token]);

  const refreshPosts = async () => {
    setLoading(true);
    setHasMore(true);
    setNextPage(1);

    const response = await fetch("http://localhost:8080/posts?page=1", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      setLoading(false);
      return;
    }

    const data = await response.json();

    const filteredPosts = await Promise.all(
      data.posts.map(async (post: PostData) => {
        const blockStatus = await checkIfBlocked(post.user_id);

        if (blockStatus.isBlockedByCurrentUser || blockStatus.isBlockedByProfileUser || blockStatus.isBlockedByAdmin) {
          return null; 
        }

        return post;
      })
    );

    setPosts(filteredPosts.filter((post) => post !== null));

    if (data.next_page) {
      setNextPage(data.next_page);
    } else {
      setHasMore(false);
    }

    setLoading(false);
  };

  useEffect(() => {
    if (!autoRefresh) return;

    const intervalId = setInterval(() => {
      refreshPosts();
    }, refreshInterval * 1000);

    return () => clearInterval(intervalId);
  }, [autoRefresh, refreshInterval]);

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
              file_paths={post.file_paths}
            />
          ))
        )}
        {loading && <p>Loading more posts...</p>}
        {!hasMore && <p>No more posts to load.</p>}
      </div>
    </div>
  );
}
