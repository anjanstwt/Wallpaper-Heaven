"use client";

import { useEffect, useState } from "react";
import { IconX } from "@tabler/icons-react";
import axios from "axios";
import { useAddProductStore } from "@/store/useAddProductStore";
import { GET_TAGS_URL } from "@/routes/routes";

interface Tag {
    id: number;
    name: string;
}

export default function SetTags() {
    const { product, updateProduct } = useAddProductStore();
    const [availableTags, setAvailableTags] = useState<Tag[]>([]);
    const [input, setInput] = useState("");

    useEffect(() => {
        axios.get(GET_TAGS_URL)
            .then((res) => setAvailableTags(res.data.tags ?? []))
            .catch(() => console.error("Failed to fetch tags"));
    }, []);

    const filteredSuggestions = input.trim()
        ? availableTags.filter(
            (t) =>
                t.name.toLowerCase().includes(input.toLowerCase()) &&
                !product.tagIds.includes(t.id)
        )
        : [];

    const addTag = (tag: Tag) => {
        if (product.tagIds.includes(tag.id)) return;
        updateProduct({
            tagIds: [...product.tagIds, tag.id],
            tagNames: [...product.tagNames, tag.name],
        });
        setInput("");
    };

    const removeTag = (id: number) => {
        updateProduct({
            tagIds: product.tagIds.filter((tid) => tid !== id),
            tagNames: product.tagNames.filter((_, i) => product.tagIds[i] !== id),
        });
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            e.preventDefault();
            const match = availableTags.find(
                (t) => t.name.toLowerCase() === input.trim().toLowerCase()
            );
            if (match) addTag(match);
        }
    };

    return (
        <div className="text-[#3D5A40] w-full max-w-[672px] bg-[#F9FAF8] p-4 sm:p-6 rounded-xl shadow-sm">
            <div className="flex flex-col items-start mb-6">
                <div className="font-bold text-xl sm:text-2xl md:text-3xl text-[#3D5A40]">Set Tags</div>
                <div className="text-[#6D7278] text-sm sm:text-base mt-1">
                    Give your product a final touch.
                </div>
            </div>

            <div className="flex flex-col gap-3">
                {/* Input + suggestions */}
                <div className="relative">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Search existing tags..."
                        className="w-full px-4 py-3 border border-[#D1D5DB] rounded-md bg-[#FFF] text-[#3D5A40] placeholder-[#A0A0A0] focus:outline-none focus:ring-2 focus:ring-[#6DA165] transition-all text-base"
                    />
                    {filteredSuggestions.length > 0 && (
                        <div className="absolute z-10 mt-1 w-full bg-white border border-[#D1D5DB] rounded-lg shadow-lg max-h-40 overflow-y-auto">
                            {filteredSuggestions.map((tag) => (
                                <button
                                    key={tag.id}
                                    onClick={() => addTag(tag)}
                                    className="w-full text-left px-4 py-2 hover:bg-[#f1f5f3] text-[#3D5A40] transition-colors text-sm"
                                >
                                    {tag.name}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Selected tags */}
                <div className="flex flex-wrap gap-3 mt-1 border border-[#D1D5DB] rounded-lg bg-[#FFFFFF] p-4 min-h-[60px]">
                    {product.tagIds.length === 0 && (
                        <span className="text-[#A0A0A0] text-sm">No tags selected yet.</span>
                    )}
                    {product.tagIds.map((id, i) => (
                        <div
                            key={id}
                            className="flex items-center bg-[#6DA165] text-white rounded-full px-3 py-1.5 sm:px-5 sm:py-2 text-sm sm:text-base font-semibold hover:bg-[#5a914e] group"
                        >
                            <span className="mr-2">{product.tagNames[i]}</span>
                            <button
                                onClick={() => removeTag(id)}
                                className="hover:text-red-300 transition-colors"
                            >
                                <IconX size={18} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
