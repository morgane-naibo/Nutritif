'use client';

import { useState, useEffect } from 'react';
import { fetchChefData } from '../../../requetes'; // Ajustez le chemin
import { generateSparqlQueryChef } from '../../../requetes';


export default function ChefProfilPage({ params }) {
  const [chef, setChef] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  useEffect(() => {
    async function fetchData() {
      try {
        // Résolution explicite de `params` car c'est une Promise dans votre contexte
        const resolvedParams = await params;
        const name = resolvedParams?.name; // Récupération du nom du plat

        if (!name) {
          throw new Error('Aucun nom fourni dans les paramètres.');
        }

        // Appel à la fonction pour récupérer les données du plat
        const data = await fetchChefData(name);
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
  container: { /* Styles similaires à vos pages précédentes */ },
  imageContainer: { /* ... */ },
  image: { /* ... */ },
  detailsContainer: { /* ... */ },
  title: { /* ... */ },
  description: { /* ... */ },
  detail: { /* ... */ },
};
