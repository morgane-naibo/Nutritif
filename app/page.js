"use client";

import React, { useState } from 'react';
import Image from "next/image";
import { generateSparqlQueryPlat, fetchSparqlResults, generateSparqlQueryChef, generateSparqlQueryCuisine } from './requetes';

export default function Page() {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searchType, setSearchType] = useState('plat'); // par défaut "plat"

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchSubmit = async (e) => {
    e.preventDefault();

    let query;
    if (searchType === 'chef') {
      query = generateSparqlQueryChef(searchQuery);
    } else if (searchType === 'cuisine') {
      query = generateSparqlQueryCuisine(searchQuery);
    } else {
      // Par défaut, on considère la recherche de plat
      query = generateSparqlQueryPlat(searchQuery);
    }

    const data = await fetchSparqlResults(query);
    setResults(data);
  };

  return (
    <div>
      {/* Bandeau blanc avec le logo centré */}
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

      {/* Bandeau rouge avec la barre de recherche */}
      <div className="flex flex-col items-center bg-red-600 py-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col items-center sm:flex-row sm:space-x-2 w-full sm:justify-center px-4">
          <input
            type="text"
            placeholder="Rechercher..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="p-2 border border-gray-300 rounded focus:bg-black focus:text-white w-full sm:w-64"
          />
          <button
            type="submit"
            onClick={() => setSearchType('plat')}
            className="mt-2 sm:mt-0 bg-white text-black px-4 py-2 rounded hover:bg-gray-200 transition-colors"
          >
            Rechercher un plat
          </button>
          <button
            type="submit"
            onClick={() => setSearchType('chef')}
            className="mt-2 sm:mt-0 bg-white text-black px-4 py-2 rounded hover:bg-gray-200 transition-colors"
          >
            Rechercher un chef
          </button>
          <button
            type="submit"
            onClick={() => setSearchType('cuisine')}
            className="mt-2 sm:mt-0 bg-white text-black px-4 py-2 rounded hover:bg-gray-200 transition-colors"
          >
            Rechercher une cuisine
          </button>
        </form>

        {/* Conteneur des résultats */}
        <div className="mt-4 bg-white p-4 rounded w-11/12 sm:w-2/3 lg:w-1/2">
          {results.length > 0 ? (
            results.map((result, index) => (
              <div key={index} className="mb-4 border-b pb-2">
                {result.chefLabel ? (
                  <div>
                    <h2 className="font-bold">{result.chefLabel.value}</h2>
                    <p>{result.description?.value}</p>
                  </div>
                ) : result.dishLabel ? (
                  <div>
                    <h2 className="font-bold">{result.dishLabel.value}</h2>
                    <p>{result.abstract?.value}</p>
                  </div>
                ) : result.cuisineLabel ? (
                  <div>
                    <h2 className="font-bold">{result.cuisineLabel.value}</h2>
                    <p>{result.description?.value}</p>
                  </div>
                ) : (
                  <p>Aucun résultat trouvé.</p>
                )}
              </div>
            ))
          ) : (
            <p>Aucun résultat trouvé.</p>
          )}
        </div>
      </div>
    </div>
  );
}
