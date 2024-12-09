// requetes.js

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


  // Fonction pour générer la requête SPARQL pour DBpedia en fonction du terme de recherche
  export function generateSparqlQueryChef(chef) {
    const chefName = chef.replace(/^chef\s+/i, '').trim();

    // Requête SPARQL pour rechercher un chef dans DBpedia
    return `
    SELECT DISTINCT ?chef ?chefLabel ?naissance ?description ?image
    WHERE {
      ?chef a dbo:Chef ;
      rdfs:label ?chefLabel ;
      dbo:birthDate ?naissance ;
      dbo:thumbnail ?image;
      dbo:abstract ?description .
      FILTER (LANG(?description) = "fr" && LANG(?chefLabel) = "fr")
      FILTER (CONTAINS(LCASE(?chefLabel), LCASE("${chefName}")))
    }
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
  
