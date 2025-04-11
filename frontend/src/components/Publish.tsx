import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import NavigationBar from "../ui/NavigationBar";
import TextArea from "../ui/TextArea";
import FormLabel from "../ui/FormLabel";
import Button from "../ui/Button";
import LetterCounter from "../ui/LetterCounter";
import { useAuth } from "../context/AuthContext";
import { compressImage } from "../utils/compressImage";

export default function Publish() {
    const { token } = useAuth();
    const [post, setPost] = useState('');
    const [postError, setPostError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [files, setFiles] = useState<File[]>([]);
    const [filePreviews, setFilePreviews] = useState<string[]>([]); 
    const navigate = useNavigate();

    useEffect(() => {
        if (!token) navigate("/login");
    }, [token, navigate]);

    const handlePostChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const value = e.target.value;
        if (value.length > 280) {
            setPostError('Post cannot exceed 280 characters.');
        } else {
            setPostError('');
        }
        setPost(value);
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = e.target.files;
        if (selectedFiles) {
            const compressedFiles: File[] = [];
            const previews: string[] = [];
    
            for (const file of Array.from(selectedFiles)) {
                try {
                    const compressedFile = await compressImage(file, 1, 500);
                    compressedFiles.push(compressedFile);
    
                    const reader = new FileReader();
                    reader.onloadend = () => {
                        previews.push(reader.result as string); 
                        if (previews.length === selectedFiles.length) {
                            setFilePreviews(previews);
                        }
                    };
                    reader.readAsDataURL(compressedFile);
                } catch (error) {
                    console.error("Error compressing file:", error);
                }
            }
    
            setFiles(prev => [...prev, ...compressedFiles]);
        }
    };

    const handleSubmit = async () => {
        if (!post.trim() && files.length === 0) {
            setPostError("The post must contain either text or at least one file.");
            return;
        }
    
        setLoading(true);
        setSuccessMessage('');
        setPostError('');
    
        const formData = new FormData();
        formData.append("content", post);
    
        files.forEach((file) => {
            formData.append("files[]", file);
        });
    
        try {
            const response = await fetch("http://localhost:8080/posts", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`, 
                },
                body: formData, 
            });
    
            const data = await response.json();
    
            if (!response.ok) {
                setPostError(data.error || "An error occurred while publishing.");
            } else {
                setSuccessMessage("Post published successfully!");
                setPost(''); 
                setFiles([]);
                setFilePreviews([]);
                setTimeout(() => {
                    navigate('/'); 
                }, 2000);
            }
        } catch (error) {
            console.error("Error:", error);
            setPostError("Error creating post.");
        }
    
        setLoading(false);
    };
    

    return (
        <>
            <NavigationBar />
            <div className="bg-post-background rounded-4xl m-5 p-0.5 gap-3 md:w-1/2 md:mx-auto">
                <div className="p-7 gap-3">
                    <h1 className="text-4xl font-semibold mb-2.5">Add a post</h1>
                    <div className="flex flex-col justify-center gap-2">
                        <FormLabel size="extralarge2" weight="medium" color="default" label="Enter your text here:" />
                        <TextArea
                            placeholder="Your text here..."
                            value={post}
                            onChange={(e) => handlePostChange(e as React.ChangeEvent<HTMLTextAreaElement>)}
                            rows={5}
                        />
                        <LetterCounter value={post} limit="280" />
                        {postError && <span className="text-error">{postError}</span>}
                        {successMessage && <span className="text-success">{successMessage}</span>}
                    </div>
    
                    <div className="mt-5">
                        <label className="file-input-label">
                            <span className="file-input-text border p-2 rounded-2xl"> Select files </span>
                            <input
                                type="file"
                                accept="image/*,video/*"
                                onChange={handleFileChange}
                                className="file-input hidden"
                                multiple 
                            />
                        </label>
                    </div>
    
                    {filePreviews.length > 0 && (
                        <div className="mt-4">
                            <h3 className="text-lg font-medium">File Previews:</h3>
                            <div className="flex flex-wrap gap-4 mt-2 justify-center">
                                {filePreviews.map((preview, index) => {
                                    const file = files[index]; 
                                    return (
                                        <div key={index} className="w-1/2 h-auto overflow-hidden rounded-lg">
                                            {file && file.type.startsWith('image') ? (
                                                <img src={preview} alt="file preview" className="w-full h-full object-cover" />
                                            ) : file && file.type.startsWith('video') ? (
                                                <video src={preview} className="w-full h-full object-cover" controls />
                                            ) : (
                                                <div>Unsupported file type</div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                    <div className="flex justify-center mt-6">
                        <Button width="fit" padding="default" onClick={handleSubmit} disabled={loading || post.length > 280}>Publish</Button>
                    </div>
                </div>
            </div>
        </>
    );
}
