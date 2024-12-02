// pages/page.js

'use client'; // Ajoutez cette ligne pour marquer ce fichier comme un composant client

import React, { useState } from 'react';

export default function Page() {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    console.log("Searching for:", searchQuery);
    // Ajouter ici la logique de recherche (par exemple, appel d'API)
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Nutritif</h1>
      <form onSubmit={handleSearchSubmit} style={styles.searchForm}>
        <input
          type="text"
          placeholder="Rechercher..."
          value={searchQuery}
          onChange={handleSearchChange}
          style={styles.searchInput}
        />
        <button type="submit" style={styles.searchButton}>
          Rechercher
        </button>
      </form>
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
};

