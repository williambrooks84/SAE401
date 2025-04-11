import { useEffect, useState } from "react";
import Post from "./Post";
import { PostData } from "../interfaces/dataDefinitions";
import NavigationBar from "../ui/NavigationBar";
import { API_BASE_URL } from "../utils/config";

export default function Home() {
  const [posts, setPosts] = useState<PostData[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true); 
  const [loading, setLoading] = useState(false); 

  useEffect(() => {
    async function fetchPosts() {
      if (loading || !hasMore) return;

      setLoading(true);

      const response = await fetch(`${API_BASE_URL}/posts?page=${page}`, {
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
        setPage((prevPage) => prevPage + 1); // Charger la page suivante
      }
    }

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div>
      <NavigationBar />
      <div className="p-5 flex flex-col items-center justify-center max-w-full md:max-w-2/3 space-y-5 mx-auto">
        {posts.map((post: PostData, index) => (
          <Post 
            key={`${post.id}-${index}`}
            id={post.id} 
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