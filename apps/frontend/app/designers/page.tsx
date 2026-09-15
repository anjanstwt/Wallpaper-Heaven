"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Image from "next/image";
import { gsap } from "gsap";
import { Pencil, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";
import NavbarMain from "@/Components/Nav-Bar/NavbarMain";
import EditPanel, { FieldInput, FieldLabel, FieldTextarea } from "@/Components/admin/EditPanel";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import { handleUpload } from "@/lib/s3-uploads";
import { GET_CREATORS_URL, UPSERT_CREATOR_URL, REMOVE_CREATOR_URL } from "@/routes/routes";

type Designer = { id: number; name: string; about: string; description?: string; image?: string };
type PanelMode = "add" | "edit";

const DEMO_DESIGNERS: Designer[] = [
    { id: -1,  name: "Priya Mehta",       about: "Interior Stylist",            description: "Crafting immersive spaces that blend aesthetics with functionality.", image: "https://picsum.photos/seed/ds1/400/600" },
    { id: -2,  name: "Arjun Sharma",      about: "Wallpaper Illustrator",       description: "Hand-painting motifs inspired by Mughal architecture and geometry.",   image: "https://picsum.photos/seed/ds2/400/600" },
    { id: -3,  name: "Léa Fontaine",      about: "French Pattern Designer",     description: "Trained at the École Camondo; known for graphic botanical prints.",    image: "https://picsum.photos/seed/ds3/400/600" },
    { id: -4,  name: "Kenji Mori",        about: "Japanese Textile Artist",     description: "Fusing wabi-sabi philosophy with contemporary repeat patterns.",       image: "https://picsum.photos/seed/ds4/400/600" },
    { id: -5,  name: "Simran Kaur",       about: "Colour & Mood Specialist",    description: "10 years creating palettes that transform how rooms feel.",            image: "https://picsum.photos/seed/ds5/400/600" },
    { id: -6,  name: "Marcus Webb",       about: "3D Visualisation Artist",     description: "Bringing photorealistic wallpaper concepts to life before print.",     image: "https://picsum.photos/seed/ds6/400/600" },
    { id: -7,  name: "Amara Diallo",      about: "Surface & Texture Designer",  description: "West African weaving traditions translated into modern wallcoverings.", image: "https://picsum.photos/seed/ds7/400/600" },
    { id: -8,  name: "Sofia Reyes",       about: "Architect & Wall Artist",     description: "Architecture background shapes her love of grid and negative space.",   image: "https://picsum.photos/seed/ds8/400/600" },
    { id: -9,  name: "David Chen",        about: "Digital Muralist",            description: "Large-format digital murals for hospitality and residential spaces.",   image: "https://picsum.photos/seed/ds9/400/600" },
    { id: -10, name: "Nadia Petrov",      about: "Illustrative Print Maker",    description: "Ink drawings digitised into seamless repeat patterns.",                image: "https://picsum.photos/seed/ds10/400/600" },
    { id: -11, name: "Oliver Grant",      about: "Minimalist Art Director",     description: "Less is more — every line earns its place on the wall.",               image: "https://picsum.photos/seed/ds11/400/600" },
    { id: -12, name: "Yuki Tanaka",       about: "Nature & Watercolour Artist", description: "Loose watercolour botanicals with Japanese restraint.",                image: "https://picsum.photos/seed/ds12/400/600" },
    { id: -13, name: "Fatima Al-Rashid",  about: "Geometric Pattern Expert",    description: "Islamic geometric art reinterpreted for contemporary living spaces.",   image: "https://picsum.photos/seed/ds13/400/600" },
    { id: -14, name: "Ravi Nair",         about: "Heritage & Archive Reviver",  description: "Restoring 19th-century Indian textile patterns for modern walls.",     image: "https://picsum.photos/seed/ds14/400/600" },
    { id: -15, name: "Elena Rossi",       about: "Luxury Lifestyle Designer",   description: "Her collections are worn by the walls of five-star hotels in Milan.",  image: "https://picsum.photos/seed/ds15/400/600" },
    { id: -16, name: "Tom Ashford",       about: "Graphic & Pop Art Creator",   description: "Punchy, colour-saturated prints that make a statement.",               image: "https://picsum.photos/seed/ds16/400/600" },
];

function Initials({ name, large }: { name: string; large?: boolean }) {
    const letters = name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();
    return (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-neutral-200 to-neutral-300">
            <span className={`font-bold text-neutral-500 ${large ? "text-7xl" : "text-5xl"}`}>{letters}</span>
        </div>
    );
}

function DesignerCard({
    designer,
    isAdmin,
    onClick,
    onEdit,
    onDelete,
}: {
    designer: Designer;
    isAdmin: boolean;
    onClick: () => void;
    onEdit: (e: React.MouseEvent) => void;
    onDelete: (e: React.MouseEvent) => void;
}) {
    const cardRef = useRef<HTMLDivElement>(null);

    const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        const el = cardRef.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const dx = (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
        const dy = (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);
        el.style.transform = `perspective(900px) rotateY(${dx * 9}deg) rotateX(${-dy * 7}deg) scale(1.03)`;
        el.style.transition = "transform 0.1s ease";
    }, []);

    const handleMouseLeave = useCallback(() => {
        const el = cardRef.current;
        if (!el) return;
        el.style.transform = "";
        el.style.transition = "transform 0.6s cubic-bezier(0.23, 1, 0.32, 1)";
    }, []);

    return (
        <div
            className="designer-card group cursor-pointer"
            onClick={onClick}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            ref={cardRef}
        >
            <div className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-sm">
                {designer.image ? (
                    <Image
                        src={designer.image}
                        alt={designer.name}
                        fill
                        className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                        unoptimized
                    />
                ) : (
                    <Initials name={designer.name} />
                )}

                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" />

                {/* Bio slide-up */}
                <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out">
                    <div className="bg-white/90 backdrop-blur-sm rounded-xl p-3">
                        <p className="text-xs text-neutral-500 font-medium line-clamp-2">{designer.about}</p>
                    </div>
                </div>

                {/* Admin controls */}
                {isAdmin && (
                    <div className="absolute top-3 right-3 z-10 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <button
                            onClick={onEdit}
                            className="w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm hover:scale-110 transition-transform"
                        >
                            <Pencil className="w-3.5 h-3.5 text-neutral-700" />
                        </button>
                        <button
                            onClick={onDelete}
                            className="w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm hover:scale-110 transition-transform"
                        >
                            <Trash2 className="w-3.5 h-3.5 text-red-500" />
                        </button>
                    </div>
                )}
            </div>

            <div className="mt-4 px-1">
                <p className="font-semibold text-neutral-900 text-base leading-tight group-hover:text-black transition-colors">
                    {designer.name}
                </p>
                <p className="text-sm text-neutral-400 mt-0.5 line-clamp-1">{designer.about}</p>
            </div>
        </div>
    );
}

function SkeletonDesigner() {
    return (
        <div className="animate-pulse">
            <div className="aspect-[3/4] rounded-2xl bg-neutral-100" />
            <div className="mt-4 space-y-2 px-1">
                <div className="h-4 w-2/3 rounded-full bg-neutral-100" />
                <div className="h-3 w-1/2 rounded-full bg-neutral-100" />
            </div>
        </div>
    );
}

export default function DesignersPage() {
    const router = useRouter();
    const { isAdmin } = useAdminCheck();
    const gridRef = useRef<HTMLDivElement>(null);
    const headerRef = useRef<HTMLDivElement>(null);
    const imageFileRef = useRef<HTMLInputElement>(null);
    const [designers, setDesigners] = useState<Designer[]>(DEMO_DESIGNERS);
    const [loading, setLoading] = useState(true);

    // Panel
    const [panelOpen, setPanelOpen] = useState(false);
    const [panelMode, setPanelMode] = useState<PanelMode>("add");
    const [editingDesigner, setEditingDesigner] = useState<Designer | null>(null);
    const [dName, setDName] = useState("");
    const [dAbout, setDAbout] = useState("");
    const [dDesc, setDDesc] = useState("");
    const [dImage, setDImage] = useState("");
    const [saving, setSaving] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);

    useEffect(() => {
        axios.get(GET_CREATORS_URL)
            .then(({ data }) => {
                const result = data.creators ?? [];
                if (result.length > 0) setDesigners(result);
                else setDesigners(DEMO_DESIGNERS);
            })
            .catch(() => setDesigners(DEMO_DESIGNERS))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        if (headerRef.current) {
            gsap.fromTo(
                headerRef.current.children,
                { opacity: 0, y: 30 },
                { opacity: 1, y: 0, stagger: 0.15, duration: 0.7, ease: "power3.out" }
            );
        }
    }, []);

    useEffect(() => {
        if (loading || !gridRef.current) return;
        gsap.fromTo(
            gridRef.current.querySelectorAll(".designer-card"),
            { opacity: 0, y: 40 },
            { opacity: 1, y: 0, stagger: 0.08, duration: 0.6, ease: "power3.out" }
        );
    }, [designers, loading]);

    const openAdd = () => {
        setPanelMode("add");
        setEditingDesigner(null);
        setDName(""); setDAbout(""); setDDesc(""); setDImage("");
        setPanelOpen(true);
    };

    const openEdit = (e: React.MouseEvent, designer: Designer) => {
        e.stopPropagation();
        setPanelMode("edit");
        setEditingDesigner(designer);
        setDName(designer.name);
        setDAbout(designer.about);
        setDDesc(designer.description ?? "");
        setDImage(designer.image ?? "");
        setPanelOpen(true);
    };

    const onImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploadingImage(true);
        const url = await handleUpload(file);
        if (url) setDImage(url);
        else toast.error("Image upload failed.");
        setUploadingImage(false);
        e.target.value = "";
    };

    const handleSave = async () => {
        if (!dName.trim()) { toast.error("Name is required."); return; }
        setSaving(true);
        try {
            const payload: Record<string, unknown> = {
                name: dName.trim(),
                about: dAbout.trim(),
                description: dDesc.trim() || undefined,
                image: dImage || undefined,
            };
            if (panelMode === "edit" && editingDesigner) payload.id = editingDesigner.id;

            const { data } = await axios.post(UPSERT_CREATOR_URL, payload);

            if (data.success) {
                const creator: Designer = data.creator;
                if (panelMode === "add") {
                    setDesigners(prev => [...prev, creator]);
                    toast.success(`${creator.name} added!`);
                } else {
                    setDesigners(prev => prev.map(d => d.id === creator.id ? creator : d));
                    toast.success(`${creator.name} updated!`);
                }
                setPanelOpen(false);
            }
        } catch { toast.error("Failed to save designer."); }
        finally { setSaving(false); }
    };

    const handleDelete = (e: React.MouseEvent, designer: Designer) => {
        e.stopPropagation();
        toast(`Delete "${designer.name}"?`, {
            description: "This cannot be undone.",
            action: {
                label: "Delete",
                onClick: async () => {
                    try {
                        await axios.post(REMOVE_CREATOR_URL, { id: designer.id });
                        setDesigners(prev => prev.filter(d => d.id !== designer.id));
                        toast.success(`${designer.name} deleted.`);
                    } catch { toast.error("Failed to delete designer."); }
                },
            },
            cancel: { label: "Cancel", onClick: () => {} },
        });
    };

    return (
        <div className="min-h-screen" style={{ backgroundColor: "#FAF9F7" }}>
            <NavbarMain />

            {/* Admin panel */}
            {isAdmin && (
                <>
                    <EditPanel
                        title={panelMode === "add" ? "Add Designer" : `Edit: ${editingDesigner?.name}`}
                        isOpen={panelOpen}
                        onOpen={() => {}}
                        onClose={() => setPanelOpen(false)}
                        onSave={handleSave}
                        saving={saving}
                        showTrigger={false}
                    >
                        <div>
                            <FieldLabel>Name *</FieldLabel>
                            <FieldInput value={dName} onChange={setDName} placeholder="e.g. Priya Mehta" />
                        </div>
                        <div>
                            <FieldLabel>Role / Tagline</FieldLabel>
                            <FieldInput value={dAbout} onChange={setDAbout} placeholder="e.g. Interior Stylist" />
                        </div>
                        <div>
                            <FieldLabel>About</FieldLabel>
                            <FieldTextarea value={dDesc} onChange={setDDesc} placeholder="Short bio…" rows={3} />
                        </div>
                        <div>
                            <FieldLabel>Photo</FieldLabel>
                            <div
                                className="relative w-full h-36 rounded-xl overflow-hidden border-2 border-dashed border-neutral-200 cursor-pointer hover:border-[#6DA165] transition-colors"
                                onClick={() => imageFileRef.current?.click()}
                            >
                                {uploadingImage ? (
                                    <div className="absolute inset-0 flex items-center justify-center bg-neutral-50">
                                        <div className="w-6 h-6 border-2 border-neutral-400 border-t-transparent rounded-full animate-spin" />
                                    </div>
                                ) : dImage ? (
                                    <Image src={dImage} alt="preview" fill className="object-cover" unoptimized />
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

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-[88px] pb-24">
                {/* Header */}
                <div ref={headerRef} className="mb-12 sm:mb-16 pt-8">
                    <div className="flex items-start justify-between gap-4">
                        <div className="inline-flex items-center gap-2 bg-neutral-900 text-white px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest">
                            {loading ? "—" : `${designers.length} creator${designers.length !== 1 ? "s" : ""}`}
                        </div>
                        {isAdmin && (
                            <button
                                onClick={openAdd}
                                className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-neutral-800 transition-colors flex-shrink-0"
                            >
                                <Plus className="w-4 h-4" />
                                <span className="hidden sm:inline">Add Designer</span>
                                <span className="sm:hidden">Add</span>
                            </button>
                        )}
                    </div>
                    <h1 className="text-4xl sm:text-5xl lg:text-7xl xl:text-8xl font-semibold tracking-tight text-neutral-900 leading-none max-w-3xl mt-5">
                        Meet the{" "}
                        <span className="italic font-light">Makers</span>
                    </h1>
                    <p className="text-neutral-500 mt-4 text-base sm:text-lg font-light max-w-xl leading-relaxed">
                        The creative minds who turn walls into worlds. Every collection is a signature.
                    </p>
                    <div className="mt-8 w-24 h-0.5 bg-neutral-900 rounded-full" />
                </div>

                {/* Grid */}
                {loading ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-7">
                        {Array.from({ length: 8 }).map((_, i) => <SkeletonDesigner key={i} />)}
                    </div>
                ) : designers.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-32 text-center">
                        <div className="w-20 h-20 rounded-full bg-neutral-100 flex items-center justify-center text-3xl mb-6">✏️</div>
                        <p className="text-2xl font-semibold text-neutral-800">No designers yet</p>
                        <p className="text-neutral-400 mt-2">Designers appear here once added.</p>
                    </div>
                ) : (
                    <div ref={gridRef} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-7">
                        {designers.map(designer => (
                            <DesignerCard
                                key={designer.id}
                                designer={designer}
                                isAdmin={isAdmin}
                                onClick={() => router.push(`/designers/${designer.id}`)}
                                onEdit={(e) => openEdit(e, designer)}
                                onDelete={(e) => handleDelete(e, designer)}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
