import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import NavigationBar from "../ui/NavigationBar";
import TextArea from "../ui/TextArea";
import FormLabel from "../ui/FormLabel";
import Button from "../ui/Button";
import LetterCounter from "../ui/LetterCounter";
import { useAuth } from "../context/AuthContext";
import { compressImage } from "../utils/compressImage";
import { API_BASE_URL } from "../utils/config";

export default function EditPost() {
    const { token } = useAuth();
    const { id } = useParams(); 
    const navigate = useNavigate();

    const [post, setPost] = useState('');
    const [postError, setPostError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [files, setFiles] = useState<File[]>([]);
    const [filePreviews, setFilePreviews] = useState<string[]>([]);
    const [existingFiles, setExistingFiles] = useState<string[]>([]); 
    const [filesToDelete, setFilesToDelete] = useState<string[]>([]);

    useEffect(() => {
        if (!token) navigate("/login");
    }, [token, navigate]);

    useEffect(() => {
        if (!id || !token) return;
    
        fetch(`${API_BASE_URL}/posts/${id}`, {
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
                    console.error("Error from server:", data.error); 
                    setPostError(data.error);
                } else {
                    console.log("Fetched post data:", data);
                    setPost(data.content);
                    setExistingFiles(data.file_paths || []); 
                }
            })
            .catch((error) => {
                console.error("Error while fetching post data:", error); 
                setPostError("Error fetching post data.");
            });
    }, [id, token]);

    const handlePostChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
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
                    console.error('Error compressing file:', error);
                }
            }
    
            setFiles((prev) => [...prev, ...compressedFiles]);
        }
    };

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
            console.log("Appending file:", file);
            formData.append("files[]", file);
        });
    
        if (filesToDelete.length > 0) {
            console.log("Files to delete:", filesToDelete);
            formData.append("delete_files", JSON.stringify(filesToDelete));
        }
    
        try {
            const response = await fetch(`${API_BASE_URL}/posts/${id || ''}`, {
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
    
                setExistingFiles(data.post.file_paths || []); 
    
                setFiles([]);
                setFilePreviews([]);
    
                setTimeout(() => {
                    navigate(`/`); 
                }, 2000); 
            }
        } catch (error) {
            console.error("Error:", error);
            setPostError("Error saving post.");
        }

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
