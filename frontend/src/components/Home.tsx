import { useEffect, useState } from "react";
import Post from "./Post";
import { PostData } from "../interfaces/dataDefinitions";
import NavigationBar from "../ui/NavigationBar";
import Button from "../ui/Button";

export default function Home() {
  const [posts, setPosts] = useState<PostData[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(30);

  useEffect(() => {
    if (!autoRefresh) return;

    const intervalId = setInterval(() => {
      refreshPosts();
    }, refreshInterval * 1000);

    return () => clearInterval(intervalId);
  }, [autoRefresh, refreshInterval]);

  useEffect(() => {
    async function fetchPosts() {
      if (loading || !hasMore) return;

      setLoading(true);

      const response = await fetch(`http://localhost:8080/posts?page=${page}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        console.error("Failed to fetch posts");
        setLoading(false);
        return;
      }

      const data = await response.json();

      if (data.posts.length === 0) {
        setHasMore(false); // Plus de données à charger
      } else {
        setPosts((prevPosts) => [...prevPosts, ...data.posts]); // Ajouter les nouveaux posts
      }

      setLoading(false);
    }

    fetchPosts();
  }, [page]);

  useEffect(() => {
    function handleScroll() {
      if (
        window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.offsetHeight - 100
      ) {
        setPage((prevPage) => prevPage + 1);
      }
    }

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const refreshPosts = async () => {
    setLoading(true);
    setPage(1);
    setHasMore(true);

    const response = await fetch("http://localhost:8080/posts?page=1", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      console.error("Failed to refresh posts");
      setLoading(false);
      return;
    }

    const data = await response.json();
    setPosts(data.posts);
    setLoading(false);
  };

  useEffect(() => {
    // Charger les paramètres depuis localStorage
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
          textSize= "large"
          rounded="default"
          width="fit"
          padding="default"
          onClick={refreshPosts}
        >Refresh the feed
        </Button>
        {posts.map((post: PostData, index) => (
          <Post
            key={`${post.id}-${index}`}
            id={post.id}
            user_id={post.user_id}
            avatar={post.avatar}
            username={post.username}
            content={post.content}
            created_at={post.created_at}
          />
        ))}
        {loading && <p>Loading more posts...</p>}
        {!hasMore && <p>No more posts to load.</p>}
      </div>
    </div>
  );
}