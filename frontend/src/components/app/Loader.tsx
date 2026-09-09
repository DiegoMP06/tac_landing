import { Loader2 } from "lucide-react";

interface LoaderProps {
    size?: number;
    className?: string;
}

export default function Loader({ size = 24, className = "" }: LoaderProps) {
    return (
        <div className="flex items-center justify-center p-4">
            <Loader2
                size={size}
                className={`animate-spin text-foreground ${className}`}
            />
        </div>
    );
}
