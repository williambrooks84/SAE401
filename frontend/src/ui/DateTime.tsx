export default function DateTime({ date }: { date: string }) {
    return (
        <small className = "font-semibold text-xs text-post-grey">
            {new Date(date).toLocaleString('fr-FR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: false,
            })}
        </small>
    );
}