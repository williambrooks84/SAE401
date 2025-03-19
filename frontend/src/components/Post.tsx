interface PostProps {
    key: string;
    id: string;
    content: string;
    created_at: string;
}

export default function Post({ id, content, created_at }: PostProps) {
    return (
        <div>
            <p>{content}</p>
            <small>{created_at}</small>
        </div>
    );
}