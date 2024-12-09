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
  }

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
  
