export function generateSparqlQueryPlat(plat) {
  const platName = plat.trim().replace(/%20/g, ' '); // Remplace les %20 par des espaces

  return `
    SELECT DISTINCT 
      ?abstract 
      (SAMPLE(?dishLabel) AS ?dishLabel) 
      (SAMPLE(?image) AS ?image) 
      (GROUP_CONCAT(DISTINCT ?ingredientLabel; separator=", ") AS ?ingredients) 
      (SAMPLE(?originLabel) AS ?origin)
    WHERE {
      ?dish rdf:type dbo:Food ;
            rdfs:label ?dishLabel ;
            dbo:abstract ?abstract ;
            dbo:thumbnail ?image .

      OPTIONAL {
        ?dish dbo:ingredient ?ingredient.
        ?ingredient rdfs:label ?ingredientLabel.
        FILTER(LANG(?ingredientLabel) = "fr")
      }

      OPTIONAL {
        ?dish dbo:country ?originResource.
        ?originResource rdfs:label ?originLabel.
        FILTER(LANG(?originLabel) = "fr")
      }

      FILTER(LANG(?abstract) = "fr" && LANG(?dishLabel) = "fr")
      FILTER(CONTAINS(LCASE(?dishLabel), "${platName.toLowerCase()}"))
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
        (LANG(?description) = "fr")
      )
      FILTER (LANG(?chefLabel) = "fr")
    }
    LIMIT 1
  `;
}

export function generateSparqlQueryCuisine(pays) {
  const paysName = pays.replace(/^cuisine\s+/i, '').trim();

  // Requête SPARQL pour rechercher une cuisine dans DBpedia
  return `
    SELECT DISTINCT ?cuisine ?cuisineLabel ?description ?image
    WHERE {
      ?cuisine a dbo:Country ;
      a owl:Thing ;
      dbo:abstract ?description;
      rdfs:label ?cuisineLabel;
      dbo:thumbnail ?image;
      dbo:wikiPageWikiLink ?dishes.
      FILTER (LANG(?cuisineLabel) = "fr" && LANG(?description) = "fr")
      FILTER (CONTAINS(LCASE(?cuisineLabel), LCASE("cuisine")) && CONTAINS(LCASE(?description), LCASE("${paysName}")))
      FILTER (CONTAINS(LCASE(STR(?dishes)), LCASE(STR("dish"))))
    }
    `;
}


// Fonction pour envoyer la requête SPARQL à DBpedia et récupérer les résultats
export async function fetchSparqlResults(query) {
  const endpointUrl = 'https://dbpedia.org/sparql';  // URL de l'endpoint SPARQL de DBpedia

  try {
    const response = await fetch(endpointUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        query: query,  // La requête SPARQL générée
        format: 'json',  // Format des résultats (JSON)
      }),
    });

    // Si la requête est réussie, retourner les résultats
    const data = await response.json();
    return data.results.bindings;
  } catch (error) {
    console.error('Erreur lors de la récupération des résultats SPARQL:', error);
    return [];
  }
}

export async function fetchSuggestions(query, type) {
  if (query.length < 3) {
    return [];
  }
  
  let suggestionQuery;
  if (type === 'chef') {
    suggestionQuery = generateSparqlQueryChef(query);
  } else if (type === 'cuisine') {
    suggestionQuery = generateSparqlQueryCuisine(query);
  } else {
    // Par défaut "plat"
    suggestionQuery = generateSparqlQueryPlat(query);
  }

  const data = await fetchSparqlResults(suggestionQuery);

  return data.map(item => {
    if (item.chefLabel) return item.chefLabel.value;
    if (item.dishLabel) return item.dishLabel.value;
    if (item.cuisineLabel) return item.cuisineLabel.value;
    return null;
  }).filter(Boolean); // Filtre les valeurs null/undefined
}

/*const handleSearchChange = async (e) => {
  const value = e.target.value;
  setSearchQuery(value);

  if (value.length >= 3) {
    const suggs = await fetchSuggestions(value, searchType);
    setSuggestions(suggs);
  } else {
    setSuggestions([]);
  }
};

const handleSearchSubmit = async (e) => {
  e.preventDefault();
  setSuggestions([]); // On ferme les suggestions après la soumission

  let query;
  if (searchType === 'chef') {
    query = generateSparqlQueryChef(searchQuery);
  } else if (searchType === 'cuisine') {
    query = generateSparqlQueryCuisine(searchQuery);
  } else {
    query = generateSparqlQueryPlat(searchQuery);
  }

  const data = await fetchSparqlResults(query);
  setResults(data);
};



export function requete_profil_plat(nom) {
  return `
    SELECT DISTINCT ?name ?description ?origin ?ingredient ?image
    WHERE {
      ?dish a dbo:Food ;
            rdfs:label ?name ;
            dbo:abstract ?description ;
            dbo:country ?origin ;
            dbo:ingredient ?ingredient ;
            dbo:thumbnail ?image .
      FILTER (lang(?description) = "fr") # Si la description française n'existe pas, remplacez par "en"
      FILTER (CONTAINS(LCASE(STR(?name)), LCASE("${nom}")))
    }
  `;
}*/


export async function fetchPlatData(name) {
  try {
    const query = generateSparqlQueryPlat(name);
    const url = `https://dbpedia.org/sparql?query=${encodeURIComponent(query)}&format=json`;

    const response = await fetch(url);
    const json = await response.json();

    if (!json.results.bindings.length) {
      throw new Error(`Aucun résultat trouvé pour "${name}".`);
    }

    const result = json.results.bindings[0];
    const ingredients = result.ingredients?.value ? result.ingredients.value.split(", ") : [];

    return {
      nom: result.dishLabel?.value || 'Nom inconnu',
      description: result.abstract?.value || 'Pas de description disponible.',
      origine: result.origin?.value || 'Origine inconnue',
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
      lieuNaissance: cleanDbpediaResource(result.birthPlace?.value) || 'Lieu de naissance inconnu',
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