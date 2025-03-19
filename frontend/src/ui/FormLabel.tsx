import { FormLabelProps } from "../interfaces/dataDefinitions";

export default function FormLabel({ label }: FormLabelProps) {
    return (
        <label className="text-sm font-medium text-default">{label}</label>
    );
}