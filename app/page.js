"use client";

import React, { useState } from 'react';
import Image from "next/image";
import { generateSparqlQueryPlat, fetchSparqlResults, generateSparqlQueryChef, generateSparqlQueryCuisine } from './requetes';

export default function Page() {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searchType, setSearchType] = useState('plat');

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
      // Par défaut, recherche d'un plat
      query = generateSparqlQueryPlat(searchQuery);
    }

    const data = await fetchSparqlResults(query);
    setResults(data);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
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

      {/* Bandeau rouge avec la zone de recherche */}
      <div className="bg-red-600 py-10 flex justify-center">
        <div className="bg-white w-full max-w-md p-4 rounded shadow-lg">
          <form onSubmit={handleSearchSubmit} className="flex flex-col">
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="p-2 border border-gray-300 rounded focus:bg-black focus:text-white w-full"
            />
            <div className="mt-4 flex flex-col sm:flex-row sm:space-x-2">
              <button
                type="submit"
                onClick={() => setSearchType('plat')}
                className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800 transition-colors mt-2 sm:mt-0"
              >
                Rechercher un plat
              </button>
              <button
                type="submit"
                onClick={() => setSearchType('chef')}
                className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800 transition-colors mt-2 sm:mt-0"
              >
                Rechercher un chef
              </button>
              <button
                type="submit"
                onClick={() => setSearchType('cuisine')}
                className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800 transition-colors mt-2 sm:mt-0"
              >
                Rechercher une cuisine
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Zone rouge occupant toute la page, avec le cadre blanc à l'intérieur */}
      <div className="bg-red-600 min-h-screen pt-10 flex flex-col items-center">
        <div className="bg-white p-4 rounded shadow-lg w-11/12 sm:w-2/3 lg:w-1/2">
          {results.length > 0 ? (
            <div>
              {results.map((result, index) => (
                <div
                  key={index}
                  className="border-b-8 border-red-600 last:border-none -mx-4 py-3"
                >
                  <div className="px-4">
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
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-700 text-center">Aucun résultat trouvé.</p>
          )}
        </div>
      </div>
    </div>
  );
}