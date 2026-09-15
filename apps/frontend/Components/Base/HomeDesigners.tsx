"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";
import EditPanel, { FieldInput, FieldLabel, FieldTextarea } from "@/Components/admin/EditPanel";
import ImageUploadInput from "@/Components/ui/ImageUploadInput";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import { GET_CREATORS_URL, UPSERT_CREATOR_URL } from "@/routes/routes";

type Designer = { id?: number; name: string; role: string; description: string; image: string };

const FALLBACK: Designer[] = [
    { name: "Nayan Suman", role: "Wallpaper Designer", description: "I specialize in giving people what they want and need, ensuring my designs align with their vision through creativity and art.", image: "/images/man.png" },
    { name: "Riya Kapoor", role: "Interior Stylist", description: "I craft immersive spaces that blend aesthetics with functionality, creating interiors that speak to your lifestyle.", image: "/images/decor-items.png" },
    { name: "Arjun Mehta", role: "3D Visualization Artist", description: "I bring imagination to life by designing realistic 3D models and concepts for modern and traditional interiors.", image: "/images/home.png" },
    { name: "Simran Sharma", role: "Textile & Fabric Designer", description: "I design unique fabric patterns and wallpapers that add personality and vibrance to every living space.", image: "/images/curtains.png" },
];

function Initials({ name }: { name: string }) {
    const letters = name.split(" ").map(w => w[0]).slice(0, 2).join("");
    return (
        <div className="absolute inset-0 flex items-center justify-center bg-neutral-200 rounded-3xl">
            <span className="text-5xl font-bold text-neutral-500">{letters}</span>
        </div>
    );
}

export default function HomeDesigners() {
    const router = useRouter();
    const [designers, setDesigners] = useState<Designer[]>(FALLBACK);
    const [currentIndex, setCurrentIndex] = useState(0);
    const { isAdmin, token } = useAdminCheck();

    const [panelOpen, setPanelOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [dName, setDName] = useState("");
    const [dRole, setDRole] = useState("");
    const [dDesc, setDDesc] = useState("");
    const [dImage, setDImage] = useState("");
    const [addError, setAddError] = useState("");

    useEffect(() => {
        axios.get(GET_CREATORS_URL).then(({ data }) => {
            if (data.creators && data.creators.length > 0) {
                setDesigners(data.creators.map((c: { id: number; name: string; about: string; image?: string }) => ({
                    id: c.id,
                    name: c.name,
                    role: "",
                    description: c.about,
                    image: c.image || "",
                })));
            }
        }).catch(() => {});
    }, []);

    const handlePrev = () => setCurrentIndex(prev => prev === 0 ? designers.length - 1 : prev - 1);
    const handleNext = () => setCurrentIndex(prev => prev === designers.length - 1 ? 0 : prev + 1);

    const handleAdd = async () => {
        if (!dName.trim() || !dRole.trim()) { setAddError("Name and role are required"); return; }
        setAddError("");
        setSaving(true);
        try {
            const { data } = await axios.post(
                UPSERT_CREATOR_URL,
                { name: dName.trim(), about: dRole.trim(), description: dDesc.trim(), image: dImage.trim() || undefined },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (data.success) {
                const c = data.creator;
                setDesigners(prev => [...prev, { id: c.id, name: c.name, role: "", description: c.about, image: c.image || "" }]);
                setDName(""); setDRole(""); setDDesc(""); setDImage("");
                setPanelOpen(false);
                toast.success(`${c.name} added as a creator!`);
            }
        } catch { toast.error("Failed to add creator."); }
        finally { setSaving(false); }
    };

    const current = designers[currentIndex] ?? designers[0];

    return (
        <div className="relative w-full max-w-7xl mt-20 sm:mt-32 lg:mt-50">
            {isAdmin && (
                <EditPanel
                    title="Add Creator"
                    isOpen={panelOpen}
                    onOpen={() => { setDName(""); setDRole(""); setDDesc(""); setDImage(""); setAddError(""); setPanelOpen(true); }}
                    onClose={() => setPanelOpen(false)}
                    onSave={handleAdd}
                    saving={saving}
                >
                    <div><FieldLabel>Name *</FieldLabel><FieldInput value={dName} onChange={v => { setDName(v); setAddError(""); }} placeholder="e.g. Priya Mehta" /></div>
                    <div><FieldLabel>Role / Tagline *</FieldLabel><FieldInput value={dRole} onChange={v => { setDRole(v); setAddError(""); }} placeholder="e.g. Interior Stylist" /></div>
                    <div><FieldLabel>About</FieldLabel><FieldTextarea value={dDesc} onChange={setDDesc} placeholder="Short bio..." rows={3} /></div>
                    <div><FieldLabel>Photo</FieldLabel><ImageUploadInput value={dImage} onChange={setDImage} /></div>
                    {addError && <p className="text-xs text-red-500">{addError}</p>}
                </EditPanel>
            )}

            {/* Header row */}
            <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <div className="text-4xl sm:text-5xl lg:text-6xl">Designers</div>
                    <div className="text-base sm:text-xl py-2 sm:py-3">Meet the ones that contribute in lighting up your spaces</div>
                </div>
                <button
                    onClick={() => router.push("/designers")}
                    className="self-start sm:self-auto flex items-center gap-2 bg-black text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-neutral-800 transition-colors mb-1"
                >
                    View all designers
                    <ChevronRight className="size-4" />
                </button>
            </div>

            {/* Card + info layout — stacks vertically on mobile */}
            <div className="w-full flex flex-col sm:flex-row h-auto sm:h-[350px] relative gap-y-6 sm:gap-y-0">
                {/* Card stack */}
                <div className="w-full sm:w-[50%] h-[260px] sm:h-full flex justify-start items-center relative">
                    {designers.map((designer, index) => {
                        const isActive = index === currentIndex;
                        const rotateValue = (index - currentIndex) * 4;
                        const zIndex = isActive ? 30 : 10 - Math.abs(index - currentIndex);
                        return (
                            <div
                                key={designer.id ?? designer.name}
                                className="absolute w-[260px] sm:w-[340px] lg:w-[450px] h-[220px] sm:h-[260px] lg:h-[300px] rounded-3xl transition-all duration-500"
                                style={{ transform: `rotate(${rotateValue}deg) translateX(${isActive ? "0" : "20px"})`, zIndex }}
                            >
                                <div className="relative p-6 rounded-3xl text-2xl h-full w-full overflow-hidden shadow-lg z-20">
                                    {designer.image ? (
                                        <Image src={designer.image} alt={designer.name} fill className="object-cover rounded-3xl" unoptimized />
                                    ) : (
                                        <Initials name={designer.name} />
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Info + nav buttons */}
                <div className="w-full sm:w-[50%] h-auto sm:h-full flex flex-col p-4 py-4 sm:py-10 gap-y-4 sm:gap-y-5 relative">
                    <div className="text-xl sm:text-2xl flex flex-col">
                        <span>{current.name}</span>
                        {current.role && <span className="text-[15px] text-neutral-800">{current.role}</span>}
                    </div>
                    <div className="text-base sm:text-[18px]">{current.description}</div>
                    <div className="flex justify-start gap-x-4 mt-2 sm:absolute sm:bottom-10 sm:left-4">
                        <button onClick={handlePrev} className="h-[40px] w-15 bg-neutral-950 text-neutral-100 rounded-md flex justify-center items-center hover:-translate-y-0.5 transition-all transform duration-200 shadow-sm">
                            <ChevronLeft />
                        </button>
                        <button onClick={handleNext} className="h-[40px] w-15 bg-neutral-950 text-neutral-100 rounded-md flex justify-center items-center hover:-translate-y-0.5 transition-all transform duration-200 shadow-sm">
                            <ChevronRight />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
