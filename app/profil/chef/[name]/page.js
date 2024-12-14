'use client';

import { useState, useEffect } from 'react';
import { fetchChefData } from '../../../requetes'; // Ajustez le chemin si nécessaire

export default function ChefProfilPage({ params }) {
  const [chef, setChef] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        // Récupération et décodage du paramètre de l'URL
        const name = decodeURIComponent(params.name);

        if (!name) {
          throw new Error('Aucun nom fourni dans les paramètres.');
        }

        // Appel à la fonction pour récupérer les données du chef
        const data = await fetchChefData(name);
        setChef(data);
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
        {chef.image && <img src={chef.image} alt={chef.nom} style={styles.image} />}
      </div>
      <div style={styles.detailsContainer}>
        <h1 style={styles.title}>{chef.nom}</h1>
        <p style={styles.description}>{chef.description}</p>
        <p style={styles.detail}><strong>Date de naissance :</strong> {chef.dateNaissance}</p>
        <p style={styles.detail}><strong>Lieu de naissance :</strong> {chef.lieuNaissance}</p>
      </div>
    </div>
  );
}

const styles = {
  container: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px' },
  imageContainer: { width: '100%', maxWidth: '300px', marginBottom: '20px' },
  image: { width: '100%', borderRadius: '10px', objectFit: 'cover' },
  detailsContainer: { width: '100%', maxWidth: '600px' },
  title: { fontSize: '24px', fontWeight: 'bold', marginBottom: '10px' },
  description: { fontSize: '16px', marginBottom: '10px' },
  detail: { fontSize: '14px', marginBottom: '5px' },
};
