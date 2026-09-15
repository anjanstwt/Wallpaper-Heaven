"use client";

import React, { useEffect, useState } from "react";
import { Carousel, Card } from "@/Components/ui/apple-cards-carousel";


interface DummyContentProps {
  images: string[]
}

export function MediumSlider() {
  const cards = data.map((card, index) => (
    <Card key={card.src} card={card} index={index} layout={true} />
  ));

  return (
    <div className="w-full flex flex-col justify-start items-center gap-y-3 px-4 sm:px-6 mb-6">
      <div className="text-3xl sm:text-4xl md:text-5xl font-serif text-center font-bold text-neutral-800 dark:text-neutral-200">
        Proof of Work
      </div>
      <div className="text-sm sm:text-md md:text-xl font-serif text-center font-light tracking-wide text-gray-600 dark:text-neutral-300">
        Houses that trusted us
      </div>
      <Carousel items={cards} />
    </div>
  );
}


export default function DummyContent({ images }: DummyContentProps) {
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [transformOrigin, setTransformOrigin] = useState("center");
  const [isHovered, setIsHovered] = useState(false);

  // Set first image as default when images are loaded
  useEffect(() => {
    if (images && images.length > 0) {
      setActiveImage(images[0]);
    }
  }, [images]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setTransformOrigin(`${x}% ${y}%`);
  };

  return (
    <div className="bg-[#f5f5f7] p-2 md:p-10 rounded-3xl mb-4">
      {/* small images */}
      <div className="flex gap-x-3 sm:gap-x-6 flex-wrap">
        {images.map((src, index) => (
          <img
            key={index}
            src={src}
            alt={`thumbnail-${index}`}
            onClick={() => setActiveImage(src)}
            className={`h-14 w-14 sm:h-20 sm:w-20 object-cover rounded-md cursor-pointer hover:scale-105 transition-transform duration-200 ${
              activeImage === src ? "ring-2 ring-black" : ""
            }`}
          />
        ))}
        <div className="flex justify-center items-center text-sm sm:text-xl ml-2 sm:ml-4 font-medium text-gray-600">
          Click to view
        </div>
      </div>

      {/* zoomed-in */}
      <div className="w-full h-full flex justify-center items-center mt-6 sm:mt-8">
        <div
          onMouseMove={handleMouseMove}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => {
            setIsHovered(false);
            setTransformOrigin("center");
          }}
          className="flex justify-center items-center h-[260px] sm:h-[350px] md:h-[500px] w-full max-w-4xl bg-white rounded-md overflow-hidden transition-all duration-300"
        >
          {activeImage && (
            <img
              src={activeImage}
              alt="Zoomed view"
              className="h-full w-full object-cover rounded-md transition-transform duration-300"
              style={{
                transformOrigin: transformOrigin,
                transform: isHovered ? "scale(1.2)" : "scale(1)",
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}



const data = [
  {
    category: "Artificial Intelligence",
    title: "You can do more with AI.",
    src: "https://images.unsplash.com/photo-1593508512255-86ab42a8e620?q=80&w=3556&auto=format&fit=crop&ixlib=rb-4.0.3",
    content: <DummyContent images={[
      "https://images.unsplash.com/photo-1593508512255-86ab42a8e620?q=80",
      "https://images.unsplash.com/photo-1602081957921-9137a5d6eaee?q=80",
      "https://images.unsplash.com/photo-1511984804822-e16ba72f5848?q=80"
    ]} />,
  },
  {
    category: "Productivity",
    title: "Enhance your productivity.",
    src: "https://images.unsplash.com/photo-1531554694128-c4c6665f59c2?q=80&w=3387&auto=format&fit=crop&ixlib=rb-4.0.3",
    content: <DummyContent images={[
      "https://images.unsplash.com/photo-1531554694128-c4c6665f59c2?q=80",
      "https://images.unsplash.com/photo-1599202860130-f600f4948364?q=80",
      "https://images.unsplash.com/photo-1713869791518-a770879e60dc?q=80"
    ]} />,
  },
  {
    category: "Artificial Intelligence",
    title: "You can do more with AI.",
    src: "https://images.unsplash.com/photo-1593508512255-86ab42a8e620?q=80&w=3556&auto=format&fit=crop&ixlib=rb-4.0.3",
    content: <DummyContent images={[
      "https://images.unsplash.com/photo-1593508512255-86ab42a8e620?q=80",
      "https://images.unsplash.com/photo-1602081957921-9137a5d6eaee?q=80",
      "https://images.unsplash.com/photo-1511984804822-e16ba72f5848?q=80"
    ]} />,
  },
  {
    category: "Productivity",
    title: "Enhance your productivity.",
    src: "https://images.unsplash.com/photo-1531554694128-c4c6665f59c2?q=80&w=3387&auto=format&fit=crop&ixlib=rb-4.0.3",
    content: <DummyContent images={[
      "https://images.unsplash.com/photo-1531554694128-c4c6665f59c2?q=80",
      "https://images.unsplash.com/photo-1599202860130-f600f4948364?q=80",
      "https://images.unsplash.com/photo-1713869791518-a770879e60dc?q=80"
    ]} />,
  },
  {
    category: "Artificial Intelligence",
    title: "You can do more with AI.",
    src: "https://images.unsplash.com/photo-1593508512255-86ab42a8e620?q=80&w=3556&auto=format&fit=crop&ixlib=rb-4.0.3",
    content: <DummyContent images={[
      "https://images.unsplash.com/photo-1593508512255-86ab42a8e620?q=80",
      "https://images.unsplash.com/photo-1602081957921-9137a5d6eaee?q=80",
      "https://images.unsplash.com/photo-1511984804822-e16ba72f5848?q=80"
    ]} />,
  },
  {
    category: "Productivity",
    title: "Enhance your productivity.",
    src: "https://images.unsplash.com/photo-1531554694128-c4c6665f59c2?q=80&w=3387&auto=format&fit=crop&ixlib=rb-4.0.3",
    content: <DummyContent images={[
      "https://images.unsplash.com/photo-1531554694128-c4c6665f59c2?q=80",
      "https://images.unsplash.com/photo-1599202860130-f600f4948364?q=80",
      "https://images.unsplash.com/photo-1713869791518-a770879e60dc?q=80"
    ]} />,
  },
];
