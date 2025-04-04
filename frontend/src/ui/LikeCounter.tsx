export default function LikeCounter({ likesCount }: { likesCount: number }) {
    return (
        <div className="flex flex-row items-center gap-1">
            <span className="text-sm font-medium text-post-text">{likesCount}</span>
            <span className="text-sm font-medium text-post-grey">Likes</span>
        </div>
    )
}