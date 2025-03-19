interface LetterCounterProps {
    value: string;
    limit: string;
}

export default function LetterCounter({ value, limit }: LetterCounterProps) {
    return (
        <div className="text-right text-post-grey text-sm font-medium">
            <span className="text-black">{value.length}</span> / {limit} characters
        </div>
    );
}