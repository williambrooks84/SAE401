import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Button from "../ui/Button";
import NavigationBar from "../ui/NavigationBar";
import FormLabel from "../ui/FormLabel";
import FormBox from "../ui/FormBox";

const compressImage = async (file: File, maxSizeMB: number, maxWidthOrHeight: number): Promise<File> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const reader = new FileReader();

        reader.onload = (e) => {
            if (!e.target?.result) return reject("Failed to read file");
            img.src = e.target.result as string;
        };

        img.onload = () => {
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            if (!ctx) return reject("Failed to get canvas context");

            let width = img.width;
            let height = img.height;

            if (width > height && width > maxWidthOrHeight) {
                height *= maxWidthOrHeight / width;
                width = maxWidthOrHeight;
            } else if (height > width && height > maxWidthOrHeight) {
                width *= maxWidthOrHeight / height;
                height = maxWidthOrHeight;
            }

            canvas.width = width;
            canvas.height = height;
            ctx.drawImage(img, 0, 0, width, height);

            canvas.toBlob(
                (blob) => {
                    if (!blob) return reject("Failed to create blob");
                    if (blob.size / 1024 / 1024 > maxSizeMB) {
                        return reject("Compressed file is still too large");
                    }
                    resolve(new File([blob], file.name, { type: file.type }));
                },
                file.type,
                 // Quality (0.8 = 80%)
            );
        };

        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(file);
    });
};

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

    const API_URL = "http://localhost:8080"; // Hardcoded API URL

    const validateWebsite = (website: string) => {
        const regex = /^(https?:\/\/)?(www\.)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(:\d+)?(\/[^\s]*)?$/;
        return regex.test(website);
    };

    const handleWebsiteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setNewWebsite(value); // Update the state without validation
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
                const compressedFile = await compressImage(file, 1, 500); // Compress to 1MB and resize to 500px max dimension
                setAvatarFile(compressedFile);
                const reader = new FileReader();
                reader.onloadend = () => {
                    setAvatarPreview(reader.result as string);
                };
                reader.readAsDataURL(compressedFile); // Use Data URL for preview
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
                // Update avatar state if needed
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
                    Authorization: `Bearer ${token}`, // Add the token if needed
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
        
        // Validate website field
        if (newWebsite && !validateWebsite(newWebsite)) {
            setWebsiteError("Please enter a valid website URL.");
            setLoading(false);
            return; // Prevent form submission if invalid
        } else {
            setWebsiteError(null); // Clear the error if valid or empty
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
        
        // Compress avatar and banner before uploading (if exists)
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
                    "Content-Type": "application/json",  // Important for sending JSON data
                },
                body: JSON.stringify(updatedProfile),  // Send as JSON
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
                navigate(`/profile/${user.userId}`); // Redirect to profile page after update
            }
        }
    };
    

    return (
        <>
            <NavigationBar />
            <div className="bg-post-background rounded-4xl m-5 p-0.5 gap-3 md:w-1/3 md:mx-auto">
                <div className="flex flex-col p-7">
                    <h1 className="text-4xl font-semibold mb-2.5">Edit your profile</h1>
                    <div className="flex flex-col justify-center gap-2">
                        <div className="flex flex-col justify-center gap-2">
                            <FormLabel size="large" weight="medium" color="default" label="Change your avatar:" />
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleAvatarChange}
                                className="file-input"
                            />
                            {avatarPreview && (
                                <img
                                    src={avatarPreview}
                                    alt="Avatar Preview"
                                    className="mt-2 rounded-full w-24 h-24 object-cover"
                                />
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

                    <div className="flex flex-col justify-center gap-2">
                        <FormLabel size="large" weight="medium" color="default" label="Change your banner:" />
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleBannerChange}
                            className="file-input"
                        />
                        {bannerPreview && (
                            <img
                                src={bannerPreview}
                                alt="Banner Preview"
                                className="mt-2 rounded-lg max-h-40 md:max-h-80 object-cover"
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

