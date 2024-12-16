"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import {
  generateSparqlQueryPlat,
  fetchSparqlResults,
  generateSparqlQueryChef,
  generateSparqlQueryCuisine,
  cleanDbpediaResource,
} from "./requetes";
import "./styles/styles.css";
import Link from "next/link";

const YourComponent = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [suggestions, setSuggestions] = useState({
    plats: [],
    chefs: [],
    cuisines: [],
  });
  const [searchType, setSearchType] = useState("plat");
  const suggestionsRef = useRef(null);

  const staticSuggestions = [
    {
      name: "Cuisine Mexicaine",
      type: "cuisine",
      description:
        "La cuisine mexicaine est connue pour sa diversité et son héritage préhispanique.",
      image: "/image/mexique.png",
    },
    {
      name: "Cuisine Canadienne",
      type: "cuisine",
      description:
        "La cuisine canadienne est célèbre pour ses techniques raffinées et sa diversité régionale.",
      image: "/image/canada.png",
    },
    {
      name: "Pain d'épices",
      type: "plat",
      description:
        "Le pain d'épices est un gâteau traditionnel aux épices et au miel.",
      image: "/image/pain.png",
    },
  ];
  // Fonction pour gérer le changement dans le champ de recherche
  const handleSearchChange = async (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    if (value.length > 2) {
      // Lancer des requêtes pour les plats, chefs et cuisines
      const [plats, chefs, cuisines] = await Promise.all([
        fetchSparqlResults(generateSparqlQueryPlat(value)),
        fetchSparqlResults(generateSparqlQueryChef(value)),
        fetchSparqlResults(generateSparqlQueryCuisine(value)),
      ]);

      // Mettre à jour les suggestions classées par catégorie
      setSuggestions({
        plats: plats.slice(0, 5).map((result) => result.dishLabel?.value || ""),
        chefs: chefs.slice(0, 5).map((result) => result.chefLabel?.value || ""),
        cuisines: cuisines
          .slice(0, 5)
          .map((result) => result.cuisineLabel?.value || ""),
      });
    } else {
      // Réinitialiser les suggestions si la saisie est trop courte
      setSuggestions({ plats: [], chefs: [], cuisines: [] });
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchQuery(suggestion);
    setSuggestions({ plats: [], chefs: [], cuisines: [] });
  };

  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    setHasSearched(true); 

    let query;
    if (searchType === "chef") {
      query = generateSparqlQueryChef(searchQuery);
    } else if (searchType === "cuisine") {
      query = generateSparqlQueryCuisine(searchQuery);
    } else {
      query = generateSparqlQueryPlat(searchQuery);
    }

    const data = await fetchSparqlResults(query);
    setResults(data);
    console.log(data);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
        setSuggestions({ plats: [], chefs: [], cuisines: [] });
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-red-600">
    
      <div className="w-full bg-white flex justify-center items-center py-14 px-12 relative">
        <div className="absolute left-0 right-0 flex justify-center">
          <Image src="/logo.svg" alt="Logo" width={100} height={100} />
        </div>
      </div>

      
      <div className="bg-red-600 py-10 flex justify-center relative">
        <div className="bg-white w-full max-w-4xl p-4 rounded shadow-lg">
          <form onSubmit={handleSearchSubmit} className="flex items-center">
            <div className="relative flex-grow">
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="p-3 border border-gray-300 rounded focus:bg-black focus:text-white w-full"
              />
            
              {suggestions.plats.length > 0 || suggestions.chefs.length > 0 || suggestions.cuisines.length > 0 ? (
                <div
                  ref={suggestionsRef}
                  className="absolute top-full left-0 right-0 bg-white shadow-lg rounded mt-2 z-10 border border-gray-300"
                >
                  {suggestions.plats.length > 0 && (
                    <div className="suggestion-category">
                      <h3 className="font-bold text-lg p-2">Plats</h3>
                      <ul>
                        {suggestions.plats.map((suggestion, index) => (
                          <li
                            key={index}
                            onClick={() => handleSuggestionClick(suggestion)}
                            className="cursor-pointer hover:bg-gray-200 p-2"
                          >
                            {suggestion}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {suggestions.chefs.length > 0 && (
                    <div className="suggestion-category">
                      <h3 className="font-bold text-lg p-2">Chefs</h3>
                      <ul>
                        {suggestions.chefs.map((suggestion, index) => (
                          <li
                            key={index}
                            onClick={() => handleSuggestionClick(suggestion)}
                            className="cursor-pointer hover:bg-gray-200 p-2"
                          >
                            {suggestion}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {suggestions.cuisines.length > 0 && (
                    <div className="suggestion-category">
                      <h3 className="font-bold text-lg p-2">Cuisines</h3>
                      <ul>
                        {suggestions.cuisines.map((suggestion, index) => (
                          <li
                            key={index}
                            onClick={() => handleSuggestionClick(suggestion)}
                            className="cursor-pointer hover:bg-gray-200 p-2"
                          >
                            {suggestion}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : null}
            </div>
            <div className="ml-4 flex flex-col sm:flex-row sm:space-x-2">
              <button
                type="submit"
                onClick={() => setSearchType("plat")}
                className="bg-black text-white px-2 py-3 rounded hover:bg-gray-800 transition-colors mt-2 sm:mt-0"
              >
                Rechercher un plat
              </button>
              <button
                type="submit"
                onClick={() => setSearchType("chef")}
                className="bg-black text-white px-2 py-3 rounded hover:bg-gray-800 transition-colors mt-2 sm:mt-0"
              >
                Rechercher un chef
              </button>
              <button
                type="submit"
                onClick={() => setSearchType("cuisine")}
                className="bg-black text-white px-2 py-3 rounded hover:bg-gray-800 transition-colors mt-2 sm:mt-0"
              >
                Rechercher une cuisine
              </button>
            </div>
          </form>
        </div>
      </div>

{/* Suggestions statiques */}
{!hasSearched && (
  <div className="bg-red-600 py-10 flex flex-col items-center">
    <h2 className="text-white text-2xl font-bold mb-5">Nos suggestions</h2>
    <div className="space-y-4 w-11/12 sm:w-2/3 lg:w-1/2">
      {staticSuggestions.map((suggestion, index) => (
        <Link
          key={index}
          href={`/profil/${encodeURIComponent(suggestion.name)}?type=${suggestion.type}`}
          className="flex items-center bg-white p-4 rounded shadow-lg hover:bg-gray-200"
        >
          <Image
            src={suggestion.image || "/images/default.png"}
            alt={suggestion.name}
            width={128} // 32 * 4 = 128px
            height={128} // 32 * 4 = 128px
            className="object-cover rounded mr-4"
            onError={(e) => {
              e.target.src = "/images/default.png";
            }}
          />
          <div>
            <h3 className="text-xl font-bold">{suggestion.name}</h3>
            <p className="text-gray-600 mt-2">{suggestion.description}</p>
          </div>
        </Link>
      ))}
    </div>
  </div>
)}

     
      <div className="bg-red-600 min-h-screen pt-10 flex flex-col items-center">
  {/* Container des résultats */}
  {results.length > 0 && (
    <div className="results-container bg-white p-4 rounded shadow-lg w-11/12 sm:w-2/3 lg:w-1/2">
      {results.map((result, index) => (
        <div key={index} className="result-container border-b-8 border-red-600 last:border-none -mx-4 py-3">
          <Link
            href={`/profil/${encodeURIComponent(
              result.dishLabel?.value || result.chefLabel?.value || result.cuisineLabel?.value
            )}?type=${result.dishLabel ? 'plat' : result.chefLabel ? 'chef' : 'cuisine'}`}
            className="flex flex-col sm:flex-row items-start"
          >
            {result.image?.value && (
              <img
                src={result.image?.value}
                alt={
                  result.dishLabel?.value ||
                  result.chefLabel?.value ||
                  result.cuisineLabel?.value
                }
                className="result-image w-full sm:w-40 h-auto rounded"
              />
            )}
            <div className="result-text-container sm:ml-4 mt-4 sm:mt-0">
              <h2 className="result-dish-label text-xl font-bold text-gray-800">
                {result.dishLabel?.value || result.chefLabel?.value || result.cuisineLabel?.value}
              </h2>
              <p className="result-abstract text-gray-600 mt-2">
                {result.abstract?.value || result.description?.value || "Description indisponible"}
              </p>
            </div>
          </Link>
        </div>
      ))}
    </div>
  )}

  {/* Container pour "Aucun résultat trouvé" */}
  {hasSearched && results.length === 0 && (
    <div className="no-results-container bg-white p-4 rounded shadow-lg mt-4">
      <p className="text-gray-600 font-bold">Aucun résultat trouvé.</p>
    </div>
  )}
</div>

    </div>
  );
};

export default YourComponent;
