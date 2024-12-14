'use client';

import { useState, useEffect } from 'react';
import { fetchPlatData } from '../requetes'; // Assurez-vous que le chemin est correct

export default function ProfilPage({ params }) {
  const [plat, setPlat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        // Récupération explicite de `params`
        const name = params?.name;

        if (!name) {
          throw new Error('Aucun nom fourni dans les paramètres.');
        }

        // Appel à la fonction pour récupérer les données du plat
        const data = await fetchPlatData(name);
        setPlat(data);
        setLoading(false);
      } catch (err) {
        console.error('Erreur lors de la récupération des données :', err);
        setError(err.message);
        setLoading(false);
      }
    }

    fetchData();
  }, [params]);

  if (loading) return <p>Chargement...</p>;
  if (error) return <p>Erreur : {error}</p>;

  return (
    <div style={styles.container}>
      <div style={styles.imageContainer}>
        {plat.image && <img src={plat.image} alt={plat.nom} style={styles.image} />}
      </div>
      <div style={styles.detailsContainer}>
        <h1 style={styles.title}>{plat.nom}</h1>
        <p style={styles.description}>{plat.description}</p>
        <p style={styles.origin}>
          <strong>Origine :</strong> {plat.origine}
        </p>
        <h2 style={styles.subtitle}>Ingrédients :</h2>
        <ul style={styles.ingredientsList}>
          {plat.ingredients.map((ingredient, index) => (
            <li key={index} style={styles.ingredient}>
              {ingredient}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '30px',
    padding: '20px',
    fontFamily: 'Arial, sans-serif',
    backgroundColor: '#f9f9f9',
    borderRadius: '10px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    maxWidth: '1000px',
    margin: '20px auto',
  },
  imageContainer: {
    flex: '1',
    maxWidth: '400px',
  },
  image: {
    width: '100%',
    height: 'auto',
    borderRadius: '10px',
    objectFit: 'cover',
  },
  detailsContainer: {
    flex: '2',
  },
  title: {
    fontSize: '32px',
    fontWeight: 'bold',
    marginBottom: '10px',
    color: '#333',
  },
  description: {
    fontSize: '18px',
    color: '#555',
    marginBottom: '15px',
  },
  origin: {
    fontSize: '18px',
    color: '#777',
    marginBottom: '15px',
  },
  subtitle: {
    fontSize: '22px',
    fontWeight: 'bold',
    marginBottom: '10px',
    color: '#333',
  },
  ingredientsList: {
    listStyleType: 'disc',
    paddingLeft: '20px',
  },
  ingredient: {
    fontSize: '16px',
    color: '#555',
  },
};
