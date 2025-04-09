import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import Like from "../ui/Like";
import LikeCounter from "../ui/LikeCounter";
import CommentCounter from "../ui/CommentCounter";
import { DeleteIcon, EditIcon, CommentIcon } from "../assets/icons";
import Avatar from "../ui/Avatar";
import DateTime from "../ui/DateTime";
import { PostProps } from "../interfaces/dataDefinitions";
import PostComment from "./PostComment";

export default function Post({ id, avatar, username, content, created_at, user_id, file_paths }: PostProps) {
  const { token, user } = useAuth();
  const [liked, setLiked] = useState<boolean>(false);
  const [likeCount, setLikeCount] = useState<number>(0);
  const userId = user?.userId;
  const [commentCount, setCommentCount] = useState<number>(0);
  const [showComments, setShowComments] = useState<boolean>(false);

  // Fetch like status (visible even when not logged in)
  useEffect(() => {
    const fetchLikeCount = async () => {
      try {
        const response = await fetch(`http://localhost:8080/posts/${id}/like-status`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!response.ok) {
          console.error("Failed to fetch like status");
          return;
        }
        const data = await response.json();
        if (data) {
          setLikeCount(data.like_count || 0); // Set like count
          if (token) {
            setLiked(data.liked); // Only update liked if user is authenticated
          }
        }
      } catch (err) {
        console.error("Error fetching like status:", err);
      }
    };

    fetchLikeCount();
    updateCommentCount(); // Fetch comment count always
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
      }).then((response) => {
        if (response.ok) window.location.reload();
      });
    }
  };

  const handleEditPost = () => {
    window.location.href = `/edit/${id}`;
  };

  function NavigateToProfile() {
    window.location.href = `/profile/${user_id}`;
  }

  const updateCommentCount = () => {
    fetch(`http://localhost:8080/comments?post_id=${id}`)
      .then((response) => response.json())
      .then((data) => {
        if (data && data.comments) {
          setCommentCount(Number(data.comments.length));
        }
      });
  };


  return (
    <div className="flex flex-col p-5 gap-4 w-full md:w-1/2 rounded-4xl bg-post-background">
      <div className="cursor-pointer" onClick={NavigateToProfile}>
        <Avatar avatar={`http://localhost:8080${avatar}`} username={username} color="black" />
      </div>
      <div>
        <p className="text-xl text-post-text">{content}</p>
        <div>
          {file_paths && file_paths.length > 0 && (
            <div className="flex flex-col items-center gap-5 mt-2">
              {file_paths.map((file_path, index) => {
                const isVideo = file_path.endsWith(".mp4");
                const mediaSrc = `http://localhost:8080${file_path}`;

                return (
                  <div key={index} className="w-full md:w-2/3">
                    {isVideo ? (
                      <video controls className="w-full h-auto rounded-lg">
                        <source src={mediaSrc} type="video/mp4" />
                        Your browser does not support the video tag.
                      </video>
                    ) : (
                      <img
                        src={mediaSrc}
                        alt={`Post media ${index}`}
                        className="w-full h-auto rounded-lg"
                      />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <hr className="my-4 border-post-grey" />
      <div className="flex flex-row justify-between items-center">
        <div className="flex flex-col gap-2">
          <DateTime date={created_at} />
          <div className="flex flex-col">
            <LikeCounter likesCount={likeCount} />
            <CommentCounter commentsCount={commentCount} />
          </div>
        </div>
        <div className="flex flex-row justify-center items-center gap-2">
          {String(userId) === String(user_id) && (
            <div className="flex flex-row gap-2">
              <div className="cursor-pointer" onClick={handleDeletePost}>
                <DeleteIcon className="cursor-pointer" />
              </div>
              <div className="cursor-pointer" onClick={handleEditPost}>
                <EditIcon />
              </div>
            </div>
          )}
          <div
            className="cursor-pointer"
            onClick={() => setShowComments((prev) => !prev)}
          >
            <CommentIcon />
          </div>
          <Like liked={liked} setLiked={handleLike} />
        </div>
      </div>
      <div>
        {showComments && (
          <div>
            <PostComment postId={id} updateCommentCount={updateCommentCount} />
          </div>
        )}
      </div>
    </div>
  );
}
