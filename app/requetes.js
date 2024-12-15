export function generateSparqlQueryPlat(plat) {
  return `
    SELECT DISTINCT ?abstract (SAMPLE(?dishLabel) AS ?dishLabel) (SAMPLE(?image) AS ?image)
    WHERE {
      ?dish rdf:type dbo:Food ;
            rdfs:label ?dishLabel ;
            dbo:abstract ?abstract ;
            dbo:thumbnail ?image.
      FILTER(LANG(?abstract) = "fr") 
      FILTER(CONTAINS(LCASE(?dishLabel), "${plat.toLowerCase()}"))
    }
    GROUP BY ?abstract
    LIMIT 15
  `;
}

export function generateSparqlQueryChef(chef) {
  const chefName = chef.trim().replace(/%20/g, ' '); // Remplace les %20 par des espaces

  return `
    SELECT DISTINCT ?chef ?chefLabel ?birthDate ?description ?birthPlace ?image
    WHERE {
      ?chef a dbo:Chef ;
            rdfs:label ?chefLabel ;
            dbo:abstract ?description .
      OPTIONAL { ?chef dbo:birthDate ?birthDate. }
      OPTIONAL { ?chef dbo:birthPlace ?birthPlace. }
      OPTIONAL { ?chef dbo:thumbnail ?image. }
      FILTER (
        CONTAINS(LCASE(STR(?chefLabel)), LCASE("${chefName}")) &&
        (LANG(?description) = "fr" || LANG(?description) = "en")
      )
      FILTER (LANG(?chefLabel) = "fr" || LANG(?chefLabel) = "en")
    }
    LIMIT 1
  `;
}



export async function fetchPlatData(name) {
  try {
    const url = `https://dbpedia.org/sparql?query=${encodeURIComponent(
      generateSparqlQueryPlat(name)
    )}&format=json`;

    const response = await fetch(url);
    const json = await response.json();

    if (!json.results.bindings.length) {
      throw new Error(`Aucun résultat trouvé pour "${name}".`);
    }

    const ingredients = [...new Set(json.results.bindings
      .filter((binding) => binding.ingredient?.value)
      .map((binding) => cleanDbpediaResource(binding.ingredient.value))
    )];

    const result = json.results.bindings[0];

    return {
      nom: result.dishLabel?.value || 'Nom inconnu',
      description: result.abstract?.value || 'Pas de description disponible.',
      origine: cleanDbpediaResource(result.origin?.value),
      ingredients,
      image: result.image?.value || null,
    };
  } catch (error) {
    console.error('Erreur dans fetchPlatData :', error.message);
    throw error;
  }
}

export async function fetchChefData(chefName) {
  try {
    const url = `https://dbpedia.org/sparql?query=${encodeURIComponent(
      generateSparqlQueryChef(chefName)
    )}&format=json`;

    const response = await fetch(url);
    const json = await response.json();

    if (!json.results.bindings.length) {
      throw new Error(`Aucun résultat trouvé pour "${chefName}".`);
    }

    const result = json.results.bindings[0];

    return {
      nom: result.chefLabel?.value || 'Nom inconnu',
      description: result.description?.value || 'Pas de description disponible.',
      dateNaissance: result.birthDate?.value || 'Date de naissance inconnue',
      lieuNaissance: result.birthPlace?.value || 'Lieu de naissance inconnu',
      image: result.image?.value || null,
    };
  } catch (error) {
    console.error('Erreur dans fetchChefData :', error.message);
    throw error;
  }
}

export function formatDateISO(dateISO) {
  const mois = [
    'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
    'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'
  ];
  const [year, month, day] = dateISO.split('-');
  return `${parseInt(day)} ${mois[parseInt(month) - 1]} ${year}`;
}

// Fonction pour nettoyer une URL en ne gardant que le dernier segment
export function cleanDbpediaResource(url) {
  if (url) {
    const segments = url.split('/');
    return segments[segments.length - 1].replace(/_/g, ' '); // Supprime les underscores et garde la fin
  }
  return 'Inconnu'; // Retourne une valeur par défaut si l'URL est invalide
}