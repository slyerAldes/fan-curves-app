const express = require("express");
const path = require("path");
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

const app = express();
const cors = require("cors");

app.use(cors()); // permet toutes les origines par défaut
app.use(express.text({ type: "text/xml" })); // pour les requêtes XML
// Sert tous les fichiers statiques du dossier public
app.use(express.static(path.join(__dirname, "public")));

// Optionnel : page d’accueil par défaut
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public/index.html"));
});

app.post("/soapproxy", async (req, res) => {
  try {
    const xml = req.body;
    // Récupère le header SOAPAction s'il existe, sinon utilise celui par défaut
    let soapAction = req.headers["soapaction"];
    if (!soapAction) {
      soapAction = "http://tempuri.org/CalcFanWithJPGCurves";
    }

    // Requête vers le web service SOAP distant
    console.log("Body reçu :", xml);
    console.log("SOAPAction utilisé :", soapAction);

    const response = await fetch(
      "http://ispac.ddns.net:3999/Delair/Service1.asmx?op=CalcFanWithJPGCurves",
      {
        method: "POST",
        headers: {
          "Content-Type": "text/xml; charset=utf-8",
          SOAPAction: soapAction,
        },
        body: xml,
      }
    );
    const xmlResponse = await response.text();
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.send(xmlResponse);
  } catch (err) {
    console.error("Erreur proxy :", err);
    res.status(500).send("Erreur : " + err.message);
  }
});

app.listen(3005, () => {
  console.log("Proxy SOAP actif sur http://localhost:3005/soapproxy");
});
