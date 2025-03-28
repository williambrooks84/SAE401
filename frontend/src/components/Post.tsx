import DateTime from "../ui/DateTime";
import { HomeIcon } from "../assets/icons";
import { PostProps } from "../interfaces/dataDefinitions";

export default function Post({ username, content, created_at }: PostProps) {
    return (
        <div className="flex flex-col p-5 w-full md:w-1/2 rounded-4xl bg-post-background">
            <p className = "text-lg font-semibold">{username}</p>
            <p className="text-xl text-post-text">{content}</p>
            <hr className="my-4 border-post-grey" />
            <DateTime date={created_at} />
            <HomeIcon className="w-6 h-6" />
        </div>

    );
}