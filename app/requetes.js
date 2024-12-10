// requetes.js

// Fonction pour générer la requête SPARQL pour DBpedia en fonction du terme de recherche
// export function generateSparqlQueryPlat(plat) {
//     // Requête SPARQL pour rechercher un plat dans DBpedia
//     return `
//       SELECT DISTINCT ?dish ?dishLabel ?abstract ?image
//       WHERE {
//         ?dish rdf:type dbo:Food ;
//               rdfs:label ?dishLabel ;
//               dbo:abstract ?abstract ;
//               foaf:depiction ?image.
//         FILTER(LANG(?abstract) = "fr") 
//         FILTER(CONTAINS(LCASE(?dishLabel), "${plat.toLowerCase()}"))
//       }
//       LIMIT 15
//     `;
//   }

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

/*
  // Fonction pour générer la requête SPARQL pour DBpedia en fonction du terme de recherche
  export function generateSparqlQueryChef(chef) {
    const chefName = chef.replace(/^chef\s+/i, '').trim();

    // Requête SPARQL pour rechercher un chef dans DBpedia
    return `
    SELECT DISTINCT ?chef ?chefLabel ?naissance ?description 
    WHERE {
      ?chef a dbo:Chef ;
      rdfs:label ?chefLabel ;
      dbo:birthDate ?naissance ;
      dbo:abstract ?description .
      FILTER (LANG(?description) = "fr" && LANG(?chefLabel) = "fr")
      FILTER (CONTAINS(LCASE(?chefLabel), LCASE("${chefName}")))
    }
    `;
  }*/

  export function generateSparqlQueryCuisine(pays) {
    const paysName = pays.replace(/^cuisine\s+/i, '').trim();

    // Requête SPARQL pour rechercher une cuisine dans DBpedia
    return `
      SELECT DISTINCT ?cuisine ?cuisineLabel ?description
      WHERE {
        ?cuisine a dbo:Country ;
        a owl:Thing ;
        dbo:abstract ?description;
        rdfs:label ?cuisineLabel;
        dbo:wikiPageWikiLink ?dishes.
        FILTER (LANG(?cuisineLabel) = "fr" && LANG(?description) = "fr")
        FILTER (CONTAINS(LCASE(?cuisineLabel), LCASE("cuisine")) && CONTAINS(LCASE(?description), LCASE("${paysName}")))
        FILTER (CONTAINS(LCASE(STR(?dishes)), LCASE(STR("dish"))))
      }
      `;
  }
  
  export function generateSparqlQueryChef(chef) {
    const chefName = chef.replace(/^chef\s+/i, '').trim();
  
    return `
      SELECT DISTINCT ?chef ?chefLabel ?birthDate ?description ?birthPlace ?image
      WHERE {
        ?chef a dbo:Chef ;
              rdfs:label ?chefLabel ;
              dbo:abstract ?description .
        OPTIONAL { ?chef dbo:birthDate ?birthDate. }
        OPTIONAL { ?chef dbo:birthPlace ?birthPlace. }
        OPTIONAL { ?chef dbo:thumbnail ?image. }
        FILTER (LANG(?description) = "fr" || LANG(?description) = "en")
        FILTER (LANG(?chefLabel) = "fr" || LANG(?chefLabel) = "en")
        FILTER (STR(?chefLabel) = "${chefName}"@fr || STR(?chefLabel) = "${chefName}"@en)
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
}

// Fonction pour nettoyer une URL en ne gardant que le dernier segment
export function cleanDbpediaResource(url) {
  if (url) {
    const segments = url.split('/');
    return segments[segments.length - 1].replace(/_/g, ' '); // Supprime les underscores et garde la fin
  }
  return 'Inconnu'; // Retourne une valeur par défaut si l'URL est invalide
}

export async function fetchPlatData(name) {
  const url = `https://dbpedia.org/sparql?query=${encodeURIComponent(
    requete_profil_plat(name)
  )}&format=json`;

  try {
    const response = await fetch(url);
    const json = await response.json();

    if (!json.results.bindings.length) {
      throw new Error('Aucun résultat trouvé.');
    }

    const ingredients = json.results.bindings
      .filter((binding) => binding.ingredient?.value)
      .map((binding) => cleanDbpediaResource(binding.ingredient.value));

    const result = json.results.bindings[0];

    return {
      nom: result.name?.value || 'Nom inconnu',
      description: result.description?.value || 'Pas de description disponible.',
      origine: cleanDbpediaResource(result.origin?.value),
      ingredients: [...new Set(ingredients)],
      image: result.image?.value || null,
    };
  } catch (error) {
    throw error;
  }
}
export async function fetchChefData(chefName) {
  const url = `https://dbpedia.org/sparql?query=${encodeURIComponent(
    generateSparqlQueryChef(chefName)
  )}&format=json`;

  try {
    const response = await fetch(url);
    const json = await response.json();

    console.log('Résultats SPARQL pour le chef :', json.results.bindings); // Debugging

    if (!json.results.bindings.length) {
      throw new Error(`Aucun résultat trouvé pour ce chef : "${chefName}".`);
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
    console.error('Erreur lors de la récupération des données du chef :', error);
    throw error;
  }
}
