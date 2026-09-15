"use client"
import CreatorCard from "@/Components/creatorCard/CreatorCard";
import { Router } from "lucide-react";
import { useRouter } from "next/navigation";

const people = [
  {
    id: 1,
    name: "John Doe",
    brand: "Software Engineer",
    image:
      "https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-4.0.3&auto=format&fit=crop&w=3387&q=80",
  },
  {
    id: 2,
    name: "Robert Johnson",
    brand: "Product Manager",
    image:
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60",
  },
  {
    id: 3,
    name: "Jane Smith",
    brand: "Data Scientist",
    image:
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60",
  },
  {
    id: 4,
    name: "Emily Davis",
    brand: "UX Designer",
    image:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60",
  },
  {
    id: 5,
    name: "Tyler Durden",
    brand: "Soap Developer",
    image:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=3540&q=80",
  },
  {
    id: 6,
    name: "Dora",
    brand: "The Explorer",
    image:
      "https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?ixlib=rb-4.0.3&auto=format&fit=crop&w=3534&q=80",
  },
];

export default function Creators() {

  const router = useRouter();

  return (
    <div className="w-full flex flex-col items-center gap-y-3 mt-12 sm:mt-20 mb-10 px-4 sm:px-6">
      <div className="text-3xl sm:text-4xl font-serif text-center font-bold text-[#000000]">
        Our Top Creators
      </div>
      <div className="text-sm sm:text-md font-serif sm:text-xl text-center font-light tracking-wide text-gray-600">
        The minds behind the masterpieces
      </div>
      <div
        onClick={() => router.push("/creator/1")}
        title="Click to view more"
        className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 sm:gap-6 mt-6 cursor-pointer"
      >
        {people.map((creator, i) => (
          <CreatorCard
            key={i}
            image={creator.image}
            name={creator.name}
            brand={creator.brand}
          />
        ))}
      </div>

    </div>
  );
}
