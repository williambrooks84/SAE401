export default function FollowerCounter({ followerCount, followingCount }: { followerCount: number, followingCount: number }) {
    return (
        <div className="flex flex-row items-center gap-4">
            <div className="flex flex-row items-center gap-1">
                <span className="text-sm font-medium text-post-text">{followerCount}</span>
                <span className="text-sm font-medium text-post-grey">followers</span>
            </div>
            <div className="flex flex-row items-center gap-1">
                <span className="text-sm font-medium text-post-text">{followingCount}</span>
                <span className="text-sm font-medium text-post-grey">following</span>
            </div>
        </div>    
    )
}