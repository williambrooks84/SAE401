import { TextAreaProps } from "../interfaces/dataDefinitions";

export default function TextArea({ placeholder, value, onChange, rows }: TextAreaProps) {
    return (
        <textarea
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            className="p-3 border w-full rounded bg-textbox"
            rows={rows}
        />
    );
}