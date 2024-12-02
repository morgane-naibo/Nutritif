





// On précise que cette fonction est asynchrone pour ne pas bloquer le navigateur
  // pendant que la requête SPARQL est traitée par DBPedia.
  // On utilise une requête HTTP pour interroger le moteur SPARQL de DBPedia.
export default async function requeteChef() {

    // On récupère le contenu de la requête à envoyer au moteur SPARQL de DBPedia
    var requete = document.getElementById("searchQuery").value;

   // Construire la requête SPARQL avec un filtre sur la langue et le nom
    var contenu_requete = "PREFIX dbo: <http://dbpedia.org/ontology/> " +
    "PREFIX dbr: <http://dbpedia.org/resource/> " +
    "SELECT ?chef ?chefLabel ?naissance ?description " +
    "WHERE { " +
    "?chef a dbo:Person ; " +
    "rdfs:label ?chefLabel ; " +
    "dbo:birthDate ?naissance ; " +
    "dbo:abstract ?description . " +
    "FILTER (?chefLabel = \"" + requete + "\"@fr && LANG(?description) = \"fr\") " + // Filtrage sur le label et la langue de la description
    "}";
    // On encode la requête SPARQL, puis on forme l'URL à transmettre à DBPedia
    // On précise également que l'on veut les résultats de la requête au format JSON
    var url_base = "http://dbpedia.org/sparql";
    var url = url_base + "?query=" + encodeURIComponent(contenu_requete) + "&format=json";

    // On envoie la requête au serveur de manière asynchrone (à l'aide du mot clé "await")
    const reponse = await fetch(url);

    // On parse les résultats de la requête, qui sont placés dans un objet JavaScript
    const data = await reponse.json();

    // L'objet data contient les résultats de la requête. Il faut étudier la structure de cet objet
    // pour les insérer dans les différentes pages de votre application.
    console.log(data);
    afficherResultats(data);
  }

  // Affichage des résultats dans un tableau
  function afficherResultats(data)
  {
    // Tableau pour mémoriser l'ordre des variables ; sans doute pas nécessaire
    // pour vos applications, c'est juste pour la démo sous forme de tableau
    var index = [];

    var contenuTableau = "<tr>";

    data.head.vars.forEach((v, i) => {
      contenuTableau += "<th>" + v + "</th>";
      index.push(v);
    });

    // Les résultats de la requête sont contenus dans l'objet "bindings".
    // Il y a un binding par résultat. Pour chaque binding, vous pouvez
    // accéder à la valeur d'une variable avec la syntaxe binding[variable].value .
    // Ici, on construit le code HTML du tableau de résultats, et on insère ce code
    // dans l'élément "resultats" de la page. 
    data.results.bindings.forEach(r => {
      contenuTableau += "<tr>";

      index.forEach(v => {

        if (r[v])
        {
          if (r[v].type === "uri")
          {
            contenuTableau += "<td><a href='" + r[v].value + "' target='_blank'>" + r[v].value + "</a></td>";
          }
          else {
            contenuTableau += "<td>" + r[v].value + "</td>";
          }
        }
        else
        {
          contenuTableau += "<td></td>";
        }
        
      });


      contenuTableau += "</tr>";
    });


    contenuTableau += "</tr>";

    document.getElementById("resultats").innerHTML = contenuTableau;

  }