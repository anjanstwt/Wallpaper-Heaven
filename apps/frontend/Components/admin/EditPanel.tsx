"use client";

import { useEffect, useState } from "react";
import { IconX, IconPencil } from "@tabler/icons-react";
import { createPortal } from "react-dom";

interface EditPanelProps {
    title: string;
    isOpen: boolean;
    onOpen: () => void;
    onClose: () => void;
    onSave: () => void;
    saving?: boolean;
    showTrigger?: boolean;
    children: React.ReactNode;
}

export default function EditPanel({ title, isOpen, onOpen, onClose, onSave, saving, showTrigger = true, children }: EditPanelProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // close on Escape
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [onClose]);

    const drawerContent = (
        <>
            {/* Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-[200] bg-black/30 backdrop-blur-[2px]"
                    onClick={onClose}
                />
            )}

            {/* Drawer */}
            <div
                className={`fixed top-0 right-0 z-[201] h-full w-full sm:w-[380px] bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-out ${isOpen ? "translate-x-0" : "translate-x-full"}`}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-4 sm:px-6 py-4 sm:py-5 border-b border-neutral-100">
                    <h2 className="font-semibold text-[#3D5A40] text-base">{title}</h2>
                    <button onClick={onClose} className="text-neutral-400 hover:text-neutral-700 transition-colors">
                        <IconX size={20} />
                    </button>
                </div>

                {/* Scrollable fields */}
                <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-5 flex flex-col gap-4">
                    {children}
                </div>

                {/* Footer */}
                <div className="px-4 sm:px-6 py-4 border-t border-neutral-100 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-2.5 rounded-full border border-neutral-200 text-neutral-600 text-sm font-medium hover:bg-neutral-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onSave}
                        disabled={saving}
                        className="flex-1 py-2.5 rounded-full bg-[#3D5A40] text-white text-sm font-semibold hover:bg-[#2d4430] transition-colors disabled:opacity-60"
                    >
                        {saving ? "Saving…" : "Save"}
                    </button>
                </div>
            </div>
        </>
    )

    return (
        <>
            {/* Pencil trigger */}
            {showTrigger && (
                <button
                    onClick={onOpen}
                    title="Edit section"
                    className="absolute top-3 right-3 z-50 bg-white/80 backdrop-blur-sm border border-neutral-200 text-neutral-600 hover:text-[#3D5A40] hover:border-[#6DA165] rounded-full p-2 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-110"
                >
                    <IconPencil size={16} />
                </button>
            )}

            {mounted && createPortal(drawerContent, document.body)}
        </>
    );
}

/* ── Shared field components ──────────────────────────── */

export function FieldLabel({ children }: { children: React.ReactNode }) {
    return <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-1">{children}</label>;
}

export function FieldInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
    return (
        <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full border border-neutral-200 rounded-xl px-4 py-2.5 text-sm text-neutral-800 placeholder-neutral-300 focus:outline-none focus:ring-2 focus:ring-[#6DA165]/40 focus:border-[#6DA165] transition-all"
        />
    );
}

export function FieldTextarea({ value, onChange, placeholder, rows = 3 }: { value: string; onChange: (v: string) => void; placeholder?: string; rows?: number }) {
    return (
        <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            rows={rows}
            className="w-full border border-neutral-200 rounded-xl px-4 py-2.5 text-sm text-neutral-800 placeholder-neutral-300 resize-none focus:outline-none focus:ring-2 focus:ring-[#6DA165]/40 focus:border-[#6DA165] transition-all"
        />
    );
}
