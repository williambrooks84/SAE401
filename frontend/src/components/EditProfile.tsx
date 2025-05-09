import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Button from "../ui/Button";
import NavigationBar from "../ui/NavigationBar";
import FormLabel from "../ui/FormLabel";
import FormBox from "../ui/FormBox";
import { compressImage } from "../utils/compressImage";

export default function EditProfile() {
    const { token, user } = useAuth();
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [newUsername, setNewUsername] = useState('');
    const [newLocation, setNewLocation] = useState('');
    const [newBio, setNewBio] = useState('');
    const [newWebsite, setNewWebsite] = useState('');
    const [newBanner, setNewBanner] = useState<File | null>(null);
    const [bannerPreview, setBannerPreview] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [websiteError, setWebsiteError] = useState<string | null>(null);
    const navigate = useNavigate();

    const API_URL = "http://localhost:8080"; 

    const validateWebsite = (website: string) => {
        const regex = /^(https?:\/\/)?(www\.)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(:\d+)?(\/[^\s]*)?$/;
        return regex.test(website);
    };

    const handleWebsiteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setNewWebsite(value); 
    };

    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                alert("File size exceeds the 5MB limit.");
                return;
            }

            if (!["image/jpeg", "image/png"].includes(file.type)) {
                alert("Only JPG and PNG images are allowed.");
                return;
            }

            try {
                const compressedFile = await compressImage(file, 1, 500); 
                setAvatarFile(compressedFile);
                const reader = new FileReader();
                reader.onloadend = () => {
                    setAvatarPreview(reader.result as string);
                };
                reader.readAsDataURL(compressedFile); 
            } catch (error) {
                alert("Error compressing the image: " + error);
            }
        }
    };

    const handleBannerChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                alert("File size exceeds the 5MB limit.");
                return;
            }

            if (!["image/jpeg", "image/png"].includes(file.type)) {
                alert("Only JPG and PNG images are allowed.");
                return;
            }

            try {
                const compressedFile = await compressImage(file, 1, 500);
                setNewBanner(compressedFile);
                const reader = new FileReader();
                reader.onloadend = () => {
                    setBannerPreview(reader.result as string);
                };
                reader.readAsDataURL(compressedFile);
            } catch (error) {
                alert("Error compressing the banner: " + error);
            }
        }
    };

    const handleAvatarUpload = async (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
    
        try {
            const response = await fetch('http://localhost:8080/upload-avatar', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: formData,
            });
    
            const result = await response.json();
    
            if (response.ok) {
                console.log('Avatar uploaded successfully:', result.filename);

            } else {
                console.error('Avatar upload failed:', result.error);
            }
        } catch (error) {
            console.error('Error uploading avatar:', error);
        }
    };

    const handleBannerUpload = async (file: File) => {
        const formData = new FormData();
        formData.append("file", file);
    
        try {
            const response = await fetch("http://localhost:8080/upload-banner", {
                method: "POST",
                body: formData,
                headers: {
                    Authorization: `Bearer ${token}`, 
                },
            });
    
            if (!response.ok) {
                throw new Error("Failed to upload banner.");
            }
    
            const data = await response.json();
            console.log("Banner uploaded successfully:", data.filename);
        } catch (error) {
            console.error("Banner upload failed:", error);
        }
    };

    useEffect(() => {
        if (token) {
            fetch(`${API_URL}/token`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
                .then((response) => response.json())
                .then((data) => {
                    if (data) {
                        setNewUsername(data.username ?? '');
                        setNewLocation(data.location ?? '');
                        setNewBio(data.bio ?? '');
                        setNewWebsite(data.website ?? '');
                        setAvatarPreview(data.avatar ? `http://localhost:8080${data.avatar}` : null);
                        setBannerPreview(data.banner ? `http://localhost:8080${data.banner}` : null);
                    }
                })
                .catch((error) => {
                    console.error("Error fetching user data:", error);
                    alert("Failed to fetch user data. Please log in again.");
                    navigate("/login");
                });
        } else {
            navigate("/login");
        }
    }, [token, navigate]);
    

    const handleEdit = async () => {
        setLoading(true);
        
        if (newWebsite && !validateWebsite(newWebsite)) {
            setWebsiteError("Please enter a valid website URL.");
            setLoading(false);
            return; 
        } else {
            setWebsiteError(null); 
        }
    
        const updatedProfile: {
            username: string;
            location?: string;
            bio?: string;
            website?: string;
            avatar?: File;
            banner?: File;
        } = {
            username: newUsername,
            location: newLocation,
            bio: newBio,
            website: newWebsite,
        };
        
        if (avatarFile) {
            updatedProfile.avatar = avatarFile;
        }
        if (newBanner) {
            updatedProfile.banner = newBanner;
        }
    
        try {
            const response = await fetch(`${API_URL}/profile/update`, {
                method: "PATCH",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json", 
                },
                body: JSON.stringify(updatedProfile),
            });
    
            const contentType = response.headers.get("Content-Type");
            if (contentType && contentType.includes("application/json")) {
                const data = await response.json();
                if (response.ok && data.status === 'success') {
                    setAvatarPreview(data.data.avatar);
                    setBannerPreview(data.data.banner);
                    setNewUsername(data.data.username);
                    setNewLocation(data.data.location);
                    setNewBio(data.data.bio);
                    setNewWebsite(data.data.website);
    
                    if (avatarFile) {
                        await handleAvatarUpload(avatarFile);
                    }
                    if (newBanner) {
                        await handleBannerUpload(newBanner);
                    }
    
                    alert("Profile updated successfully!");
                } else {
                    alert(`Error: ${data.message || "Something went wrong."}`);
                }
            } else {
                const text = await response.text();
                console.error("Unexpected response format:", text);
                alert("An unexpected error occurred. Please try again.");
            }
        } catch (error) {
            console.error("Error during update:", error);
            alert("Failed to update profile. Check your network or try again.");
        } finally {
            setLoading(false);
            if (user?.userId) {
                navigate(`/profile/${user.userId}`);
            }
        }
    };
    

    return (
        <>
            <NavigationBar />
            <div className="bg-post-background rounded-4xl m-5 p-0.5 gap-4 md:w-1/3 md:mx-auto">
                <div className="flex flex-col items-center p-7 gap-3">
                    <h1 className="text-4xl text-left font-semibold mb-2.5">Edit your profile</h1>
                    <div className="flex flex-col justify-center gap-2 w-full">
                        <div className="flex flex-col justify-center gap-4">
                            <FormLabel size="large" weight="medium" color="default" label="Change your avatar:" />
                            <label className="file-input-label">
                                <span className="file-input-text border p-2 rounded-2xl">Choose an avatar</span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleAvatarChange}
                                    className="file-input hidden"
                                />
                            </label>    
                            {avatarPreview && (
                                <div className="flex justify-center">
                                    <img
                                        src={avatarPreview}
                                        alt="Avatar Preview"
                                        className="mt-2 rounded-full w-24 h-24 object-cover"
                                    />
                                </div>  
                            )}
                        </div>

                        <FormLabel size="large" weight="medium" color="default" label="Change your username:" />
                        <FormBox
                            placeholder="Enter username"
                            value={newUsername ?? ''}
                            onChange={(e) => setNewUsername(e.target.value)}
                        />

                        <FormLabel size="large" weight="medium" color="default" label="Change your location:" />
                        <FormBox
                            placeholder="Enter location"
                            value={newLocation ?? ''}
                            onChange={(e) => setNewLocation(e.target.value)}
                        />

                        <FormLabel size="large" weight="medium" color="default" label="Change your bio:" />
                        <FormBox
                            placeholder="Enter bio"
                            value={newBio ?? ''}
                            onChange={(e) => setNewBio(e.target.value)}
                        />

                        <FormLabel size="large" weight="medium" color="default" label="Change your website:" />
                        <FormBox
                            placeholder="Enter website"
                            value={newWebsite ?? ''}
                            onChange={handleWebsiteChange}
                        />
                        {websiteError && (
                            <p className="text-red-500 text-sm">{websiteError}</p> // Error message display
                        )}
                    </div>

                    <div className="flex flex-col justify-center gap-4 w-full">
                        <FormLabel size="large" weight="medium" color="default" label="Change your banner:" />
                        <label className="file-input-label">
                            <span className="file-input-text border p-2 rounded-2xl">Choose a banner</span>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleBannerChange}
                                className="file-input hidden"
                            />
                        </label>
                            
                        {bannerPreview && (
                            <img
                                src={bannerPreview}
                                alt="Banner Preview"
                                className="mt-2 rounded-lg h-full object-cover"
                            />
                        )}
                    </div>

                    <Button width="fit" padding="default" onClick={handleEdit} disabled={loading}>
                        {loading ? "Updating..." : "Update Profile"}
                    </Button>
                </div>
            </div>
        </>
    );
}

