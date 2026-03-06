import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    error?: string;
    containerClassName?: string;
}

export function InputField({ label, error, containerClassName, className, ...props }: InputFieldProps & { className?: string }) {
    return (
        <div className={`grid w-full items-center gap-2 ${containerClassName || ""}`}>
            {label && (
                <Label
                    htmlFor={props.id}
                    className="text-[#BDD8E9] text-xs font-black uppercase tracking-widest"
                >
                    {label}
                </Label>
            )}
            <Input
                className={`w-full bg-[rgba(13,17,40,0.80)] border border-[rgba(22,160,133,0.30)] text-white placeholder-[rgba(189,216,233,0.40)] rounded-xl px-4 py-3 focus:outline-none focus:border-[#16A085] focus:ring-2 focus:ring-[rgba(22,160,133,0.20)] transition-all duration-200 ${className}`}
                {...props}
            />
            {error && <p className="text-[10px] font-bold text-destructive pl-1 uppercase tracking-widest">{error}</p>}
        </div>
    );
}
