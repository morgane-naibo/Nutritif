"use client";

import { useState } from "react";
import Image from "next/image";

export default function Home() {
  const [searchValue, setSearchValue] = useState('');

  const handleSearchPartOne = () => {
    console.log("Recherche dans la partie 1 de la base :", searchValue);
    // Ajoutez ici votre logique pour interroger la première partie de la base de données
  };

  const handleSearchPartTwo = () => {
    console.log("Recherche dans la partie 2 de la base :", searchValue);
    // Ajoutez ici votre logique pour interroger la deuxième partie de la base de données
  };

  return (
    <div>
      {/* Bandeau en haut avec le logo centré */}
      <div className="w-full bg-white flex justify-center items-center py-14 px-12 relative">
        <div className="absolute left-0 right-0 flex justify-center">
          <Image
            src="/logo.svg"
            alt="Logo"
            width={100}
            height={100}
          />
        </div>
      </div>

      {/* Bandeau rouge avec la barre de recherche toujours visible */}
      <div className="flex items-center justify-center bg-red-600 py-4">
        {/* Barre de recherche */}
        <input
          id="search-bar"
          type="text"
          placeholder="Search..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          className="p-2 border border-black-300 rounded focus:bg-black focus:text-white"
        />

        {/* Boutons de recherche */}
        <button
          onClick={handleSearchPartOne}
          className="ml-2 bg-white text-black px-4 py-2 rounded hover:bg-gray-200 transition-colors"
        >
          Rechercher parmi les chefs
        </button>
        <button
          onClick={handleSearchPartTwo}
          className="ml-2 bg-white text-black px-4 py-2 rounded hover:bg-gray-200 transition-colors"
        >
          Rechercher parmi la cuisine
        </button>
      </div>
    </div>
  );
}
