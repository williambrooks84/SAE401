import { useState } from "react";
import { useAuth } from "../context/AuthContext"; // Import the context
import Like from "../ui/Like";
import { DeleteIcon } from "../assets/icons";
import Avatar from "../ui/Avatar";
import DateTime from "../ui/DateTime";
import { PostProps } from "../interfaces/dataDefinitions";

export default function Post({ id, avatar, username, content, created_at, user_id }: PostProps) {
  const { token, userId } = useAuth(); // Get token & userId from context
  const [liked, setLiked] = useState<boolean>(false);

  const handleDeletePost = () => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      fetch(`http://localhost:8080/posts/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((response) => {
          if (!response.ok) throw new Error("Failed to delete the post.");
          return response.json();
        })
        .then(() => {
          document.getElementById(`post-${id}`)?.remove();
        });
    }
  };

  return (
    <div className="flex flex-col p-5 gap-4 w-full md:w-1/2 rounded-4xl bg-post-background">
      <Avatar avatar={avatar} username={username} color="black" />
      <div>
        <p className="text-xl text-post-text">{content}</p>
        <hr className="my-4 border-post-grey" />
        <div className="flex flex-row justify-between items-center">
          <DateTime date={created_at} />
          <div className="flex flex-row justify-center items-center gap-2">
            {String(userId) === String(user_id) && (
              <div className="cursor-pointer" onClick={handleDeletePost}>
                <DeleteIcon className="cursor-pointer" />
              </div>
            )}
            {/* <Like postId={id} liked={liked} setLiked={setLiked} /> */}
          </div>
        </div>
      </div>
    </div>
  );
}
