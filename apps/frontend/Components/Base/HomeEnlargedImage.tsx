"use client";

import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import { motion, useAnimation } from "framer-motion";
import axios from "axios";
import { toast } from "sonner";
import EditPanel, { FieldInput, FieldLabel, FieldTextarea } from "@/Components/admin/EditPanel";
import ImageUploadInput from "@/Components/ui/ImageUploadInput";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import { GET_SITE_SECTION_URL, UPSERT_SITE_SECTION_URL } from "@/routes/routes";

type SectionData = {
    title: string;
    desc: string;
    rootImage: string;
    smallImages: string[];
};

const DEFAULTS: SectionData[] = [
    {
        title: "Wallpapers",
        desc: "Turn walls into works of art — our wallpapers bring texture, color, and personality to every room, making a bold statement without saying a word.",
        rootImage: "/images/home.png",
        smallImages: ["/col1.jpeg", "/col2.jpeg", "/col3.jpeg", "/col4.jpeg"],
    },
    {
        title: "Curtains",
        desc: "Frame your windows with elegance — our curtains blend style and function, adding warmth, privacy, and a touch of luxury to your space.",
        rootImage: "/images/curtains.png",
        smallImages: ["/col1.jpeg", "/col2.jpeg", "/col3.jpeg", "/col4.jpeg"],
    },
    {
        title: "Decor Items",
        desc: "Small details, big impact — our curated décor pieces add character, charm, and a signature style to every corner of your home.",
        rootImage: "/images/decor-items.png",
        smallImages: ["/col1.jpeg", "/col2.jpeg", "/col3.jpeg", "/col4.jpeg"],
    },
];

const KEYS = ["home-enlarged-0", "home-enlarged-1", "home-enlarged-2"];

export default function HomeEnlargedImage() {
    const [sections, setSections] = useState<SectionData[]>(DEFAULTS);
    const [selected, setSelected] = useState<number>(0);
    const containerRef = useRef<HTMLDivElement>(null);
    const controls = useAnimation();
    const { isAdmin, token } = useAdminCheck();

    const [panelOpen, setPanelOpen] = useState(false);
    const [saving, setSaving] = useState(false);

    // draft fields for whichever card is being edited
    const [dTitle, setDTitle] = useState("");
    const [dDesc, setDDesc] = useState("");
    const [dRootImage, setDRootImage] = useState("");
    const [dSmall, setDSmall] = useState(["", "", "", ""]);

    useEffect(() => {
        Promise.all(
            KEYS.map(key => axios.get(`${GET_SITE_SECTION_URL}?key=${key}`).catch(() => null))
        ).then(results => {
            setSections(prev =>
                prev.map((def, i) => {
                    const section = results[i]?.data?.section;
                    if (!section) return def;
                    return {
                        title: section.title || def.title,
                        desc: section.description || def.desc,
                        rootImage: section.rootImage || def.rootImage,
                        smallImages: section.images?.length === 4 ? section.images : def.smallImages,
                    };
                })
            );
        });
    }, []);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    controls.start("visible");
                    observer.disconnect();
                }
            },
            { threshold: 0.2 }
        );
        if (containerRef.current) observer.observe(containerRef.current);
    }, [controls]);

    const openPanel = (idx: number) => {
        const s = sections[idx];
        setDTitle(s.title);
        setDDesc(s.desc);
        setDRootImage(s.rootImage);
        setDSmall([...s.smallImages]);
        setPanelOpen(true);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await axios.post(
                UPSERT_SITE_SECTION_URL,
                { key: KEYS[selected], title: dTitle, description: dDesc, rootImage: dRootImage, images: dSmall },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setSections(prev =>
                prev.map((s, i) =>
                    i === selected
                        ? { title: dTitle, desc: dDesc, rootImage: dRootImage, smallImages: dSmall }
                        : s
                )
            );
            setPanelOpen(false);
            toast.success("Section updated!");
        } catch { toast.error("Save failed. Please try again."); }
        finally { setSaving(false); }
    };

    const boxVariants = {
        hidden: { x: 50, opacity: 0 },
        visible: (i: number) => ({
            x: 0, opacity: 1,
            transition: { duration: 0.5, delay: i * 0.1 },
        }),
    };

    return (
        <>
            {/* Global drawer — showTrigger=false because each card has its own pencil button */}
            {isAdmin && (
                <EditPanel
                    title={`Edit — ${sections[selected].title}`}
                    isOpen={panelOpen}
                    onOpen={() => {}}
                    onClose={() => setPanelOpen(false)}
                    onSave={handleSave}
                    saving={saving}
                    showTrigger={false}
                >
                    <div><FieldLabel>Title</FieldLabel><FieldInput value={dTitle} onChange={setDTitle} placeholder="Section title" /></div>
                    <div><FieldLabel>Description</FieldLabel><FieldTextarea value={dDesc} onChange={setDDesc} placeholder="Section description" rows={4} /></div>
                    <div><FieldLabel>Main Image</FieldLabel><ImageUploadInput value={dRootImage} onChange={setDRootImage} /></div>
                    <div>
                        <FieldLabel>Small Images (4)</FieldLabel>
                        <div className="grid grid-cols-2 gap-2 mt-1">
                            {dSmall.map((url, i) => (
                                <ImageUploadInput
                                    key={i}
                                    value={url}
                                    onChange={v => setDSmall(prev => { const n = [...prev]; n[i] = v; return n; })}
                                />
                            ))}
                        </div>
                    </div>
                </EditPanel>
            )}

            {/* Mobile: vertical stack of cards */}
            <div
                ref={containerRef}
                className="w-full px-4 sm:px-6 lg:px-10 overflow-hidden pt-5"
            >
                {/* Mobile layout: stacked cards */}
                <div className="flex flex-col gap-4 lg:hidden">
                    {sections.map((sec, index) => (
                        <motion.div
                            key={index}
                            custom={index}
                            initial="hidden"
                            animate={controls}
                            variants={boxVariants}
                            className="relative w-full rounded-xl overflow-hidden cursor-pointer shadow-lg"
                            style={{ height: selected === index ? "420px" : "180px" }}
                            onClick={() => { setSelected(index); setPanelOpen(false); }}
                        >
                            <Image
                                src={sec.rootImage}
                                alt={`home-image-${index}`}
                                fill
                                className="object-cover"
                                unoptimized
                                priority={index === 0}
                            />

                            {selected !== index && (
                                <div className="absolute inset-0 flex items-center justify-center z-10 bg-black/20">
                                    <div className="text-neutral-100 text-2xl font-medium tracking-widest">
                                        {sec.title}
                                    </div>
                                </div>
                            )}

                            {selected === index && (
                                <>
                                    {isAdmin && (
                                        <button
                                            onClick={e => { e.stopPropagation(); openPanel(index); }}
                                            title="Edit section"
                                            className="absolute top-3 right-3 z-50 bg-white/80 backdrop-blur-sm border border-neutral-200 text-neutral-600 hover:text-[#3D5A40] hover:border-[#6DA165] rounded-full p-2 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-110"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
                                            </svg>
                                        </button>
                                    )}
                                    <div className="absolute bottom-3 left-3 right-3 z-10">
                                        <div className="rounded-xl overflow-hidden bg-black/20 backdrop-blur-md shadow-sm p-4 flex flex-col gap-y-2">
                                            <div className="text-xl text-white font-medium">{sec.title}</div>
                                            <div className="text-sm text-neutral-100 tracking-wide line-clamp-3">{sec.desc}</div>
                                        </div>
                                    </div>
                                </>
                            )}
                        </motion.div>
                    ))}
                </div>

                {/* Desktop layout: original horizontal expand */}
                <div className="hidden lg:flex w-full h-[620px] gap-x-5">
                    {sections.map((sec, index) => {
                        const isSelected = selected === index;
                        return (
                            <motion.div
                                key={index}
                                custom={index}
                                initial="hidden"
                                animate={controls}
                                variants={boxVariants}
                                className={`relative h-full rounded-xl overflow-hidden cursor-pointer shadow-lg transition-all duration-500 ${
                                    isSelected ? "flex-[3]" : "flex-[1] flex items-center justify-center"
                                }`}
                                onClick={() => { setSelected(index); setPanelOpen(false); }}
                            >
                                <Image
                                    src={sec.rootImage}
                                    alt={`home-image-${index}`}
                                    fill
                                    className="object-cover"
                                    unoptimized
                                    priority={index === 0}
                                />

                                {!isSelected && (
                                    <div className="absolute inset-0 flex items-center justify-center z-10 select-none bg-black/20">
                                        <div
                                            className="text-neutral-100 text-4xl font-medium tracking-widest"
                                            style={{ transform: "rotate(-90deg)", transformOrigin: "center", whiteSpace: "nowrap" }}
                                        >
                                            {sec.title}
                                        </div>
                                    </div>
                                )}

                                {isSelected && (
                                    <>
                                        {/* Admin pencil — positioned inside the card */}
                                        {isAdmin && (
                                            <button
                                                onClick={e => { e.stopPropagation(); openPanel(index); }}
                                                title="Edit section"
                                                className="absolute top-3 right-3 z-50 bg-white/80 backdrop-blur-sm border border-neutral-200 text-neutral-600 hover:text-[#3D5A40] hover:border-[#6DA165] rounded-full p-2 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-110"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
                                                </svg>
                                            </button>
                                        )}

                                        <div className="absolute bottom-4 left-6 w-full max-w-3xl text-white z-10">
                                            <div className="h-[300px] rounded-2xl overflow-hidden flex bg-black/10 backdrop-blur-md shadow-sm">
                                                <div className="w-[40%] h-full p-5 flex flex-col justify-between">
                                                    <div className="flex justify-around gap-2">
                                                        {sec.smallImages.slice(0, 2).map((src, i) => (
                                                            <div key={i} className="h-32 w-32 border-3 border-transparent rounded-xl overflow-hidden relative">
                                                                <Image src={src} alt={`small-${i}`} fill className="object-cover" unoptimized />
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <div className="flex justify-around gap-2">
                                                        {sec.smallImages.slice(2, 4).map((src, i) => (
                                                            <div key={i} className="h-32 w-32 border-3 border-transparent rounded-xl overflow-hidden relative">
                                                                <Image src={src} alt={`small-${i + 2}`} fill className="object-cover" unoptimized />
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="w-[60%] h-full flex flex-col p-6 px-8 gap-y-4">
                                                    <div className="text-3xl">{sec.title}</div>
                                                    <div className="text-xl text-neutral-100 tracking-wide">{sec.desc}</div>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </>
    );
}
