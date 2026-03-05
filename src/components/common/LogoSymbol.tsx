import React from "react";

export function LogoSymbol({ className = "", size = "md" }: { className?: string, size?: "sm" | "md" | "lg" | "xl" }) {
    const sizeMap = {
        sm: "h-8 w-8",
        md: "h-12 w-12",
        lg: "h-16 w-16",
        xl: "h-24 w-24"
    };

    return (
        <svg
            className={`${sizeMap[size]} ${className}`}
            viewBox="0 0 200 200"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            {/* Outer Glow Ring */}
            <circle
                cx="100"
                cy="100"
                r="80"
                stroke="white"
                strokeWidth="2"
                strokeOpacity="0.3"
            />

            {/* The Brain Icon (Minimalist Circuit View) */}
            <path
                d="M100 60C77.9086 60 60 77.9086 60 100C60 122.091 77.9086 140 100 140M100 60C122.091 60 140 77.9086 140 100C140 122.091 122.091 140 100 140M100 60V140"
                stroke="white"
                strokeWidth="4"
                strokeLinecap="round"
            />
            <circle cx="80" cy="90" r="3" fill="#16A085" />
            <circle cx="120" cy="110" r="3" fill="#2563eb" />
            <circle cx="100" cy="80" r="2" fill="white" />

            {/* The Dynamic Swoosh Arrow */}
            <defs>
                <linearGradient id="logoGradient" x1="40" y1="160" x2="160" y2="40" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#16A085" />
                    <stop offset="60%" stopColor="#2563eb" />
                    <stop offset="100%" stopColor="#16A085" />
                </linearGradient>
            </defs>
            <path
                d="M40 160C40 160 60 140 100 120C140 100 160 40 160 40"
                stroke="url(#logoGradient)"
                strokeWidth="8"
                strokeLinecap="round"
                className="animate-pulse"
            />
            <path
                d="M145 45 L160 40 L155 55"
                stroke="url(#logoGradient)"
                strokeWidth="8"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}
