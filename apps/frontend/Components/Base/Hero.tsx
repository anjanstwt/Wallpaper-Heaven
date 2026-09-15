"use client";

import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import EditPanel, { FieldInput, FieldLabel, FieldTextarea } from "@/Components/admin/EditPanel";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import { GET_SITE_SECTION_URL, UPSERT_SITE_SECTION_URL } from "@/routes/routes";

const DEFAULT_BADGE = "Luxury you can live within";
const DEFAULT_TITLE = "Every home deserves\na masterpiece";
const DEFAULT_SUBTITLE = "Bring your interiors to life with designs that inspire,\nimpress, and elevate your space.";

export default function Hero() {
    const heroRef = useRef<HTMLDivElement | null>(null);
    const [isVisible, setIsVisible] = useState(false);
    const { isAdmin } = useAdminCheck();

    const [panelOpen, setPanelOpen] = useState(false);
    const [saving, setSaving] = useState(false);

    const [badge, setBadge] = useState(DEFAULT_BADGE);
    const [title, setTitle] = useState(DEFAULT_TITLE);
    const [subtitle, setSubtitle] = useState(DEFAULT_SUBTITLE);

    const [dBadge, setDBadge] = useState(DEFAULT_BADGE);
    const [dTitle, setDTitle] = useState(DEFAULT_TITLE);
    const [dSubtitle, setDSubtitle] = useState(DEFAULT_SUBTITLE);

    useEffect(() => {
        axios.get(`${GET_SITE_SECTION_URL}?key=home-hero`).then(({ data }) => {
            if (data.section) {
                if (data.section.badge) setBadge(data.section.badge);
                if (data.section.title) setTitle(data.section.title);
                if (data.section.subtitle) setSubtitle(data.section.subtitle);
            }
        }).catch(() => {});
    }, []);

    useEffect(() => {
        if (panelOpen) { setDBadge(badge); setDTitle(title); setDSubtitle(subtitle); }
    }, [panelOpen]);

    const handleSave = async () => {
        setSaving(true);
        try {
            await axios.post(
                UPSERT_SITE_SECTION_URL,
                { key: "home-hero", badge: dBadge, title: dTitle, subtitle: dSubtitle }
            );
            setBadge(dBadge); setTitle(dTitle); setSubtitle(dSubtitle);
            setPanelOpen(false);
            toast.success("Hero section updated!");
        } catch { toast.error("Save failed. Please try again."); }
        finally { setSaving(false); }
    };

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) setIsVisible(true); },
            { threshold: 0.1 }
        );
        if (heroRef.current) observer.observe(heroRef.current);
        setIsVisible(true);
        return () => { if (heroRef.current) observer.unobserve(heroRef.current); };
    }, []);

    return (
        <div className="relative w-full">
            {isAdmin && (
                <EditPanel
                    title="Edit Hero"
                    isOpen={panelOpen}
                    onOpen={() => setPanelOpen(true)}
                    onClose={() => setPanelOpen(false)}
                    onSave={handleSave}
                    saving={saving}
                >
                    <div>
                        <FieldLabel>Badge</FieldLabel>
                        <FieldInput value={dBadge} onChange={setDBadge} placeholder={DEFAULT_BADGE} />
                    </div>
                    <div>
                        <FieldLabel>Heading</FieldLabel>
                        <FieldTextarea value={dTitle} onChange={setDTitle} placeholder="Enter heading (press Enter for new line)" rows={3} />
                    </div>
                    <div>
                        <FieldLabel>Subtitle</FieldLabel>
                        <FieldTextarea value={dSubtitle} onChange={setDSubtitle} placeholder="Enter subtitle (press Enter for new line)" rows={3} />
                    </div>
                </EditPanel>
            )}

            <div
                ref={heroRef}
                className={`w-full h-full flex flex-col px-4 sm:px-6 lg:px-8 py-2 items-center gap-y-4 transition-all duration-1000 ease-in-out ${
                    isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
                }`}
            >
                <span className="border border-black px-3 py-1 rounded-full text-sm bg-white/20 backdrop-blur-3xl transition-all duration-1000">
                    {badge}
                </span>
                <div className="w-full flex flex-col items-center text-4xl sm:text-5xl lg:text-7xl xl:text-[70px] font-semibold leading-tight sm:leading-snug lg:leading-18 text-center transition-all duration-1000">
                    {title.split("\n").map((line, i) => <span key={i}>{line}</span>)}
                </div>
                <div className="w-full flex flex-col items-center text-sm sm:text-base lg:text-lg text-center transition-all duration-1000">
                    {subtitle.split("\n").map((line, i) => <span key={i}>{line}</span>)}
                </div>
            </div>
        </div>
    );
}
