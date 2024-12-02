// requetes.js

// Fonction pour générer la requête SPARQL pour DBpedia en fonction du terme de recherche
export function generateSparqlQueryPlat(plat) {
    // Requête SPARQL pour rechercher un plat dans DBpedia
    return `
      SELECT ?dish ?dishLabel ?abstract
      WHERE {
        ?dish rdf:type dbo:Food ;
              rdfs:label ?dishLabel ;
              dbo:abstract ?abstract .
        FILTER(LANG(?abstract) = "en") 
        FILTER(CONTAINS(LCASE(?dishLabel), "${plat.toLowerCase()}"))
      }
      LIMIT 5
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
  
