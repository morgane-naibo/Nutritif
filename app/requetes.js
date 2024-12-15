
export function formatDateISO(dateISO) {
  const mois = [
    'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
    'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'
  ];
  const [year, month, day] = dateISO.split('-');
  return `${parseInt(day)} ${mois[parseInt(month) - 1]} ${year}`;
}

export function generateSparqlQueryPlat(plat) {
  const cleanedPlat = plat.replace(/%20/g, ' '); // Remplace les %20 par des espaces
  return `
    SELECT DISTINCT ?abstract (SAMPLE(?dishLabel) AS ?dishLabel) 
                    (SAMPLE(?image) AS ?image) 
                    (SAMPLE(?country) AS ?origine) 
                    ?ingredient
    WHERE {
      ?dish rdf:type dbo:Food ;
            rdfs:label ?dishLabel ;
            dbo:abstract ?abstract ;
            dbo:thumbnail ?image .
      OPTIONAL { ?dish dbo:country ?country. }
      OPTIONAL { ?dish dbo:ingredient ?ingredient. }
      FILTER(LANG(?abstract) = "fr")
      FILTER(REGEX(LCASE(?dishLabel), "${cleanedPlat.toLowerCase().replace(/[- ]/g, '.*')}", "i"))
    }
    GROUP BY ?abstract ?ingredient
    LIMIT 15
  `;
}

/*

export function generateSparqlQueryCuisine(cuisine) {
  const cleanedCuisine = cuisine.trim().replace(/%20/g, ' '); // Remplace %20 par un espace
  return `
    SELECT DISTINCT ?cuisineLabel ?abstract (SAMPLE(?image) AS ?image)
    WHERE {
      ?cuisine rdfs:label ?cuisineLabel .
      ?cuisine dbo:abstract ?abstract .
      OPTIONAL { ?cuisine dbo:thumbnail ?image. }
      FILTER(CONTAINS(LCASE(?cuisineLabel), "${cleanedCuisine.toLowerCase()}") && LANG(?cuisineLabel) = "fr")
      FILTER(LANG(?abstract) = "fr")
    }
    LIMIT 1
  `;
}
*/




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
    const query = generateSparqlQueryPlat(name);
    const url = `https://dbpedia.org/sparql?query=${encodeURIComponent(query)}&format=json`;

    const response = await fetch(url);
    const json = await response.json();

    if (!json.results.bindings.length) {
      throw new Error(`Aucun résultat trouvé pour "${name}".`);
    }

    const ingredients = [...new Set(json.results.bindings
      .filter((binding) => binding.ingredient?.value)
      .map((binding) => cleanDbpediaResource(binding.ingredient.value)))];

    const result = json.results.bindings[0];

    return {
      nom: result.dishLabel?.value || 'Nom inconnu',
      description: result.abstract?.value || 'Pas de description disponible.',
      origine: cleanDbpediaResource(result.origine?.value) || 'Origine inconnue',
      ingredients: ingredients,
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


export function cleanDbpediaResource(url) {
  if (url) {
    const segments = url.split('/');
    return segments[segments.length - 1].replace(/_/g, ' '); // Supprime les underscores et garde la fin
  }
  return 'Inconnu'; // Retourne une valeur par défaut si l'URL est invalide
}


export async function fetchSparqlResults(query) {
  try {
    const url = `https://dbpedia.org/sparql?query=${encodeURIComponent(query)}&format=json`;
    const response = await fetch(url);
    const json = await response.json();

    if (!json.results.bindings.length) {
      console.warn("Aucun résultat trouvé pour la requête SPARQL.");
      return []; // Retourne un tableau vide
    }

    return json.results.bindings.map((item) => ({
      cuisineLabel: item.cuisineLabel?.value || "",
      abstract: item.abstract?.value || "",
      image: item.image?.value || null,
    }));
  } catch (error) {
    console.error("Erreur dans fetchSparqlResults :", error.message);
    throw error;
  }
}

export async function fetchCuisineData(cuisineName) {
  try {
    const query = generateSparqlQueryCuisine(cuisineName);
    const url = `https://dbpedia.org/sparql?query=${encodeURIComponent(query)}&format=json`;

    console.log("Requête SPARQL Cuisine :", query); // Log
    const response = await fetch(url);
    const json = await response.json();
    console.log("Réponse SPARQL Cuisine :", json); // Log

    if (!json.results.bindings.length) {
      console.warn(`Aucun résultat trouvé pour "${cuisineName}"`);
      return {
        nom: cuisineName,
        description: "Aucune donnée disponible pour cette cuisine.",
        image: null,
      };
    }
    

    const result = json.results.bindings[0];

    return {
      nom: result.cuisineLabel?.value || 'Nom inconnu',
      description: result.description?.value || 'Pas de description disponible.',
      image: result.image?.value || null,
    };
  } catch (error) {
    console.error('Erreur dans fetchCuisineData :', error.message);
    throw error;
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

const handleSearchChange = async (e) => {
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
