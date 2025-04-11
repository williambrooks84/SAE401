import { useState, useEffect } from "react";
import Post from "../components/Post";
import { PostProps } from "../interfaces/dataDefinitions";
import Button from "../ui/Button";

export default function PostList() {
    const [posts, setPosts] = useState<PostProps[]>([]);
    const [selectedPostId, setSelectedPostId] = useState<string | null>(null);

    useEffect(() => {
        fetch("http://localhost:8080/dashboardposts")
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Failed to fetch posts");
                }
                return response.json();
            })
            .then((data) => {
                if (data && Array.isArray(data.posts)) {
                    setPosts(data.posts);
                } else {
                    console.error("Posts data is not an array or is missing:", data);
                }
            });
    }, []);

    const handlePostChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const postId = e.target.value;
        setSelectedPostId(postId);
    };

    const selectedPost = posts.find((post) => String(post.id) === String(selectedPostId));

    const censorPost = () => {
        if (!selectedPostId) {
            alert("Please select a post to censor.");
            return;
        }

        fetch(`http://localhost:8080/censor/${selectedPostId}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Failed to censor the post");
                }
                return response.json();
            })
            .then(() => {
                alert("Post censored successfully!");
                setPosts((prevPosts) =>
                    prevPosts.map((post) =>
                        post.id === selectedPostId ? { ...post, content: "[CENSORED]" } : post
                    )
                );
            });
    }

    return (
        <div className="flex flex-col gap-4 justify-center items-center">
            <div className="flex flex-col items-center justify-center gap-4">
            <select
                value={selectedPostId || ""}
                onChange={handlePostChange}
                className="w-3/4 text-center text-lg font-semibold border border-border-grey rounded-4xl p-2"
            >
                <option value="">Select a post</option>
                {posts.map((post) => (
                <option key={post.id} value={post.id}>
                    {post.content}
                </option>
                ))}
            </select>
            </div>
            <div className="flex flex-col items-center w-full gap-4">
            {selectedPost ? (
                <div className="w-full flex justify-center">
                <Post
                    key={selectedPost.id}
                    id={selectedPost.id}
                    avatar={selectedPost.avatar}
                    username={selectedPost.username}
                    content={selectedPost.content}
                    created_at={selectedPost.created_at}
                    user_id={selectedPost.user_id}
                    file_paths={selectedPost.file_paths}
                    className="w-full md:w-2/3"
                />
                </div>
            ) : (
                <p className="text-post-grey text-sm font-medium">No post selected</p>
            )}
            </div>
            <Button
            variant="black"
            size="bgless"
            rounded="default"
            width="fit"
            padding="default"
            onClick={censorPost}
          >
            Censor
          </Button>
        </div>
    );
}
