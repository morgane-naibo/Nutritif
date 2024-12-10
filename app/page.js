"use client";

import React, { useState } from 'react';
import Image from "next/image";
import { generateSparqlQueryPlat, fetchSparqlResults, generateSparqlQueryChef, generateSparqlQueryCuisine } from './requetes';

const YourComponent = () => {
  const [searchQuery, setSearchQuery] = useState('');  // État pour stocker la recherche
  const [results, setResults] = useState([]);  // État pour stocker les résultats de la requête SPARQL
  const [suggestions, setSuggestions] = useState({ plats: [], chefs: [], cuisines: [] });
  const [searchType, setSearchType] = useState('plat'); // par défaut "plat"

  // Fonction pour gérer le changement dans le champ de recherche
  const handleSearchChange = async(e) => {
    const value = e.target.value;
    setSearchQuery(value);
    if (value.length > 0) {
      // Lancer des requêtes pour les plats, chefs et cuisines
      const [plats, chefs, cuisines] = await Promise.all([
        fetchSparqlResults(generateSparqlQueryPlat(value)),
        fetchSparqlResults(generateSparqlQueryChef(value)),
        fetchSparqlResults(generateSparqlQueryCuisine(value)),
      ]);

      // Mettre à jour les suggestions classées par catégorie
      setSuggestions({
        plats: plats.slice(0, 5).map((result) => result.dishLabel?.value || ''),
        chefs: chefs.slice(0, 5).map((result) => result.chefLabel?.value || ''),
        cuisines: cuisines.slice(0, 5).map((result) => result.cuisineLabel?.value || ''),
      });
    } else {
      // Réinitialiser les suggestions si la saisie est trop courte
      setSuggestions({ plats: [], chefs: [], cuisines: [] });
    }
  };

  const handleSuggestionClick= (suggestion) =>{
    setSearchQuery(suggestion);
    setSuggestions({plats : [], chefs : [], cuisines : []});
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
    suggestionsList: {
      position: 'absolute',
      top: '40px',
      left: '0',
      width: '100%',
      backgroundColor: 'white',
      border: '1px solid #ccc',
      borderRadius: '5px',
      zIndex: 1000,
      listStyle: 'none',
      padding: '0',
      margin: '0',
      maxHeight: '150px',
      overflowY: 'auto',
    },
    suggestionItem: {
      padding: '10px',
      cursor: 'pointer',
    },
    resultsContainer: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: '20px',
      padding: '10px',
      backgroundColor: '#fff',
      borderRadius: '5px',
      width: '80%',  // Adjust the width for centering
      maxWidth: '600px',  // Limit the width to 600px
      textAlign: 'center', // Center text inside the results container
    },
    resultItem: {
      marginBottom: '15px',
      textAlign: 'center',
    },
  };
  
  
  
  const suggestionsStyle = {
    position: "absolute",
    top: "100%",  // Places the suggestions below the search bar
    marginTop: "0.5rem",  // Adds space between the search bar and suggestions
    width: "100%",  // Ensures it matches the input's width
    maxWidth: "16rem",  // Matches sm:w-64 in Tailwind (for responsive width)
    backgroundColor: "white",  // Background color of the dropdown
    border: "1px solid #d1d5db",  // Light gray border (matching Tailwind's gray-300)
    borderRadius: "0.25rem",  // Rounded corners
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",  // Adds shadow for visual separation
    zIndex: 10,  // Ensures it's above other content
    maxHeight: "200px",  // Maximum height for scrolling
    overflowY: "auto",  // Enables scrolling if content overflows
  };
  
  const suggestionItemStyle = {
    padding: "0.5rem 1rem",  // Padding for each item
    cursor: "pointer",  // Pointer cursor on hover
    transition: "background-color 0.3s",  // Smooth background color transition
  };
  
  const suggestionItemHoverStyle = {
    backgroundColor: "#f3f4f6",  // Light hover background (Tailwind's gray-100)
  };
  
  const suggestionCategoryStyle = {
    padding: "0.5rem",  // Padding around categories
  };
  
  const suggestionCategoryHeadingStyle = {
    fontWeight: "bold",  // Make category headings bold
    marginBottom: "0.25rem",  // Space below the category title
  };
  

  const styles_result = {
    container: {
      display: 'flex', // Arrange items horizontally
      alignItems: 'center', // Align items vertically at the center
      justifyContent: 'center', // Center items horizontally
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
      justifyContent: 'center', // Center content vertically within textContainer
      alignItems: 'flex-start', // Align text to the left side
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
          
          {/* Suggestions dropdown
          {(suggestions.plats.length > 0 ||
            suggestions.chefs.length > 0 ||
            suggestions.cuisines.length > 0) && (
            <div style={styles.suggestionsList}>
              {suggestions.plats.length > 0 && (
                <div style={styles.suggestionCategory}>
                  <h4>Plats</h4>
                  <ul>
                    {suggestions.plats.map((suggestion, index) => (
                      <li
                        key={`plat-${index}`}  
                        style={styles.suggestionItem}
                        onClick={() => handleSuggestionClick(suggestion)}
                      >
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {suggestions.chefs.length > 0 && (
                <div style={styles.suggestionCategory}>
                  <h4>Chefs</h4>
                  <ul>
                    {suggestions.chefs.map((suggestion, index) => (
                      <li
                        key={`chef-${index}`} 
                        style={styles.suggestionItem}
                        onClick={() => handleSuggestionClick(suggestion)}
                      >
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {suggestions.cuisines.length > 0 && (
                <div style={styles.suggestionCategory}>
                  <h4>Cuisines</h4>
                  <ul>
                    {suggestions.cuisines.map((suggestion, index) => (
                      <li
                        key={`cuisine-${index}`} 
                        style={styles.suggestionItem}
                        onClick={() => handleSuggestionClick(suggestion)}
                      >
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )} */}

          {/* Search buttons */}
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
      </div>

      {/* Results container */}
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
                <div style={styles_result.container}>
                  <img src={result.image.value} alt={result.dishLabel.value} style={styles_result.image} />
                  <div style={styles_result.textContainer}>
                    <h2 style={styles_result.dishLabel}>{result.dishLabel.value}</h2>
                    <p style={styles_result.abstract}>{result.abstract.value}</p>
                  </div>
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
  );
};

export default YourComponent; 