"use client";

import React, { useRef, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";

interface Brand {
    id: string;
    name: string;
    logo: string;
    description: string;
    slug: string;
}

interface BrandsProps {
    brands?: Brand[];
    className?: string;
}

const mockBrands: Brand[] = [
    {
        id: "1",
        name: "Prestigious",
        logo: "col5.jpeg",
        description: "Luxury wallpapers with timeless elegance",
        slug: "prestigious-textiles",
    },
    {
        id: "2",
        name: "Cole",
        logo: "col2.jpeg",
        description: "Heritage designs meet contemporary style",
        slug: "cole-and-son",
    },
    {
        id: "3",
        name: "Farrow & Ball",
        logo: "col3.jpeg",
        description: "Handcrafted with the finest ingredients",
        slug: "farrow-and-ball",
    },
    {
        id: "4",
        name: "Morris & Co",
        logo: "col5.jpeg",
        description: "Victorian artistry for modern homes",
        slug: "morris-and-co",
    },
    {
        id: "5",
        name: "Sanderson",
        logo: "col2.jpeg",
        description: "British design heritage since 1860",
        slug: "sanderson",
    },
    {
        id: "6",
        name: "col2.jpeg",
        logo: "/api/placeholder/200/120",
        description: "American luxury and sophistication",
        slug: "ralph-lauren",
    },
    {
        id: "7",
        name: "Designers Guild",
        logo: "col3.jpeg",
        description: "Contemporary patterns and bold colors",
        slug: "designers-guild",
    },
    {
        id: "8",
        name: "Zoffany",
        logo: "/api/placeholder/200/120",
        description: "Sophisticated designs with global inspiration",
        slug: "zoffany",
    },
];

// Brand Card Component
const BrandCard: React.FC<{ brand: Brand }> = ({ brand }) => {
    return (
        <Link
            href={`/inventory/${brand.slug}`}
            className="group relative flex-shrink-0 w-[130px] h-[180px] sm:w-[160px] sm:h-[220px] bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-500 overflow-hidden border border-gray-100"
        >

            {/* Image area */}
            <div className="relative w-full h-full bg-gray-100 flex items-center justify-center">
                <img
                    src={brand.logo}
                    alt={brand.name}
                    className="object-cover"
                />

                {/* Brand Name Hover Overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition duration-300 z-10"></div>

                <div className="absolute bottom-4 left-1/2 text-center transform -translate-x-1/2 bg-black border px-2 py-0.5 rounded-2xl border-neutral-800 text-white font-semibold text-base transition-all duration-500 ease-in-out group-hover:scale-125 group-hover:bottom-1/2 group-hover:translate-y-1/2 group-hover:-translate-x-1/2 group-hover:text-xl group-hover:tracking-wide">
                    {brand.name}
                </div>
            </div>
        </Link>
    );
};


const Brands: React.FC<BrandsProps> = ({ brands = mockBrands, className = "" }) => {
    const scrollRef = useRef<HTMLDivElement>(null);

    const scroll = (direction: "left" | "right") => {
        if (scrollRef.current) {
            const { scrollLeft, clientWidth } = scrollRef.current;
            const scrollAmount = clientWidth * 0.8;
            scrollRef.current.scrollTo({
                left: direction === "left" ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
                behavior: "smooth",
            });
        }
    };

    return (
        <section className={`w-full flex flex-col ${className}`}>
            <div className="px-4 sm:px-6 py-8 sm:py-10">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-center font-serif">Brands</h1>
                <p className="text-center text-gray-600 mb-8 font-serif text-base sm:text-[20px] px-2">Discover designs from the most prestigious design houses</p>

                <div className="relative w-full">
                    <div
                        ref={scrollRef}
                        className="flex gap-4 sm:gap-6 overflow-x-auto scrollbar-hide scroll-smooth px-2 sm:px-4 pb-4"
                    >

                        <style jsx>{`
              div::-webkit-scrollbar {
                display: none;
              }
            `}</style>

                        {brands.map((brand) => (
                            <BrandCard key={brand.id} brand={brand} />
                        ))}
                    </div>

                    {/* Arrow Controls Below */}
                    <div className="flex justify-center gap-4 sm:gap-6 mt-6">
                        <button
                            onClick={() => scroll("left")}
                            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
                        >
                            <ChevronLeft />
                        </button>
                        <button
                            onClick={() => scroll("right")}
                            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
                        >
                            <ChevronRight />
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Brands;
