// pages/page.js
'use client';  // Marque ce fichier comme un composant client

import React, { useState } from 'react';
import { generateSparqlQueryPlat, fetchSparqlResults, generateSparqlQueryChef, generateSparqlQueryCuisine } from './requetes'; // Import des fonctions

export default function Page() {
  const [searchQuery, setSearchQuery] = useState('');  // État pour stocker la recherche
  const [results, setResults] = useState([]);  // État pour stocker les résultats de la requête SPARQL
  const [suggestions, setSuggestions] = useState({ plats: [], chefs: [], cuisines: [] });

  // Fonction pour gérer le changement dans le champ de recherche
  const handleSearchChange = async (e) => {
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

  // Fonction pour gérer la sélection d'une suggestion
  const handleSuggestionClick = (suggestion) => {
    setSearchQuery(suggestion); // Mettre à jour la recherche avec la suggestion choisie
    setSuggestions({ plats: [], chefs: [], cuisines: [] }); // Effacer les suggestions
  };

  // Fonction pour gérer la soumission du formulaire
  const handleSearchSubmit = async (e) => {
    e.preventDefault();  // Empêche le rechargement de la page

    // Génère la requête SPARQL avec le terme de recherche

    let query;
    if (searchQuery.toLowerCase().includes("chef")) {
      query = generateSparqlQueryChef(searchQuery);
    } else if (searchQuery.toLowerCase().includes("cuisine")) {
      query = generateSparqlQueryCuisine(searchQuery);
    }
    else {
      query = generateSparqlQueryPlat(searchQuery);
    }

    // Appelle fetchSparqlResults pour récupérer les résultats
    const data = await fetchSparqlResults(query);

    // Met à jour l'état avec les résultats de la recherche
    setResults(data);
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Nutritif</h1>
      <form onSubmit={handleSearchSubmit} style={styles.searchForm}>
        <div style={{ position: 'relative' }}>
          <input
            type="text"
            placeholder="Rechercher un plat, un chef ou une cuisine..."
            value={searchQuery}
            onChange={handleSearchChange}
            style={styles.searchInput}
          />
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
          )}
        </div>
        <button type="submit" style={styles.searchButton}>
          Rechercher
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
