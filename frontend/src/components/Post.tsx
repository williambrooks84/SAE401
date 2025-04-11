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
import { API_BASE_URL } from "../utils/config";

export default function Post({ id, avatar, username, content, created_at, user_id, file_paths, className }: PostProps) {
  const { token, user } = useAuth();
  const [liked, setLiked] = useState<boolean>(false);
  const [likeCount, setLikeCount] = useState<number>(0);
  const userId = user?.userId;
  const [commentCount, setCommentCount] = useState<number>(0);
  const [showComments, setShowComments] = useState<boolean>(false);

  useEffect(() => {
    const fetchLikeCount = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/posts/${id}/like-status`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!response.ok) {
          console.error("Failed to fetch like status");
          return;
        }
        const data = await response.json();
        if (data) {
          setLikeCount(data.like_count || 0);
          if (token) {
            setLiked(data.liked); 
          }
        }
      } catch (err) {
        console.error("Error fetching like status:", err);
      }
    };

    fetchLikeCount();
    updateCommentCount(); 
  }, [id, token]);

  const handleLike = (newLiked: boolean) => {
    if (!token) {
      alert("You need to log in to like posts!");
      return;
    }

    setLiked(newLiked);
    setLikeCount((prev) => prev + (newLiked ? 1 : -1));

    fetch(`${API_BASE_URL}/posts/${id}/${newLiked ? "like" : "unlike"}`, {
      method: newLiked ? "POST" : "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
  };

  const handleDeletePost = () => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      fetch(`${API_BASE_URL}/posts/${id}`, {
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
    fetch(`${API_BASE_URL}/comments?post_id=${id}`)
      .then((response) => response.json())
      .then((data) => {
        if (data && data.comments) {
          setCommentCount(Number(data.comments.length));
        }
      });
  };


  return (
    <div className={`flex flex-col p-5 gap-4 w-full md:w-1/2 rounded-4xl bg-post-background ${className}`}>
      <div className="cursor-pointer" onClick={NavigateToProfile}>
        <Avatar avatar={`${API_BASE_URL}${avatar}`} username={username} color="black" />
      </div>
      <div>
        <p className="text-xl text-post-text">{content}</p>
        <div>
          {file_paths && file_paths.length > 0 && (
            <div className="flex flex-col items-center gap-5 mt-2">
              {file_paths.map((file_path, index) => {
                const isVideo = file_path.endsWith(".mp4");
                const mediaSrc = `${API_BASE_URL}${file_path}`;

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
