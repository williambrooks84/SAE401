import { useEffect, useState } from "react";
import Post from "./Post";
import { PostData } from "../interfaces/dataDefinitions";
import NavigationBar from "../ui/NavigationBar";
import Button from "../ui/Button";

export default function Home() {
  const [posts, setPosts] = useState<PostData[]>([]);
  const [nextPage, setNextPage] = useState<number | null>(1); 
  const [hasMore, setHasMore] = useState(true); 
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

  // Fetch posts and handle blocked users
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

      const filteredPosts = data.posts.filter((post: PostData) => post.is_blocked !== true);

      setPosts((prevPosts) => {
        const postIds = new Set(prevPosts.map((post) => post.id));
        return [...prevPosts, ...filteredPosts.filter((post: PostData) => !postIds.has(post.id))];
      });

      if (data.next_page) {
        setNextPage(data.next_page);
      } else {
        setHasMore(false);
      }

      setLoading(false);
    }

    fetchPosts();
  }, [nextPage]); 


  useEffect(() => {
    function handleScroll() {
      if (
        window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.offsetHeight - 100
      ) {

        if (hasMore && !loading && nextPage !== null) {

        }
      }
    }

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [hasMore, loading, nextPage]);

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

    const filteredPosts = data.posts.filter((post: PostData) => post.is_blocked !== true);
    setPosts(filteredPosts);

    if (data.next_page) {
      setNextPage(data.next_page);
    } else {
      setHasMore(false);
    }

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
