import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import NavigationBar from "../ui/NavigationBar";
import TextArea from "../ui/TextArea";
import FormLabel from "../ui/FormLabel";
import Button from "../ui/Button";
import LetterCounter from "../ui/LetterCounter";
import { useAuth } from "../context/AuthContext";
import { compressImage } from "../utils/compressImage";

export default function EditPost() {
    const { token } = useAuth();
    const { id } = useParams(); // Get post ID from the URL
    const navigate = useNavigate();

    const [post, setPost] = useState('');
    const [postError, setPostError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [files, setFiles] = useState<File[]>([]);
    const [filePreviews, setFilePreviews] = useState<string[]>([]);
    const [existingFiles, setExistingFiles] = useState<string[]>([]); // For existing files in edit mode
    const [filesToDelete, setFilesToDelete] = useState<string[]>([]); // Files to delete in edit mode

    // Redirect to login if no token
    useEffect(() => {
        if (!token) navigate("/login");
    }, [token, navigate]);

    // Fetch post data if editing
    useEffect(() => {
        if (!id || !token) return;
    
        fetch(`http://localhost:8080/posts/${id}`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
            .then((response) => {
                if (!response.ok) {
                    console.error("Error fetching post data, status:", response.status);
                    return response.json();
                }
                return response.json();
            })
            .then((data) => {
                if (data.error) {
                    console.error("Error from server:", data.error); // log the error from the server
                    setPostError(data.error);
                } else {
                    console.log("Fetched post data:", data); // Log the fetched post data
                    setPost(data.content); // Directly use `data.content` instead of `data.post.content`
                    setExistingFiles(data.file_paths || []); // Set the existing file paths, handle case when file_paths is not present
                }
            })
            .catch((error) => {
                console.error("Error while fetching post data:", error); // Log any other errors (network issues)
                setPostError("Error fetching post data.");
            });
    }, [id, token]);

    // Handle text changes
    const handlePostChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = e.target.value;
        if (value.length > 280) {
            setPostError('Post cannot exceed 280 characters.');
        } else {
            setPostError('');
        }
        setPost(value);
    };

    // Handle file changes
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = e.target.files;
        if (selectedFiles) {
            const compressedFiles: File[] = [];
            const previews: string[] = [];
    
            // Compress and create file previews
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
                    console.error('Error compressing file:', error);
                }
            }
    
            // Log the files to check if they're being set correctly
            console.log("Selected files:", compressedFiles); // Add this log
            setFiles((prev) => [...prev, ...compressedFiles]);
        }
    };

    // Handle removing files
    const handleRemoveFile = (fileIndex: number, isExistingFile: boolean) => {
        if (isExistingFile) {
            const filePathToDelete = existingFiles[fileIndex];
            setExistingFiles((prev) => prev.filter((_, index) => index !== fileIndex));
            setFilesToDelete((prev) => [...prev, filePathToDelete]);
        } else {
            setFiles((prev) => prev.filter((_, index) => index !== fileIndex));
            setFilePreviews((prev) => prev.filter((_, index) => index !== fileIndex));
        }
    };

    const handleSubmit = async () => {
        // Basic validation for content or files
        if (!post.trim() && files.length === 0) {
            setPostError("The post must contain either text or at least one file.");
            return;
        }
    
        setLoading(true);
        setSuccessMessage('');
        setPostError('');
    
        const formData = new FormData();
        formData.append("content", post); // Append content to the form data
    
        // Add files to the formData
        files.forEach((file) => {
            console.log("Appending file:", file);
            formData.append("files[]", file);
        });
    
        // Handle files to delete
        if (filesToDelete.length > 0) {
            console.log("Files to delete:", filesToDelete);
            formData.append("delete_files", JSON.stringify(filesToDelete));
        }
    
        try {
            const response = await fetch(`http://localhost:8080/posts/${id || ''}`, {
                method:"POST" ,
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });
    
            const data = await response.json();
            console.log("Response from server:", data);
    
            if (!response.ok) {
                setPostError(data.error || "An error occurred while saving.");
            } else {
                setSuccessMessage(id ? "Post updated successfully!" : "Post created successfully!");
    
                // Update file paths (ensure files are reflected properly)
                setExistingFiles(data.post.file_paths || []); // Add or update file paths
    
                // Clear files and previews after successful submission
                setFiles([]);
                setFilePreviews([]);
    
                // Redirect to home after a successful submission (after the success message)
                setTimeout(() => {
                    navigate(`/`); // Navigate to home page
                }, 2000); // Wait for success message to display
            }
        } catch (error) {
            console.error("Error:", error);
            setPostError("Error saving post.");
        }
    
        // Always stop the loading state after request
        setLoading(false);
    };
    

    return (
        <>
            <NavigationBar />
            <div className="bg-post-background rounded-4xl m-5 p-0.5 gap-3 md:w-1/2 md:mx-auto">
                <div className="p-7 gap-3">
                    <h1 className="text-4xl font-semibold mb-2.5">{id ? "Edit Post" : "Add a Post"}</h1>
                    <div className="flex flex-col justify-center gap-2">
                        <FormLabel size="extralarge2" weight="medium" color="default" label="Enter your text here:" />
                        <TextArea
                            placeholder="Your text here..."
                            value={post}
                            onChange={handlePostChange}
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

                    {(filePreviews.length > 0 || existingFiles.length > 0) && (
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
                                            <button onClick={() => handleRemoveFile(index, false)} className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full">
                                                X
                                            </button>
                                        </div>
                                    );
                                })}

                                {existingFiles.map((preview, index) => {
                                    const fullImageUrl = `http://localhost:8080${preview}`;
                                    const isImage = preview.match(/\.(jpeg|jpg|gif|png)$/i);
                                    const isVideo = preview.match(/\.(mp4|webm|ogg)$/i);
                                    return (
                                        <div key={index} className="w-1/2 h-auto overflow-hidden rounded-lg relative">
                                            {isImage ? (
                                                <img src={fullImageUrl} alt={`file-preview-${index}`} className="w-full h-full object-cover" />
                                            ) : isVideo ? (
                                                <video src={fullImageUrl} className="w-full h-full object-cover" controls />
                                            ) : (
                                                <div className="text-center text-gray-500">Unsupported file type</div>
                                            )}
                                            <button onClick={() => handleRemoveFile(index, true)} className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full">
                                                X
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    <div className="flex justify-center mt-6">
                        <Button width="fit" padding="default" onClick={handleSubmit} disabled={loading || post.length > 280}>
                            {loading ? 'Saving...' : id ? 'Save Changes' : 'Publish'}
                        </Button>
                    </div>
                </div>
            </div>
        </>
    );
}
