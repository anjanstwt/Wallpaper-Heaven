"use client";

import { useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { IconUpload, IconX, IconLoader2 } from "@tabler/icons-react";
import Image from "next/image";
import { handleUpload } from "@/lib/s3-uploads";

interface ImageUploadInputProps {
    value: string;
    onChange: (url: string) => void;
    className?: string;
}

export default function ImageUploadInput({ value, onChange, className }: ImageUploadInputProps) {
    const { data: session } = useSession();
    const inputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);

    const onFileChange = async (file: File | undefined) => {
        if (!file) return;
        const token = session?.user?.token;
        if (!token) {
            toast.error("You must be logged in as admin to upload images.");
            return;
        }
        setUploading(true);
        const url = await handleUpload(file, token);
        setUploading(false);
        if (!url) return;
        onChange(url);
        toast.success("Image uploaded!");
    };

    return (
        <div className={className ?? "w-full"}>
            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => onFileChange(e.target.files?.[0])}
            />

            {value ? (
                <div className="relative w-full h-32 rounded-xl overflow-hidden border border-neutral-200 group">
                    <Image src={value} alt="Uploaded image" fill className="object-cover" unoptimized />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button
                            type="button"
                            onClick={() => inputRef.current?.click()}
                            className="bg-white text-neutral-700 text-xs font-medium px-3 py-1.5 rounded-full hover:scale-105 transition-transform"
                        >
                            Replace
                        </button>
                        <button
                            type="button"
                            onClick={() => onChange("")}
                            title="Remove image"
                            className="bg-white text-red-500 p-1.5 rounded-full hover:scale-105 transition-transform"
                        >
                            <IconX size={14} />
                        </button>
                    </div>
                </div>
            ) : (
                <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    disabled={uploading}
                    className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-neutral-300 rounded-xl py-4 text-sm text-neutral-500 hover:border-[#6DA165] hover:text-[#6DA165] transition-colors disabled:opacity-60"
                >
                    {uploading ? <IconLoader2 size={16} className="animate-spin" /> : <IconUpload size={16} />}
                    {uploading ? "Uploading…" : "Upload image"}
                </button>
            )}
        </div>
    );
}
