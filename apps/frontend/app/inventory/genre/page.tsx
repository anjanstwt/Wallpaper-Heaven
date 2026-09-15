"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Image from "next/image";
import { gsap } from "gsap";
import { Pencil, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";
import NavbarMain from "@/Components/Nav-Bar/NavbarMain";
import EditPanel, { FieldInput, FieldLabel } from "@/Components/admin/EditPanel";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import { handleUpload } from "@/lib/s3-uploads";
import { GET_TAGS_URL, UPSERT_TAG_URL, REMOVE_TAG_URL } from "@/routes/routes";

type Genre = { id: number; name: string; image?: string };
type PanelMode = "add" | "edit";

const DEMO_GENRES: Genre[] = [
    { id: -1,  name: "Botanical",      image: "https://picsum.photos/seed/gn1/500/500" },
    { id: -2,  name: "Abstract",       image: "https://picsum.photos/seed/gn2/500/500" },
    { id: -3,  name: "Geometric",      image: "https://picsum.photos/seed/gn3/500/500" },
    { id: -4,  name: "Marble",         image: "https://picsum.photos/seed/gn4/500/500" },
    { id: -5,  name: "Tropical",       image: "https://picsum.photos/seed/gn5/500/500" },
    { id: -6,  name: "Minimalist",     image: "https://picsum.photos/seed/gn6/500/500" },
    { id: -7,  name: "Floral",         image: "https://picsum.photos/seed/gn7/500/500" },
    { id: -8,  name: "Architecture",   image: "https://picsum.photos/seed/gn8/500/500" },
    { id: -9,  name: "Celestial",      image: "https://picsum.photos/seed/gn9/500/500" },
    { id: -10, name: "Vintage",        image: "https://picsum.photos/seed/gn10/500/500" },
    { id: -11, name: "Noir",           image: "https://picsum.photos/seed/gn11/500/500" },
    { id: -12, name: "Art Deco",       image: "https://picsum.photos/seed/gn12/500/500" },
    { id: -13, name: "Wabi-Sabi",      image: "https://picsum.photos/seed/gn13/500/500" },
    { id: -14, name: "Jungle",         image: "https://picsum.photos/seed/gn14/500/500" },
    { id: -15, name: "Coastal",        image: "https://picsum.photos/seed/gn15/500/500" },
    { id: -16, name: "Nordic",         image: "https://picsum.photos/seed/gn16/500/500" },
];

const PALETTE = [
    "#C5B4E3", "#FFD9A6", "#B3E5FC", "#F3CBB7", "#A8E6CF",
    "#F8BBD0", "#F6E2A1", "#CFD8DC", "#EBD5B3", "#FADBD8",
    "#D5E8D4", "#DAE8FC", "#FFF2CC", "#F8CECC", "#E0E0E0",
];

function getBentoSpan(i: number) {
    return i % 5 === 0 ? "col-span-2 row-span-2" : "";
}

function SkeletonBento() {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 auto-rows-[140px] sm:auto-rows-[160px] lg:auto-rows-[180px] gap-3" style={{ gridAutoFlow: "dense" }}>
            {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className={`animate-pulse rounded-3xl bg-neutral-100 ${i % 5 === 0 ? "col-span-2 row-span-2" : ""}`} />
            ))}
        </div>
    );
}

export default function GenrePage() {
    const router = useRouter();
    const { isAdmin } = useAdminCheck();
    const gridRef = useRef<HTMLDivElement>(null);
    const imageFileRef = useRef<HTMLInputElement>(null);
    const [genres, setGenres] = useState<Genre[]>(DEMO_GENRES);
    const [loading, setLoading] = useState(true);

    // Panel
    const [panelOpen, setPanelOpen] = useState(false);
    const [panelMode, setPanelMode] = useState<PanelMode>("add");
    const [editingGenre, setEditingGenre] = useState<Genre | null>(null);
    const [gName, setGName] = useState("");
    const [gImage, setGImage] = useState("");
    const [saving, setSaving] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);

    useEffect(() => {
        axios.get(GET_TAGS_URL)
            .then(({ data }) => {
                const result = data.tags ?? [];
                if (result.length > 0) setGenres(result);
                else setGenres(DEMO_GENRES);
            })
            .catch(() => setGenres(DEMO_GENRES))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        if (loading || !gridRef.current) return;
        gsap.fromTo(
            gridRef.current.querySelectorAll(".genre-cell"),
            { opacity: 0, scale: 0.9 },
            { opacity: 1, scale: 1, stagger: 0.055, duration: 0.5, ease: "back.out(1.4)" }
        );
    }, [genres, loading]);

    const openAdd = () => {
        setPanelMode("add");
        setEditingGenre(null);
        setGName(""); setGImage("");
        setPanelOpen(true);
    };

    const openEdit = (e: React.MouseEvent, genre: Genre) => {
        e.stopPropagation();
        setPanelMode("edit");
        setEditingGenre(genre);
        setGName(genre.name);
        setGImage(genre.image ?? "");
        setPanelOpen(true);
    };

    const onImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploadingImage(true);
        const url = await handleUpload(file);
        if (url) setGImage(url);
        else toast.error("Image upload failed.");
        setUploadingImage(false);
        e.target.value = "";
    };

    const handleSave = async () => {
        if (!gName.trim()) { toast.error("Genre name is required."); return; }
        setSaving(true);
        try {
            const payload: Record<string, unknown> = { name: gName.trim(), image: gImage || undefined };
            if (panelMode === "edit" && editingGenre) payload.id = editingGenre.id;

            const { data } = await axios.post(UPSERT_TAG_URL, payload);

            if (data.success) {
                const genre: Genre = data.tag;
                if (panelMode === "add") {
                    setGenres(prev => [...prev, genre]);
                    toast.success(`${genre.name} added!`);
                } else {
                    setGenres(prev => prev.map(g => g.id === genre.id ? genre : g));
                    toast.success(`${genre.name} updated!`);
                }
                setPanelOpen(false);
            }
        } catch { toast.error("Failed to save genre."); }
        finally { setSaving(false); }
    };

    const handleDelete = (e: React.MouseEvent, genre: Genre) => {
        e.stopPropagation();
        toast(`Delete "${genre.name}"?`, {
            description: "This cannot be undone.",
            action: {
                label: "Delete",
                onClick: async () => {
                    try {
                        await axios.post(REMOVE_TAG_URL, { id: genre.id });
                        setGenres(prev => prev.filter(g => g.id !== genre.id));
                        toast.success(`${genre.name} deleted.`);
                    } catch { toast.error("Failed to delete genre."); }
                },
            },
            cancel: { label: "Cancel", onClick: () => {} },
        });
    };

    const goToGenre = (genre: Genre) =>
        router.push(`/inventory/genre/${genre.name.toLowerCase().replace(/\s+/g, "-")}`);

    return (
        <div className="min-h-screen" style={{ backgroundColor: "#FAFAF9" }}>
            <NavbarMain />

            {/* Admin panel */}
            {isAdmin && (
                <>
                    <EditPanel
                        title={panelMode === "add" ? "Add Genre" : `Edit: ${editingGenre?.name}`}
                        isOpen={panelOpen}
                        onOpen={() => {}}
                        onClose={() => setPanelOpen(false)}
                        onSave={handleSave}
                        saving={saving}
                        showTrigger={false}
                    >
                        <div>
                            <FieldLabel>Genre Name *</FieldLabel>
                            <FieldInput value={gName} onChange={setGName} placeholder="e.g. Botanical" />
                        </div>
                        <div>
                            <FieldLabel>Image</FieldLabel>
                            <div
                                className="relative w-full h-36 rounded-xl overflow-hidden border-2 border-dashed border-neutral-200 cursor-pointer hover:border-[#6DA165] transition-colors"
                                onClick={() => imageFileRef.current?.click()}
                            >
                                {uploadingImage ? (
                                    <div className="absolute inset-0 flex items-center justify-center bg-neutral-50">
                                        <div className="w-6 h-6 border-2 border-neutral-400 border-t-transparent rounded-full animate-spin" />
                                    </div>
                                ) : gImage ? (
                                    <Image src={gImage} alt="preview" fill className="object-cover" unoptimized />
                                ) : (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center text-neutral-400 gap-1">
                                        <Plus className="w-6 h-6" />
                                        <span className="text-xs">Click to upload</span>
                                    </div>
                                )}
                            </div>
                            <input ref={imageFileRef} type="file" accept="image/*" className="hidden" onChange={onImageChange} />
                        </div>
                    </EditPanel>
                </>
            )}

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-[72px] pb-20">
                {/* Header */}
                <div className="mb-10 sm:mb-12">
                    <div className="flex items-start justify-between gap-4">
                        <div className="inline-flex items-center gap-2 bg-black/5 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest text-neutral-500">
                            {loading ? "—" : `${genres.length} genres`}
                        </div>
                        {isAdmin && (
                            <button
                                onClick={openAdd}
                                className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-neutral-800 transition-colors flex-shrink-0"
                            >
                                <Plus className="w-4 h-4" />
                                <span className="hidden sm:inline">Add Genre</span>
                                <span className="sm:hidden">Add</span>
                            </button>
                        )}
                    </div>
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-semibold tracking-tight text-neutral-900 leading-none mt-5">
                        Genres
                    </h1>
                    <p className="text-neutral-500 mt-4 text-base sm:text-lg max-w-lg font-light">
                        Choose your aesthetic. Every wall tells a different story.
                    </p>
                </div>

                {loading ? (
                    <SkeletonBento />
                ) : genres.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-32 text-center">
                        <div className="w-20 h-20 rounded-full bg-neutral-100 flex items-center justify-center text-3xl mb-6">🎭</div>
                        <p className="text-2xl font-semibold text-neutral-800">No genres yet</p>
                        <p className="text-neutral-400 mt-2">Genres appear here once added.</p>
                    </div>
                ) : (
                    <div
                        ref={gridRef}
                        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 auto-rows-[140px] sm:auto-rows-[160px] lg:auto-rows-[180px] gap-3 sm:gap-4"
                        style={{ gridAutoFlow: "dense" }}
                    >
                        {genres.map((genre, i) => {
                            const bg = PALETTE[i % PALETTE.length];
                            const isBig = i % 5 === 0;

                            return (
                                <div
                                    key={genre.id}
                                    onClick={() => goToGenre(genre)}
                                    className={`genre-cell relative rounded-3xl overflow-hidden cursor-pointer group
                                        hover:shadow-xl hover:scale-[1.02] active:scale-[0.99]
                                        transition-all duration-300 ease-out
                                        ${getBentoSpan(i)}`}
                                    style={{ backgroundColor: bg }}
                                >
                                    {genre.image && (
                                        <Image
                                            src={genre.image}
                                            alt={genre.name}
                                            fill
                                            className="object-cover opacity-80 transition-transform duration-500 group-hover:scale-[1.05]"
                                            unoptimized
                                        />
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                                    <div
                                        className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-3xl"
                                        style={{ backgroundColor: bg }}
                                    />
                                    <div className="absolute inset-0 flex flex-col justify-end p-5 sm:p-6">
                                        <span className={`font-semibold text-white drop-shadow-lg leading-none ${isBig ? "text-4xl sm:text-5xl" : "text-xl sm:text-2xl"}`}>
                                            {genre.name}
                                        </span>
                                        <span className="text-white/50 text-xs mt-1 font-medium uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                            Explore →
                                        </span>
                                    </div>
                                    <div className="absolute top-4 right-4 w-2.5 h-2.5 rounded-full bg-white/40 group-hover:bg-white/70 transition-colors duration-300" />

                                    {/* Admin controls */}
                                    {isAdmin && (
                                        <div className="absolute top-4 left-4 z-20 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                            <button
                                                onClick={(e) => openEdit(e, genre)}
                                                className="w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm hover:scale-110 transition-transform"
                                            >
                                                <Pencil className="w-3.5 h-3.5 text-neutral-700" />
                                            </button>
                                            <button
                                                onClick={(e) => handleDelete(e, genre)}
                                                className="w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm hover:scale-110 transition-transform"
                                            >
                                                <Trash2 className="w-3.5 h-3.5 text-red-500" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
