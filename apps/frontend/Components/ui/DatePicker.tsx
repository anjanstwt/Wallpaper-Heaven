// components/DatePicker.tsx
"use client";

import { useState, useRef, useEffect } from "react";

export default function DatePicker({
    date,
    onChange,
}: {
    date: Date | null;
    onChange: (date: Date) => void;
}) {
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    const month = date?.getMonth() ?? new Date().getMonth();
    const year = date?.getFullYear() ?? new Date().getFullYear();

    const getDaysInMonth = (m: number, y: number) => new Date(y, m + 1, 0).getDate();
    const getFirstDayOfMonth = (m: number, y: number) => new Date(y, m, 1).getDay();

    const handleOutsideClick = (e: MouseEvent) => {
        if (ref.current && !ref.current.contains(e.target as Node)) {
            setIsOpen(false);
        }
    };

    useEffect(() => {
        if (isOpen) document.addEventListener("mousedown", handleOutsideClick);
        return () => document.removeEventListener("mousedown", handleOutsideClick);
    }, [isOpen]);

    const daysInMonth = getDaysInMonth(month, year);
    const firstDay = getFirstDayOfMonth(month, year);
    const days = Array.from({ length: firstDay + daysInMonth }, (_, i) =>
        i < firstDay ? null : i - firstDay + 1
    );

    const handleDateClick = (day: number) => {
        onChange(new Date(year, month, day));
        setIsOpen(false);
    };

    const formatDate = (date: Date) =>
        date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });

    return (
        <div className="relative w-full" ref={ref}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="border px-3 py-2 rounded-md bg-white text-left w-full text-sm"
            >
                {date ? formatDate(date) : "Select a date"}
            </button>

            {isOpen && (
                <div className="absolute z-10 mt-1 bg-white border shadow-md p-3 rounded-md w-full">
                    <div className="grid grid-cols-7 text-center text-xs text-gray-500 mb-1">
                        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
                            <div key={d}>{d}</div>
                        ))}
                    </div>
                    <div className="grid grid-cols-7 gap-1 text-sm">
                        {days.map((day, i) =>
                            day ? (
                                <button
                                    key={i}
                                    onClick={() => handleDateClick(day)}
                                    className={`py-1 rounded hover:bg-gray-200 ${date?.getDate() === day ? "bg-black text-white" : ""
                                        }`}
                                >
                                    {day}
                                </button>
                            ) : (
                                <div key={i}></div>
                            )
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
