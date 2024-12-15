'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { fetchPlatData, fetchChefData, fetchCuisineData, cleanDbpediaResource, formatDateISO } from '../../requetes';

export default function ProfilPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Récupération des paramètres
  const params = useParams(); // Ex: { name: 'GordonRamsay' }
  const searchParams = useSearchParams(); // Ex: type=chef

  useEffect(() => {
    async function fetchData() {
      try {
        const name = decodeURIComponent(params?.name || ''); // Décoder le nom
        const type = searchParams.get('type'); // Récupérer "type"

        if (!name || !type) {
          throw new Error('Nom ou type manquant dans les paramètres.');
        }

        let fetchedData;

        if (type === 'plat') {
          fetchedData = await fetchPlatData(name);
        } else if (type === 'chef') {
          fetchedData = await fetchChefData(name);
        } else if (type === 'cuisine') {
          fetchedData = await fetchCuisineData(name); // Utilisation correcte
        } else {
          throw new Error('Type invalide. Utilisez "plat", "chef" ou "cuisine".');
        }

        setData(fetchedData);
        setLoading(false);
      } catch (err) {
        console.error('Erreur lors de la récupération des données :', err);
        setError(err.message);
        setLoading(false);
      }
    }

    fetchData();
  }, [params, searchParams]);

  if (loading) return <p>Chargement...</p>;
  if (error) return <p>Erreur : {error}</p>;

  return (
    <div className="min-h-screen flex flex-col bg-red-600">
          {/* Bandeau blanc avec le logo centré */}
          <div className="w-full bg-white flex justify-center items-center py-14 px-12 relative">
            <div className="absolute left-0 right-0 flex justify-center">
              <Image src="/logo.svg" alt="Logo" width={100} height={100} />
            </div>
          </div>
      
    <div style={styles.container}>
      <div style={styles.imageContainer}>
        {data.image && <img src={data.image} alt={data.nom} style={styles.image} />}
        {/* Informations spécifiques pour les chefs et les cuisines sous la photo */}
        {(searchParams.get('type') === 'chef' || searchParams.get('type') === 'cuisine') && (
          <div style={styles.additionalInfo}>
            {searchParams.get('type') === 'chef' && (
              <>
                {data.dateNaissance && (
                  <p style={styles.detail}>
                    <strong>Date de naissance :</strong> {formatDateISO(data.dateNaissance)}
                  </p>
                )}
                {data.lieuNaissance && (
                  <p style={styles.detail}>
                    <strong>Lieu de naissance :</strong> {cleanDbpediaResource(data.lieuNaissance)}
                  </p>
                )}
              </>
            )}
            {searchParams.get('type') === 'cuisine' && (
              <>
                {data.description && (
                  <p style={styles.detail}>
                    <strong>Description :</strong> {data.description}
                  </p>
                )}
              </>
            )}
          </div>
        )}
      </div>
      <div style={styles.detailsContainer}>
        <h1 style={styles.title}>{data.nom}</h1>
        <p style={styles.description}>{data.description}</p>

        {/* Affichage conditionnel pour les plats */}
        {searchParams.get('type') === 'plat' && (
          <>
            <p style={styles.origin}>
              <strong>Origine :</strong> {data.origine || 'Origine inconnue'}
            </p>
            <h2 style={styles.subtitle}>Ingrédients :</h2>
            {/* Affichage des ingrédients en liste */}
            {data.ingredients && Array.isArray(data.ingredients) && data.ingredients.length > 0 ? (
              <ul style={styles.ingredientsList}>
                {data.ingredients.map((ingredient, index) => (
                  <li key={index} style={styles.ingredientItem}>
                    {ingredient}
                  </li>
                ))}
              </ul>
            ) : (
              <p style={styles.ingredients}>
                Aucun ingrédient disponible.
              </p>
            )}
          </>
        )}

        {/* Affichage conditionnel pour les cuisines */}
        {searchParams.get('type') === 'cuisine' && (
          <>
            <p style={styles.origin}>
              <strong>Description :</strong> {data.description || 'Aucune description disponible.'}
            </p>
          </>
        )}
      </div>
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
  additionalInfo: {
    marginTop: '10px',
    fontSize: '16px',
    color: '#555',
  },
  detail: {
    marginBottom: '5px',
    fontSize: '16px',
    lineHeight: '1.5',
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
    marginBottom: '15px',
    color: '#555',
  },
  ingredientItem: {
    fontSize: '16px',
    lineHeight: '1.6',
    marginBottom: '5px',
  },
};
