export default function CommentCounter({ commentsCount }: { commentsCount: number }) {
    return (
        <div className="flex flex-row items-center gap-1">
            <span className="text-sm font-medium text-post-text">{commentsCount}</span>
            <span className="text-sm font-medium text-post-grey">Comments</span>
        </div>
    )
}