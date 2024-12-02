// requetes.js

// Fonction pour générer la requête SPARQL pour DBpedia en fonction du terme de recherche
export function generateSparqlQuery(plat) {
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

  export function afficherResultats(data) {
    // Vérifier si la réponse contient des résultats valides
    if (!data || !data.results || !data.results.bindings) {
      console.error("Aucun résultat trouvé ou la réponse SPARQL est mal formatée.");
      return;  // Retourner sans rien afficher si les données sont invalides
    }
  
    let contenuTableau = "<table>";
  
    // Vérifier si des résultats sont présents dans les bindings
    data.results.bindings.forEach(r => {
      contenuTableau += "<tr>";  // Début de la ligne de tableau
  
      for (const v in r) {
        if (r.hasOwnProperty(v)) {
          if (r[v]) {
            if (r[v].type === "uri") {
              contenuTableau += `<td><a href="${r[v].value}" target="_blank">${r[v].value}</a></td>`;
            } else {
              contenuTableau += `<td>${r[v].value}</td>`;
            }
          } else {
            contenuTableau += "<td></td>";
          }
        }
      }
  
      contenuTableau += "</tr>";  // Fin de la ligne de tableau
    });
  
    contenuTableau += "</table>";  // Fin du tableau
  
    // Ajouter le contenu du tableau dans l'élément HTML avec l'ID "resultats"
    document.getElementById("resultats").innerHTML = contenuTableau;
  }
  