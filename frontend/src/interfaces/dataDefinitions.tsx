// Extend the AuthContextType to include `user`
export interface User {
    username: string;
    userId: string;
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
}

//PostData
export interface PostData {
    id: string;
    user_id: string;
    avatar: string;
    username: string;
    content: string;
    created_at: string;
}

//TextArea
export interface TextAreaProps {
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

export interface ProfileProps {
    username: string;
    banner: string;
    avatar: string;
    location: string;
    bio: string;
    website: string;
}

export interface ProfileHeadProps {
    username: string;
    banner: string;
    avatar: string;
    location: string;
    bio: string;
    website: string;
    isFollowing: boolean;
    onFollowToggle: () => void;
    isCurrentUser: boolean;
}
