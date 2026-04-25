# Apex Halo Pit Wall

Application F1 pour écran 7 pouces / Guition.

## Pourquoi cette version

La version HTML seule pouvait être bloquée par le navigateur à cause du CORS ou du mode fichier local.
Cette version utilise un serveur Node.js local qui sert de proxy propre :

- l'interface appelle `http://localhost:3000/api/...`
- le serveur récupère Jolpica, OpenF1, Open-Meteo et les tracés GeoJSON
- si une API externe ne répond pas, le serveur renvoie des données locales propres au lieu de casser l'app

## Lancer en local

```bash
npm install
npm start
```

Puis ouvrir :

```text
http://localhost:3000
```

## Pages

- Race : Race Hub + Live Timing + Session Schedule
- Standings : classement pilotes + constructeurs
- Results : dernier résultat
- Circuit : tracé circuit + voitures live/démo
- Setup : refresh, plein écran, demo cars, saison

## APIs utilisées côté serveur

- Jolpica F1 : calendrier, résultats, standings
- OpenF1 : positions, intervalles, coordonnées live
- Open-Meteo : météo circuit
- bacinger/f1-circuits : tracés GeoJSON

## Notes importantes

- Le vrai live dépend d'OpenF1. S'il n'y a pas de session live, l'app affiche clairement que le live est OFF.
- Le mode `Demo cars` permet de tester les voitures qui bougent sur le tracé même hors session.
- L'app démarre toujours avec des données locales si les APIs sont indisponibles.
