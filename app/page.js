"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  generateSparqlQueryPlat,
  fetchSparqlResults,
  generateSparqlQueryChef,
  generateSparqlQueryCuisine,
} from "./requetes";
import "./styles/styles.css";

const YourComponent = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState([]);
  const [suggestions, setSuggestions] = useState({
    plats: [],
    chefs: [],
    cuisines: [],
  });
  const [searchType, setSearchType] = useState("plat");

  const handleSearchChange = async (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    if (value.length > 0) {
      const [plats, chefs, cuisines] = await Promise.all([
        fetchSparqlResults(generateSparqlQueryPlat(value)),
        fetchSparqlResults(generateSparqlQueryChef(value)),
        fetchSparqlResults(generateSparqlQueryCuisine(value)),
      ]);

      setSuggestions({
        plats: plats.slice(0, 5).map((result) => result.dishLabel?.value || ""),
        chefs: chefs.slice(0, 5).map((result) => result.chefLabel?.value || ""),
        cuisines: cuisines
          .slice(0, 5)
          .map((result) => result.cuisineLabel?.value || ""),
      });
    } else {
      setSuggestions({ plats: [], chefs: [], cuisines: [] });
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchQuery(suggestion);
    setSuggestions({ plats: [], chefs: [], cuisines: [] });
  };

  const handleSearchSubmit = async (e) => {
    e.preventDefault();

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
  };

  return (
    <div>
      <div className="w-full bg-white flex justify-center items-center py-14 px-12 relative">
        <div className="absolute left-0 right-0 flex justify-center">
          <Image src="/logo.svg" alt="Logo" width={100} height={100} />
        </div>
      </div>

      <div className="flex flex-col items-center bg-red-600 py-4">
        <form
          onSubmit={handleSearchSubmit}
          className="flex flex-col items-center sm:flex-row sm:space-x-2 w-full sm:justify-center px-4"
        >
          <input
            type="text"
            placeholder="Rechercher..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="searchInput"
          />

          <button
            type="submit"
            onClick={() => setSearchType("plat")}
            className="searchButton"
          >
            Rechercher un plat
          </button>
          <button
            type="submit"
            onClick={() => setSearchType("chef")}
            className="searchButton"
          >
            Rechercher un chef
          </button>
          <button
            type="submit"
            onClick={() => setSearchType("cuisine")}
            className="searchButton"
          >
            Rechercher une cuisine
          </button>
        </form>
      </div>

      <div className="results-container">
        {results.length > 0 ? (
          results.map((result, index) => (
            <div key={index} className="result-container">
              <img
                src={result.image?.value}
                alt={result.dishLabel?.value || result.chefLabel?.value || result.cuisineLabel?.value}
                className="result-image"
              />
              <div className="result-text-container">
                <h2 className="result-dish-label">
                  {result.dishLabel?.value || result.chefLabel?.value || result.cuisineLabel?.value}
                </h2>
                <p className="result-abstract">
                  {result.abstract?.value || result.description?.value || "Description indisponible"}
                </p>
              </div>
            </div>
          ))
        ) : (
          <p>Aucun résultat trouvé.</p>
        )}
      </div>
    </div>
  );
};

export default YourComponent;
