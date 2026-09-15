"use client";

import { IconPlus, IconX, IconEdit } from "@tabler/icons-react";
import { useRef } from "react";
import Image from "next/image";
import { useAddProductStore } from "@/store/useAddProductStore";
import { handleUpload } from "@/lib/s3-uploads";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

const REQUIRED = 3;
const TOTAL = 8;

export default function AddImage() {
    const { data: session } = useSession();
    const { product, updateProduct } = useAddProductStore();

    // keep TOTAL refs
    const inputRefs = Array.from({ length: TOTAL }, () => useRef<HTMLInputElement>(null));

    const triggerUpload = (index: number) => inputRefs[index]?.current?.click();

    const onFileChange = async (index: number, file: File | undefined) => {
        if (!file) return;
        const token = session?.user?.token;
        if (!token) { toast.error("You must be logged in as admin to upload images."); return; }

        const toastId = toast.loading(`Uploading image ${index + 1}…`);
        const url = await handleUpload(file, token);
        toast.dismiss(toastId);

        if (!url) { toast.error("Image upload failed."); return; }

        const updated = [...product.images];
        updated[index] = url;
        updateProduct({ images: updated });
        toast.success(`Image ${index + 1} uploaded!`);
    };

    const removeImage = (index: number) => {
        const updated = [...product.images];
        updated.splice(index, 1);
        updateProduct({ images: updated });
    };

    return (
        <div className="text-[#3D5A40] bg-[#F9FAF8] p-4 sm:p-6 rounded-xl shadow-sm w-full max-w-3xl">
            <div className="flex flex-col items-start mb-6">
                <div className="font-bold text-xl sm:text-2xl md:text-3xl">Select Images</div>
                <div className="text-[#6D7278] text-sm sm:text-base mt-1">
                    Upload <span className="font-semibold text-[#3D5A40]">3 required</span> images and up to 5 optional ones.
                </div>
            </div>

            {/* Required slots */}
            <p className="text-xs font-semibold text-[#3D5A40] uppercase tracking-widest mb-3">Required</p>
            <div className="flex flex-wrap gap-3 sm:gap-4 mb-6">
                {Array.from({ length: REQUIRED }).map((_, i) => (
                    <ImageSlot
                        key={i}
                        index={i}
                        url={product.images[i]}
                        inputRef={inputRefs[i]}
                        required
                        onTrigger={() => triggerUpload(i)}
                        onFileChange={(f) => onFileChange(i, f)}
                        onRemove={() => removeImage(i)}
                    />
                ))}
            </div>

            {/* Optional slots */}
            <p className="text-xs font-semibold text-neutral-400 uppercase tracking-widest mb-3">Optional</p>
            <div className="flex flex-wrap gap-3 sm:gap-4">
                {Array.from({ length: TOTAL - REQUIRED }).map((_, j) => {
                    const i = REQUIRED + j;
                    return (
                        <ImageSlot
                            key={i}
                            index={i}
                            url={product.images[i]}
                            inputRef={inputRefs[i]}
                            required={false}
                            onTrigger={() => triggerUpload(i)}
                            onFileChange={(f) => onFileChange(i, f)}
                            onRemove={() => removeImage(i)}
                        />
                    );
                })}
            </div>
        </div>
    );
}

interface SlotProps {
    index: number;
    url?: string;
    inputRef: React.RefObject<HTMLInputElement | null>;
    required: boolean;
    onTrigger: () => void;
    onFileChange: (f: File | undefined) => void;
    onRemove: () => void;
}

function ImageSlot({ index, url, inputRef, required, onTrigger, onFileChange, onRemove }: SlotProps) {
    return (
        <div className="relative group">
            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => onFileChange(e.target.files?.[0])}
            />

            {url ? (
                <div className="relative h-24 w-24 sm:h-32 sm:w-32 md:h-40 md:w-40 rounded-xl overflow-hidden border-2 border-[#6DA165]">
                    <Image src={url} alt={`Image ${index + 1}`} fill className="object-cover" unoptimized />

                    {/* Hover overlay: edit + remove */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button
                            onClick={onTrigger}
                            title="Replace image"
                            className="bg-white text-[#3D5A40] p-2 rounded-full shadow hover:scale-110 transition-transform"
                        >
                            <IconEdit size={15} />
                        </button>
                        <button
                            onClick={onRemove}
                            title="Remove image"
                            className="bg-white text-red-500 p-2 rounded-full shadow hover:scale-110 transition-transform"
                        >
                            <IconX size={15} />
                        </button>
                    </div>

                    {/* Required badge */}
                    {required && (
                        <span className="absolute bottom-1 left-1 text-[10px] bg-[#3D5A40] text-white px-1.5 py-0.5 rounded-full font-medium">
                            Required
                        </span>
                    )}
                </div>
            ) : (
                <div
                    onClick={onTrigger}
                    className={`h-24 w-24 sm:h-32 sm:w-32 md:h-40 md:w-40 rounded-xl flex flex-col justify-center items-center gap-1 cursor-pointer transition-all
                        ${required
                            ? "border-2 border-dashed border-[#6DA165] bg-white hover:bg-[#eef4ec]"
                            : "border-2 border-dashed border-neutral-300 bg-white hover:bg-neutral-50"
                        }`}
                >
                    <IconPlus size={24} className={required ? "text-[#6DA165]" : "text-neutral-400"} />
                    <span className={`text-[11px] font-medium ${required ? "text-[#6DA165]" : "text-neutral-400"}`}>
                        {required ? `Image ${index + 1} *` : `Optional ${index - 2}`}
                    </span>
                </div>
            )}
        </div>
    );
}
