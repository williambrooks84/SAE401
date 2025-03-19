import { useState, useEffect } from "react";

export default function App() {
  interface Post {
    id: number;
    content: string;
    created_at: string;
  }

  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:8080/posts');
        const data = await response.json();
        console.log(data);
        setPosts(Array.isArray(data) ? data : []); // Ensure data is an array
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);
        // Removed extraneous <li key={post.id}> line
  return (
    <div>
      <h1>Posts</h1>
      <ul>
      {posts.map((post, index) => (
        <li key={post.id || `post-${index}`}>
          <p><strong>Content:</strong> {post.content || "No content available"}</p>
          <p><strong>Created At:</strong> {post.created_at ? new Date(post.created_at).toLocaleString() : "Unknown date"}</p>
        </li>
      ))}
      </ul>
    </div>
  );
}
