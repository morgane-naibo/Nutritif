/*export function generateSparqlQueryPlat(plat) {
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
  */
export function generateSparqlQueryPlat(plat) {
  const cleanedPlat = plat.replace(/%20/g, ' '); // Remplace les %20 par des espaces
  const cleanedPlat2 = cleanedPlat.replace(/%C3%A9/g, 'é'); // Remplace les accents
  const cleanedPlat3 = cleanedPlat2.replace(/%C3%A8/g, 'è'); // Remplace les accents 
  const cleanedPlat4 = cleanedPlat3.replace(/%C3%A0/g, 'à'); // Remplace les accents
  const cleanedPlat5 = cleanedPlat4.replace(/%C3%A7/g, 'ç'); // Remplace les accents
  const cleanedPlat6 = cleanedPlat5.replace(/%C3%B4/g, 'ô'); // Remplace les accents
  const cleanedPlat7 = cleanedPlat6.replace(/%C3%AA/g, 'ê'); // Remplace les accents

  return `
    SELECT DISTINCT ?abstract (SAMPLE(?dishLabel) AS ?dishLabel) 
                    (SAMPLE(?image) AS ?image) 
                    (SAMPLE(?country) AS ?origine) 
                    (GROUP_CONCAT(DISTINCT ?ingredient; separator=", ") AS ?ingredients)
    WHERE {
      ?dish rdf:type dbo:Food ;
            rdfs:label ?dishLabel ;
            dbo:abstract ?abstract ;
            dbo:thumbnail ?image .
      OPTIONAL { ?dish dbo:country ?country. }
      OPTIONAL { ?dish dbo:ingredient ?ingredient. }
      FILTER(LANG(?abstract) = "fr" && LANG(?dishLabel) = "fr")
      FILTER(REGEX(LCASE(?dishLabel), "${cleanedPlat7.toLowerCase().replace(/[- ]/g, '.*')}", "i"))
    }
    GROUP BY ?abstract
    LIMIT 15
  `;
}




export function generateSparqlQueryChef(chef) {
  const chefName = chef.trim().replace(/%20/g, ' '); // Remplace les %20 par des espaces
  const cleanedChefName = chefName.replace(/%C3%A9/g, 'é'); // Remplace les accents
  const cleanedChefName2 = cleanedChefName.replace(/%C3%A8/g, 'è'); // Remplace les accents
  const cleanedChefName3 = cleanedChefName2.replace(/%C3%A0/g, 'à'); // Remplace les accents
  const cleanedChefName4 = cleanedChefName3.replace(/%C3%A7/g, 'ç'); // Remplace les accents
  const cleanedChefName5 = cleanedChefName4.replace(/%C3%B4/g, 'ô'); // Remplace les accents
  const cleanedChefName6 = cleanedChefName5.replace(/%C3%AA/g, 'ê'); // Remplace les accents


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
        CONTAINS(LCASE(STR(?chefLabel)), LCASE("${cleanedChefName6}")) &&
        (LANG(?description) = "fr")
      )
      FILTER (LANG(?chefLabel) = "fr" || LANG(?chefLabel) = "en")
    }
    LIMIT 1
  `;
}

export function generateSparqlQueryCuisine(pays) {
  const paysName = pays.trim().replace(/%20/g, ' '); 
  const cleanedPaysName = paysName.replace(/%C3%A9/g, 'é'); // Remplace les accents
  const cleanedPaysName2 = cleanedPaysName.replace(/%C3%A8/g, 'è'); // Remplace les accents
  const cleanedPaysName3 = cleanedPaysName2.replace(/%C3%A0/g, 'à'); // Remplace les accents
  const cleanedPaysName4 = cleanedPaysName3.replace(/%C3%A7/g, 'ç'); // Remplace les accents
  const cleanedPaysName5 = cleanedPaysName4.replace(/%C3%B4/g, 'ô'); // Remplace les accents
  const cleanedPaysName6 = cleanedPaysName5.replace(/%C3%AA/g, 'ê'); // Remplace les accents
  const cleanedPaysName7 = cleanedPaysName6.replace(/%C3%AE/g, 'î'); // Remplace les accents
  const cleanedPaysName8 = cleanedPaysName7.replace(/%C3%AF/g, 'ï'); // Remplace les accents


  // Requête SPARQL pour rechercher une cuisine dans DBpedia
  return `
    SELECT DISTINCT ?cuisine ?cuisineLabel ?description ?image (GROUP_CONCAT(?dishLabel; separator=", ") AS ?dishes)
    WHERE {
      ?cuisine a dbo:Country ;
               rdfs:label ?cuisineLabel ;
               dbo:abstract ?description ;
               dbo:thumbnail ?image .
      OPTIONAL {
        ?dish rdf:type dbo:Food ;
              dbo:country ?cuisine ;
              rdfs:label ?dishLabel .
        FILTER(LANG(?dishLabel) = "fr")
      }
      FILTER (CONTAINS(LCASE(?cuisineLabel), LCASE("cuisine")) && CONTAINS(LCASE(?description), LCASE("${cleanedPaysName8}")))
      FILTER (LANG(?cuisineLabel) = "fr" && LANG(?description) = "fr")
    }
    GROUP BY ?cuisine ?cuisineLabel ?description ?image
    ORDER BY DESC(CONTAINS(LCASE(?cuisineLabel), LCASE("${paysName}"))) # Priorise les correspondances exactes
    LIMIT 10
  `;
}


// Fonction pour envoyer la requête SPARQL à DBpedia et récupérer les résultats
export async function fetchSparqlResults(query) {
  const endpointUrl = 'https://dbpedia.org/sparql';

  try {
    const response = await fetch(endpointUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        query: query,
        format: 'json',
      }),
    });

    if (!response.ok) {
      throw new Error(`Erreur HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data.results.bindings;
  } catch (error) {
    console.error('Requête échouée :', query); // Log de la requête
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
    //const url = `https://dbpedia.org/sparql?query=${encodeURIComponent(
    //  generateSparqlQueryPlat(name)
    //)}&format=json`;
    const query = generateSparqlQueryPlat(name);
    const url = `https://dbpedia.org/sparql?query=${encodeURIComponent(query)}&format=json`;

    const response = await fetch(url);
    const json = await response.json();

    if (!json.results.bindings.length) {
      throw new Error(`Aucun résultat trouvé pour "${name}".`);
    }

    const result = json.results.bindings[0];

// Récupération des ingrédients uniques
const ingredients = result.ingredients?.value
  ? result.ingredients.value.split(", ") // Cas où `ingredients.value` existe
  : [...new Set( // Cas où les ingrédients sont dans des bindings individuels
      json.results.bindings
        .filter((binding) => binding.ingredient?.value)
        .map((binding) => cleanDbpediaResource(binding.ingredient.value))
    )];


    return {
      nom: result.dishLabel?.value || 'Nom inconnu',
      description: result.abstract?.value || 'Pas de description disponible.',
      origine: result.origine?.value ? cleanDbpediaResource(result.origine.value) : 'Origine inconnue',
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
      lieuNaissance: cleanDbpediaResource(result.birthPlace?.value) || 'Lieu de naissance inconnu',
      image: result.image?.value || null,
    };
  } catch (error) {
    console.error('Erreur dans fetchChefData :', error.message);
    throw error;
  }
}

export async function fetchCuisineData(cuisineName) {
  try {
    const cleanedName = cuisineName.replace(/%20/g, ' ');
    const query = generateSparqlQueryCuisine(cleanedName);
    const url = `https://dbpedia.org/sparql?query=${encodeURIComponent(query)}&format=json`;

    //console.log("Requête SPARQL Cuisine :", query); // Log de la requête
    const response = await fetch(url);
    const json = await response.json();

    if (!json.results.bindings.length) {
      console.warn(`Aucun résultat trouvé pour "${cleanedName}"`);
      return {
        nom: cleanedName,
        description: "Aucune donnée disponible pour cette cuisine.",
        image: null,
        plats: [],
      };
    }

    const result = json.results.bindings[0];

    return {
      nom: result.cuisineLabel?.value ? result.cuisineLabel?.value.replace(/%20/g, ' ') : 'Nom inconnu',
      description: result.description?.value || 'Pas de description disponible.',
      image: result.image?.value || null,
      plats : result.dishes?.value.split(", ").map((dish) => cleanDbpediaResource(dish)) || [],
    };
  } catch (error) {
    console.error('Erreur dans fetchCuisineData :', error.message);
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
  return "Inconnu";  // Retourne une valeur par défaut si l'URL est invalide
}


