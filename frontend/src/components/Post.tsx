import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import Like from "../ui/Like";
import LikeCounter from "../ui/LikeCounter";
import { DeleteIcon } from "../assets/icons";
import Avatar from "../ui/Avatar";
import DateTime from "../ui/DateTime";
import { PostProps } from "../interfaces/dataDefinitions";

export default function Post({ id, avatar, username, content, created_at, user_id }: PostProps) {
  const { token, user } = useAuth();
  const [liked, setLiked] = useState<boolean>(false);
  const [likeCount, setLikeCount] = useState<number>(0);
  const userId = user?.userId;

  // Fetch like status
  useEffect(() => {
    fetch(`http://localhost:8080/posts/${id}/like-status`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((response) => response.json())
      .then((data) => {
        setLikeCount(data.like_count || 0);
        if (token) setLiked(data.liked);
      });
  }, [id, token]);

  const handleLike = (newLiked: boolean) => {
    if (!token) {
      alert("You need to log in to like posts!");
      return;
    }

    setLiked(newLiked);
    setLikeCount((prev) => prev + (newLiked ? 1 : -1));

    fetch(`http://localhost:8080/posts/${id}/${newLiked ? "like" : "unlike"}`, {
      method: newLiked ? "POST" : "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
  };

  const handleDeletePost = () => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      fetch(`http://localhost:8080/posts/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((response) => {
          if (response.ok) window.location.reload();
        });
    }
  };

  function NavigateToProfile() {
    window.location.href = `/profile/${user_id}`;
  }

  return (
    <div className="flex flex-col p-5 gap-4 w-full md:w-1/2 rounded-4xl bg-post-background">
      <div className="cursor-pointer" onClick={NavigateToProfile}>
        <Avatar avatar={avatar} username={username} color="black" />
      </div>
      <div>
        <p className="text-xl text-post-text">{content}</p>
        <hr className="my-4 border-post-grey" />
        <div className="flex flex-row justify-between items-center">
          <DateTime date={created_at} />
          <LikeCounter likesCount={likeCount} />
          <div className="flex flex-row justify-center items-center gap-2">
            {String(userId) === String(user_id) && (
              <div className="cursor-pointer" onClick={handleDeletePost}>
                <DeleteIcon className="cursor-pointer" />
              </div>
            )}
            <Like liked={liked} setLiked={handleLike} />
          </div>
        </div>
      </div>
    </div>
  );
}
