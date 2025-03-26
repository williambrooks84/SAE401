import { useEffect, useState } from "react";
import Post from "./Post";
import { PostData } from "../interfaces/dataDefinitions";
import NavigationBar from "../ui/NavigationBar";

export default function Home() {
    const [posts, setPosts] = useState<PostData[]>([]);

    useEffect(() => {
        async function fetchPosts() {
            try {
                const token = localStorage.getItem("access_token");
          
                if (!token) {
                  throw new Error("No access token found");
                }
          
                const response = await fetch("http://localhost:8080/posts?page=1", {
                  method: "GET",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`, // Include token in the Authorization header
                  },
                });
          
                if (!response.ok) {
                  throw new Error("Failed to fetch posts");
                }
          
                const data = await response.json();
                setPosts(data.posts); // Set the posts from the response
              } catch (err: any) {
                console.error("Error fetching posts:", err);
              }
        }

        fetchPosts();
    }, []);

    return (
        <div>
            <NavigationBar />
            <div className="p-5 flex flex-col items-center justify-center max-w-full md:max-w-2/3 space-y-5 mx-auto">
                {posts.map((post: PostData) => (
                    <Post 
                        key={post.id}
                        id={post.id} 
                        content={post.content} 
                        created_at={post.created_at} 
                    />
                ))}
            </div>
        </div>
    );
}