import { useState, useEffect } from 'react';
import TextArea from '../ui/TextArea';
import FormLabel from '../ui/FormLabel';
import Button from '../ui/Button';
import Avatar from '../ui/Avatar';
import LetterCounter from '../ui/LetterCounter';
import { useAuth } from '../context/AuthContext';
import { PostCommentProps, Comment } from '../interfaces/dataDefinitions';
import { API_BASE_URL } from '../utils/config';

export default function PostComment({ postId, updateCommentCount }: PostCommentProps) {
    const { token } = useAuth();
    const [comment, setComment] = useState('');
    const [commentError, setCommentError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [comments, setComments] = useState<Comment[]>([]);

    const fetchComments = async () => {
        const response = await fetch(`${API_BASE_URL}/comments?post_id=${postId}`);
        const data = await response.json();

        if (response.ok && data.comments) {
            setComments(data.comments);
            updateCommentCount(); // ✅ Update the comment count
        } else {
            console.error('Failed to fetch comments:', data.error || 'No comments found');
        }
    };

    // ✅ useEffect uses the proper fetchComments now
    useEffect(() => {
        fetchComments();
    }, [postId]);

    const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = e.target.value;
        if (value.length > 280) {
            setCommentError('Comment cannot exceed 280 characters.');
        } else {
            setCommentError('');
        }
        setComment(value);
    };

    const handleSubmit = async () => {
        if (!token) {
            alert("You need to log in to comment!");
            return;
        }

        setLoading(true);
        setSuccessMessage('');
        const response = await fetch(`${API_BASE_URL}/comments?post_id=${postId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ content: comment, post_id: postId }),
        });

        if (response.ok) {
            setSuccessMessage('Comment published successfully!');
            setComment('');
            await fetchComments();
            setTimeout(() => setSuccessMessage(''), 3000);
        } else {
            const errorData = await response.json();
            setCommentError(errorData.message || 'Failed to publish comment.');
        }
        setLoading(false);
    };

    return (
        <>
            <div className="flex flex-col p-5 gap-4 w-full md:w-1/2 rounded-4xl bg-post-background">
            <FormLabel size="extralarge2" weight="medium" color="default" label="Comments:" />
                {comments.map((comment) => (
                    <div key={comment.id} className="flex flex-col mb-4">
                        <div className="cursor-pointer">
                            <Avatar avatar={`${API_BASE_URL}${comment.avatar}`} username={comment.username} color="black" />
                        </div>
                        <div>
                            <p className="text-xl text-post-text">{comment.content}</p>
                        </div>
                        <div className="text-sm text-gray-500">{comment.created_at}</div>
                    </div>
                ))}
            </div>
            <div className="bg-post-background rounded-4xl gap-3 w-full">
                <div className="p-7 gap-3">
                    <div className="flex flex-col justify-center gap-2">
                        <FormLabel size="extralarge2" weight="medium" color="default" label="Comment:" />
                        <TextArea
                            placeholder="Your text here..."
                            value={comment}
                            onChange={(e) => handleCommentChange(e as React.ChangeEvent<HTMLTextAreaElement>)}
                            rows={5}
                        />
                        <LetterCounter value={comment} limit="280" />
                        {commentError && <span className="text-error">{commentError}</span>}
                        {successMessage && <span className="text-success">{successMessage}</span>}
                    </div>
                    <div className="flex justify-center mt-6">
                        <Button width="fit" padding="default" onClick={handleSubmit} disabled={loading || comment.length > 280}>Publish</Button>
                    </div>
                </div>
            </div>
        </>
    );
}
