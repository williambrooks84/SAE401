import NavigationBar from "../ui/NavigationBar"
import TextArea from "../ui/TextArea"
import FormLabel from "../ui/FormLabel"
import Button from "../ui/Button"
import LetterCounter from "../ui/LetterCounter"
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Publish(){
    const [post, setPost] = useState('');
    const [postError, setPostError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handlePostChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const value = e.target.value;
        if (value.length > 280) {
            setPostError('Post cannot exceed 280 characters.');
        } else {
            setPostError('');
        }
        setPost(value);
    };

    const handleSubmit = async () => {
        if (!post.trim()) {
            setPostError("The post cannot be empty.");
            return;
        }

        setLoading(true);
        setSuccessMessage('');
        setPostError('');

        const response = await fetch("http://localhost:8080/posts", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ content: post }),
        });

        const data = await response.json();

        if (!response.ok) {
            setPostError(data.error || "An error occurred while publishing.");
        } else {
            setSuccessMessage("Post published successfully!");
            setPost('');
            
            // Show success message briefly, then redirect
            setTimeout(() => {
                navigate('/');
            }, 2000); // Redirect after 2 seconds
        }

        setLoading(false);
    };

    return (
        <>
            <NavigationBar />
            <div className="bg-post-background rounded-4xl m-5 p-0.5 gap-3">
                <div className="p-7">
                    <h1 className="text-4xl font-semibold mb-2.5">Add a post</h1>
                    <div className="flex flex-col justify-center gap-2">
                        <FormLabel size="extralarge2" weight="medium" color="default" label="Enter your text here:" />
                        <TextArea
                            placeholder="Your text here..."
                            value={post}
                            onChange={(e) => handlePostChange(e as React.ChangeEvent<HTMLTextAreaElement>)}
                            rows={5}
                        />
                        <LetterCounter value={post} limit="280"/>
                        {postError && <span className="text-error">{postError}</span>}
                        {successMessage && <span className="text-success">{successMessage}</span>}
                    </div>
                    <div className="flex justify-center mt-6">
                        <Button width="fit" padding="default" onClick={handleSubmit} disabled={loading || post.length > 280 || post.trim() === ""}>Publish</Button>
                    </div>
                </div>
            </div>
        </>
    )
}