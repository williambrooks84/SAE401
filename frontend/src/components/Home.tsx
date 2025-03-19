import { useEffect, useState } from "react";
import Post from "./Post";

interface PostData {
    id: string;
    content: string;
    created_at: string;
}

export default function Home() {
    const [posts, setPosts] = useState<PostData[]>([]);

    useEffect(() => {
        async function fetchPosts() {
            const response = await fetch('http://localhost:8080/posts?page=1');
            const data = await response.json();
            if (data && Array.isArray(data.posts)) {
                setPosts(data.posts);
            } else {
                console.error("Fetched data does not contain a valid posts array:", data);
            }
        }

        fetchPosts();
    }, []);

    return (
        <div>
            {posts.map((post: PostData) => (
            <Post 
                key={post.id}
                id={post.id} 
                content={post.content} 
                created_at={post.created_at} 
            />
            ))}
        </div>
    );
}