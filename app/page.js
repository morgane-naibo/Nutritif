// pages/page.js
'use client';  // Marque ce fichier comme un composant client

import React, { useState } from 'react';
import { generateSparqlQueryPlat, fetchSparqlResults, generateSparqlQueryChef } from './requetes'; // Import des fonctions

export default function Page() {
  const [searchQuery, setSearchQuery] = useState('');  // État pour stocker la recherche
  const [results, setResults] = useState([]);  // État pour stocker les résultats de la requête SPARQL

  // Fonction pour gérer le changement dans le champ de recherche
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Fonction pour gérer la soumission du formulaire
  const handleSearchSubmit = async (e) => {
    e.preventDefault();  // Empêche le rechargement de la page

    // Génère la requête SPARQL avec le terme de recherche

    let query;
    if (searchQuery.toLowerCase().includes("chef")) {
      query = generateSparqlQueryChef(searchQuery);
    } else {
      query = generateSparqlQueryPlat(searchQuery);
    }

    // Appelle fetchSparqlResults pour récupérer les résultats
    const data = await fetchSparqlResults(query);

    // Met à jour l'état avec les résultats de la recherche
    setResults(data);
    afficherResultats(data);
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Nutritif</h1>
      <form onSubmit={handleSearchSubmit} style={styles.searchForm}>
        <input
          type="text"
          placeholder="Rechercher un plat..."
          value={searchQuery}
          onChange={handleSearchChange}
          style={styles.searchInput}
        />
        <button type="submit" style={styles.searchButton}>
          Rechercher
        </button>
      </form>

      <div style={styles.resultsContainer}>
        {results.length > 0 ? (
          results.map((result, index) => (
            <div key={index} style={styles.resultItem}>
              {/* Vérifier si c'est un chef ou un plat en fonction des données renvoyées */}
              {result.chefLabel ? (
                <div>
                  <h2>{result.chefLabel.value}</h2>
                  <p>{result.description.value}</p>
                </div>
              ) : (
                <div>
                  <h2>{result.dishLabel.value}</h2>
                  <p>{result.abstract.value}</p>
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
