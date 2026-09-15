"use client";

import { PlaceholdersAndVanishInput } from "../../../Components/ui/placeholders-and-vanish-input";

export function SearchBar() {
  const placeholders = [
    "Create your home a happy space...",
    "Give your home a heavenly vibe...",
    "Space that inspire...",
    "CHOOSE THE LOOK THAT MATCHES YOUR VIBE",
    "Choose now",
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log(e.target.value);
  };
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("submitted");
  };
  return (
    <div className="flex flex-col justify-center  items-center px-4">
      <PlaceholdersAndVanishInput
        placeholders={placeholders}
        onChange={handleChange}
        onSubmit={onSubmit}
      />
    </div>
  );
}
