'use client';

import { useState, useEffect } from 'react';
import { requete_profil_plat } from '../../requete'; // Correctement importer `requete.js`

export default function ProfilPage({ params }) {
  const [id, setId] = useState(null); // Stocker l'ID résolu
  const [plat, setPlat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Résolution de `params`
  useEffect(() => {
    async function resolveParams() {
      try {
        const resolvedParams = await params; // Résoudre `params`
        setId(resolvedParams.id); // Extraire l'ID
      } catch (err) {
        setError('Erreur lors de la résolution des paramètres.');
        setLoading(false);
      }
    }
    resolveParams();
  }, [params]);

  // Charger les données une fois que l'ID est défini
  useEffect(() => {
    if (id) {
      fetchPlat(id)
        .then((data) => {
          setPlat(data);
          setLoading(false);
        })
        .catch((err) => {
          setError(err.message);
          setLoading(false);
        });
    }
  }, [id]);

  async function fetchPlat(id) {
    const url = `https://dbpedia.org/sparql?query=${encodeURIComponent(
      requete_profil_plat(id)
    )}&format=json`;

    const response = await fetch(url);
    const json = await response.json();

    if (!json.results.bindings.length) {
      throw new Error('Aucun résultat trouvé.');
    }

    const result = json.results.bindings[0];

    return {
      nom: result.name?.value || 'Nom inconnu',
      description: result.description?.value || 'Pas de description disponible.',
      origine: result.origin?.value || 'Origine inconnue',
      ingredients: result.ingredient ? [result.ingredient.value] : [],
      image: result.image?.value || null,
    };
  }

  if (loading) return <p>Chargement...</p>;
  if (error) return <p>Erreur : {error}</p>;

  return (
    <div>
      <h1>{plat.nom}</h1>
      {plat.image && <img src={plat.image} alt={plat.nom} />}
      <p>{plat.description}</p>
      <p>Origine : {plat.origine}</p>
      <h2>Ingrédients :</h2>
      <ul>
        {plat.ingredients.map((ingredient, index) => (
          <li key={index}>{ingredient}</li>
        ))}
      </ul>
    </div>
  );
}
