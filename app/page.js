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

  const styles_result = {
    container: {
      display: 'flex', // Arrange items horizontally
      alignItems: 'flex-start', // Align items to the top
      marginBottom: '1rem', // Add spacing between items
    },
    image: {
      width: '100px', // Set the width of the image
      height: 'auto', // Maintain aspect ratio
      marginRight: '1rem', // Add space between the image and text
    },
    textContainer: {
      display: 'flex',
      flexDirection: 'column', // Stack text vertically
      justifyContent: 'space-between', // Evenly distribute the text
    },
    dishLabel: {
      margin: 0, // Remove default margin
      fontSize: '1.2rem', // Adjust font size
      fontWeight: 'bold', // Make the label bold
    },
    abstract: {
      margin: 0,
      fontSize: '1rem',
      width: '470px', // Set a fixed width for the box
      height: '45px', // Set a fixed height for the box
      overflow: 'hidden', // Hide overflow content
      textOverflow: 'ellipsis', // Display "..." for truncated text
      display: '-webkit-box', // Use a flexible box model
      WebkitBoxOrient: 'vertical', // Set orientation to vertical
      WebkitLineClamp: 3, // Limit to 3 lines (adjust as needed)
    },
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

      <div style={styles.resultsContainer}>
        {results.length > 0 ? (
          results.map((result, index) => (
            <div key={index} style={styles.resultItem}>
              {result.chefLabel ? (
                <div>
                  <h2>{result.chefLabel.value}</h2>
                  <p>{result.description.value}</p>
                </div>
              ) : result.dishLabel ? (
                <div>
                  <h2>{result.dishLabel.value}</h2>
                  <p>{result.abstract.value}</p>
                </div>
              ) : result.cuisineLabel ? (
                <div>
                  <h2>{result.cuisineLabel.value}</h2>
                  <p>{result.description.value}</p>
                </div>
              ) : (
                <div>
                  <p>Aucun résultat trouvé.</p>
                </div>
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

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#f7f7f7',
    textAlign: 'center',
  },
  title: {
    fontSize: '36px',
    fontWeight: 'bold',
    marginBottom: '20px',
    color: '#333',
  },
  searchForm: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchInput: {
    padding: '10px',
    fontSize: '16px',
    width: '300px',
    borderRadius: '5px',
    border: '1px solid #ccc',
    marginRight: '10px',
  },
  searchButton: {
    padding: '10px 20px',
    fontSize: '16px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
  resultsContainer: {
    marginTop: '20px',
    padding: '10px',
    backgroundColor: '#fff',
    borderRadius: '5px',
    width: '80%',
    maxWidth: '600px',
  },
  resultItem: {
    marginBottom: '15px',
  },
};

