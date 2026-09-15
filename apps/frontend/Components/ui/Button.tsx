import React from "react";

interface ButtonProps {
    onClick: () => void;
    className?: string;
    children?: React.ReactNode;
}

export default function Button({ onClick, className, children }: ButtonProps) {
    return (
        <button onClick={onClick} className={className}>
            {children}
        </button>
    );
}
