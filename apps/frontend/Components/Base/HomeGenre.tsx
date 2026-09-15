"use client";

import { cn } from "@/lib/utils";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Plus, Pencil } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import EditPanel, { FieldInput, FieldLabel } from "@/Components/admin/EditPanel";
import ImageUploadInput from "@/Components/ui/ImageUploadInput";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import { GET_TAGS_URL, UPSERT_TAG_URL } from "@/routes/routes";

type Genre = { id?: number; title: string; bgColor: string; image?: string };

const PALETTE = [
    "#C5B4E3", "#FFD9A6", "#E0E0E0", "#F3CBB7", "#B3E5FC",
    "#F8BBD0", "#F6E2A1", "#A8E6CF", "#EBD5B3", "#CFD8DC",
    "#FADBD8", "#D5E8D4", "#DAE8FC", "#FFF2CC", "#F8CECC",
];

const FALLBACK_GENRES: Genre[] = [
    { title: "Pichwai", bgColor: "#C5B4E3" },
    { title: "Tropical", bgColor: "#FFD9A6" },
    { title: "Minimal", bgColor: "#E0E0E0" },
    { title: "Vintage", bgColor: "#F3CBB7" },
    { title: "Abstract", bgColor: "#B3E5FC" },
    { title: "Floral", bgColor: "#F8BBD0" },
    { title: "Bohemian", bgColor: "#F6E2A1" },
    { title: "Geometric", bgColor: "#A8E6CF" },
    { title: "Rustic", bgColor: "#EBD5B3" },
    { title: "Modern", bgColor: "#CFD8DC" },
];

export default function HomeGenre() {
    const router = useRouter();
    const containerRef = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(false);
    const { isAdmin, token } = useAdminCheck();

    const [genres, setGenres] = useState<Genre[]>(FALLBACK_GENRES);
    const [selected, setSelected] = useState<Genre | null>(FALLBACK_GENRES[0]);

    type PanelMode = "add" | "edit";
    const [panelOpen, setPanelOpen] = useState(false);
    const [panelMode, setPanelMode] = useState<PanelMode>("add");
    const [saving, setSaving] = useState(false);

    // Add mode fields
    const [newGenre, setNewGenre] = useState("");
    const [newImage, setNewImage] = useState("");
    const [addError, setAddError] = useState("");

    // Edit mode fields
    const [editingGenre, setEditingGenre] = useState<Genre | null>(null);
    const [editName, setEditName] = useState("");
    const [editImage, setEditImage] = useState("");

    useEffect(() => {
        axios.get(GET_TAGS_URL).then(({ data }) => {
            if (data.tags && data.tags.length > 0) {
                const mapped: Genre[] = data.tags.map((t: { id: number; name: string; image?: string }, i: number) => ({
                    id: t.id,
                    title: t.name,
                    bgColor: PALETTE[i % PALETTE.length],
                    image: t.image || undefined,
                }));
                setGenres(mapped);
                setSelected(mapped[0]);
            }
        }).catch(() => {});
    }, []);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) setIsVisible(true); },
            { threshold: 0.1, rootMargin: "50px 0px -50px 0px" }
        );
        if (containerRef.current) observer.observe(containerRef.current);
        return () => { if (containerRef.current) observer.unobserve(containerRef.current); };
    }, []);

    const openAdd = () => {
        setNewGenre(""); setNewImage(""); setAddError("");
        setPanelMode("add");
        setPanelOpen(true);
    };

    const openEditGenre = (genre: Genre) => {
        setEditingGenre(genre);
        setEditName(genre.title);
        setEditImage(genre.image || "");
        setPanelMode("edit");
        setPanelOpen(true);
    };

    const handleSave = async () => {
        if (panelMode === "add") {
            if (!newGenre.trim()) { setAddError("Genre name is required"); return; }
            setAddError("");
            setSaving(true);
            try {
                const { data } = await axios.post(
                    UPSERT_TAG_URL,
                    { name: newGenre.trim(), image: newImage.trim() || undefined },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                if (data.success) {
                    const tag = data.tag;
                    const newItem: Genre = {
                        id: tag.id, title: tag.name,
                        bgColor: PALETTE[genres.length % PALETTE.length],
                        image: tag.image || undefined,
                    };
                    setGenres(prev => [...prev, newItem]);
                    setSelected(newItem);
                    setPanelOpen(false);
                    toast.success(`Genre "${tag.name}" added!`);
                }
            } catch { toast.error("Failed to add genre."); }
            finally { setSaving(false); }
        } else {
            if (!editingGenre?.id || !editName.trim()) { toast.error("Genre name is required."); return; }
            setSaving(true);
            try {
                const { data } = await axios.post(
                    UPSERT_TAG_URL,
                    { id: editingGenre.id, name: editName.trim(), image: editImage.trim() || undefined },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                if (data.success) {
                    const updatedName = editName.trim();
                    const updatedImage = editImage.trim() || undefined;
                    setGenres(prev => prev.map(g =>
                        g.id === editingGenre.id ? { ...g, title: updatedName, image: updatedImage } : g
                    ));
                    if (selected?.id === editingGenre.id) {
                        setSelected(prev => prev ? { ...prev, title: updatedName, image: updatedImage } : null);
                    }
                    setPanelOpen(false);
                    toast.success(`Genre updated!`);
                }
            } catch { toast.error("Failed to update genre."); }
            finally { setSaving(false); }
        }
    };

    return (
        <div className="w-full flex flex-col lg:flex-row mt-20 sm:mt-28 lg:mt-40 max-w-7xl lg:h-[500px] gap-y-6 lg:gap-y-0">
            {isAdmin && (
                <EditPanel
                    title={panelMode === "add" ? "Add Genre" : `Edit: ${editingGenre?.title ?? "Genre"}`}
                    isOpen={panelOpen}
                    onOpen={openAdd}
                    onClose={() => setPanelOpen(false)}
                    onSave={handleSave}
                    saving={saving}
                    showTrigger={false}
                >
                    {panelMode === "add" ? (
                        <>
                            <div>
                                <FieldLabel>Genre Name *</FieldLabel>
                                <FieldInput value={newGenre} onChange={v => { setNewGenre(v); setAddError(""); }} placeholder="e.g. Boho Chic" />
                                {addError && <p className="text-xs text-red-500 mt-1">{addError}</p>}
                            </div>
                            <div>
                                <FieldLabel>Preview Image</FieldLabel>
                                <ImageUploadInput value={newImage} onChange={setNewImage} />
                            </div>
                            <p className="text-xs text-neutral-400">Genre appears as a tag on the home page and in search filters.</p>
                        </>
                    ) : (
                        <>
                            <div>
                                <FieldLabel>Genre Name *</FieldLabel>
                                <FieldInput value={editName} onChange={setEditName} placeholder="Genre name" />
                            </div>
                            <div>
                                <FieldLabel>Preview Image</FieldLabel>
                                <ImageUploadInput value={editImage} onChange={setEditImage} />
                            </div>
                            <p className="text-xs text-neutral-400">Changes apply everywhere this genre is shown.</p>
                        </>
                    )}
                </EditPanel>
            )}

            {/* Left: heading + genre pills */}
            <div ref={containerRef} className="w-full lg:w-[60%] flex flex-col">
                <div className={cn("text-4xl sm:text-5xl lg:text-6xl transition-all duration-1000 ease-out", isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8")}>
                    Genre
                </div>
                <div className={cn("text-base sm:text-xl transition-all duration-1000 ease-out delay-200", isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8")}>
                    Explore the range of genres that suits your home and requirements
                </div>

                <div className={cn("flex flex-wrap gap-3 mt-6 sm:mt-8 transition-all duration-1000 ease-out delay-400", isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8")}>
                    {genres.map((genre, index) => (
                        <div
                            key={genre.id ?? index}
                            onClick={() => setSelected(genre)}
                            style={{ backgroundColor: genre.bgColor }}
                            className={cn(
                                "relative group/pill text-base sm:text-xl px-4 py-1.5 rounded-full cursor-pointer",
                                "shadow-sm transition-all duration-200 ease-out transform hover:scale-105",
                                selected?.title === genre.title && "ring-2 ring-black/20",
                                isVisible ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-4 scale-95"
                            )}
                        >
                            {genre.title}
                            {isAdmin && genre.id && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); openEditGenre(genre); }}
                                    title="Edit genre"
                                    className="absolute -top-1.5 -right-1.5 z-10 opacity-0 group-hover/pill:opacity-100 bg-white shadow-md p-1 rounded-full transition-all duration-200 hover:scale-110"
                                >
                                    <Pencil size={10} className="text-neutral-700" />
                                </button>
                            )}
                        </div>
                    ))}

                    {isAdmin && (
                        <button
                            onClick={openAdd}
                            className={cn(
                                "text-base sm:text-lg px-4 py-1.5 rounded-full cursor-pointer flex items-center gap-1.5",
                                "border-2 border-dashed border-neutral-400 text-neutral-500",
                                "shadow-sm transition-all duration-200 ease-out transform hover:scale-105 hover:border-neutral-600 hover:text-neutral-700",
                                isVisible ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-4 scale-95"
                            )}
                        >
                            <Plus className="size-4" />
                            Add Genre
                        </button>
                    )}
                </div>

                <button
                    onClick={() => router.push("/inventory/genre")}
                    className={cn(
                        "mt-6 self-start flex items-center gap-2 text-sm font-medium text-neutral-600 hover:text-black transition-colors duration-200",
                        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                    )}
                >
                    View all genres
                    <ArrowRight className="size-4" />
                </button>
            </div>

            {/* Right: selected genre preview card */}
            <div className="w-full lg:w-[40%] h-[280px] sm:h-[360px] lg:h-full flex items-center justify-center py-0 lg:py-6">
                {selected ? (
                    <div
                        className={cn(
                            "relative p-6 rounded-3xl text-2xl h-full w-full overflow-hidden shadow-lg flex items-end",
                            "transition-all duration-1000 ease-out delay-800",
                            isVisible ? "opacity-100 translate-x-0 scale-100" : "opacity-0 translate-x-8 scale-95"
                        )}
                        style={{ backgroundColor: selected.bgColor }}
                    >
                        {selected.image && (
                            <Image src={selected.image} alt={selected.title} fill className="object-cover" unoptimized />
                        )}
                        <button
                            onClick={() => router.push(`/inventory/genre/${selected!.title.toLowerCase().replace(/\s+/g, "-")}`)}
                            className="absolute top-4 right-4 z-10 bg-black/60 text-white p-2 rounded-full hover:bg-black/80 hover:scale-105 transition-all"
                        >
                            <ArrowRight className="size-5" />
                        </button>
                        <span className="relative z-10 text-3xl sm:text-4xl font-semibold text-white drop-shadow-lg">{selected.title}</span>
                    </div>
                ) : (
                    <span className={cn("text-xl transition-all duration-1000 ease-out delay-800", isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8")}>
                        Select a Genre →
                    </span>
                )}
            </div>
        </div>
    );
}
