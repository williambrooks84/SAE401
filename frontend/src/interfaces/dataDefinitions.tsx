// Extend the AuthContextType to include `user`
export interface User {
    username: string;
    userId: string;
}

//ProfileLogin
export interface ProfileLoginProps {
    isVisible: boolean;
    onClose: () => void;
}

export interface AuthContextType {
    token: string | null;
    user: User | null;  // Add user object to context
    login: (token: string, user: User) => void;  // Accept user object when logging in
    logout: () => void;
}

//FormBox
export interface FormBoxProps {
    placeholder?: string;
    value?: string;
    onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

//Logo
export interface LogoProps {
    src: string;
    alt: string;
    className?: string;
}

//Post
export interface PostProps {
    key: string;
    id: string;
    user_id: string;
    avatar: string;
    username: string;
    content: string;
    created_at: string;
    is_blocked?: boolean;
    file_paths?: string[];
    className?: string;
}

//PostData
export interface PostData {
    id: string;
    user_id: string;
    avatar: string;
    username: string;
    content: string;
    created_at: string;
    is_blocked?: boolean;
    file_paths?: string[];
}

//TextArea
export interface TextAreaProps {
    name?: string;
    placeholder: string;
    value: string;
    onChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
    rows?: number;
}

//LetterCounter
export interface LetterCounterProps {
    value: string;
    limit: string;
}

//DashboardList
export interface UserProps {
    id: number;
    username: string;
    email: string;
}

export interface DashboardListProps {
    onSelectUser: (id: string) => void; // Function to pass the selected user ID
}

//Profile
export interface ProfileProps {
    username: string;
    banner: string;
    avatar: string;
    location: string;
    bio: string;
    website: string;
    followerCount: number;
    followingCount: number;
    is_blocked: boolean; 
}

export interface ProfileHeadProps {
    username: string;
    banner: string;
    avatar: string;
    location: string;
    bio: string;
    website: string;
    isFollowing: boolean;
    followerCount: number;
    followingCount: number;
    onFollowToggle: () => void;
    isCurrentUser: boolean;
    isBlocked: boolean;
    onBlockToggle: () => void;
    blockedMe: boolean;
}

//Post comments
export interface PostCommentProps {
    postId: string;
    updateCommentCount: () => void; 
}

export interface Comment {
    id: number;
    content: string;
    created_at: string;
    user_id: number;
    username: string;
    avatar: string;
}

//BlockedUser
export interface BlockedUserProps {
    id: number;
    username: string;
    avatar: string;
}