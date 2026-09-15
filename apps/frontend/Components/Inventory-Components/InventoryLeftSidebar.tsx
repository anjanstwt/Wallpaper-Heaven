"use client";

import { Circle } from "lucide-react";
import { useState } from "react";

export default function LeftSidebar() {
    const [active, setActive] = useState<string | null>(null);

    const products = ["Wallpaper", "Paintings", "Murals"];
    const designs = ["Modern", "Classic", "Tropical"];

    return (
        <div className="hidden lg:flex lg:fixed top-[5rem] left-0 w-full sm:w-[40%] md:w-[25%] lg:w-[15%] h-auto lg:h-[370px] border-t border-b border-neutral-400 p-2 px-4 lg:px-7 flex-col gap-y-8">

            <div className="w-full">
                <span className="w-full h-10 flex justify-center items-center bg-[#8CCCDC] shadow-sm rounded-xl text-neutral-900 mb-3 py-1 tracking-wide text-[18px] hover:-translate-y-0.5 transition-all transform duration-200">Filters</span>

                <span className="block text-[18px] tracking-wider mb-2 uppercase">Products</span>

                <div className="flex flex-col gap-y-3">
                    {products.map((item) => (
                        <div
                            key={item}
                            className="flex items-center gap-x-2 cursor-pointer"
                            onClick={() => setActive(item)}
                        >
                            {active === item ? (
                                <span className="w-5 h-5 rounded-full border-2 border-[#a48bb4] flex items-center justify-center">
                                    <span className="w-3 h-3 rounded-full bg-[#a48bb4]" />
                                </span>
                            ) : (
                                <Circle className="size-5 text-neutral-600" strokeWidth={1.5} />
                            )}
                            <span
                                className={`${active === item ? "font-medium text-black" : "text-neutral-700"
                                    }`}
                            >
                                {item}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="w-full">
                <span className="block text-[18px] tracking-wider mb-2 uppercase">
                    Designs
                </span>

                <div className="flex flex-col gap-y-2">
                    {designs.map((item) => (
                        <div
                            key={item}
                            className="flex items-center gap-x-2 cursor-pointer"
                            onClick={() => setActive(item)}
                        >
                            {active === item ? (
                                <span className="w-5 h-5 rounded-full border-2 border-[#a48bb4] flex items-center justify-center">
                                    <span className="w-3 h-3 rounded-full bg-[#a48bb4]" />
                                </span>
                            ) : (
                                <Circle className="size-5 text-neutral-600" strokeWidth={1.5} />
                            )}
                            <span
                                className={`${active === item ? "font-medium text-black" : "text-neutral-700"
                                    }`}
                            >
                                {item}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
