# Cardio Maison

Application web (PWA) d'entraînement à la maison, sans matériel : ventre, haut du corps ou séance complète, de 10 à 30 minutes.

## Fichiers

- `index.html` — toute l'application (écrans, exercices, minuteur, suivi).
- `mannequin3d.js` — animations 3D des exercices (fichier généré, ne pas modifier à la main).
- `src/anims.js` — les poses clés de chaque exercice (c'est ici qu'on ajuste une animation).
- `src/mannequin3d.js` — le moteur 3D (mannequin, caméra, contact au sol).

## Modifier une animation

1. Ajuster les angles dans `src/anims.js` (la légende des paramètres est en haut du fichier).
2. Regénérer le fichier : `npm install` (une fois) puis `npm run build`.
3. Commiter `src/` **et** `mannequin3d.js`.

Si le téléphone ne gère pas la 3D (WebGL), l'app affiche automatiquement les anciens dessins.

## Mode « Réveil en douceur »

Retire les exercices à sauts ou à impact (jumping jacks, burpees, montées de genoux, squats sautés…), ajoute des exercices doux (jacks sans saut, marche genoux levés, squats, fentes arrière, genou-coude debout, rotations du buste) et passe en intensité « Doux ».

## Sources des exercices et conseils

Les exercices ajoutés (pont fessier, bird dog, planche sur les genoux, chat-vache, pompes contre le mur, cobra) et les conseils de sécurité 💡 s'inspirent de :

- Mayo Clinic — *Exercises to improve your core strength* (mayoclinic.org)
- British Heart Foundation — *Strength exercises you can do at home* (bhf.org.uk)
- American Council on Exercise (ACE) — *At-Home (No Equipment) Workout* et Exercise Library (acefitness.org)

Planche sur les genoux, chat-vache, pompes contre le mur et cobra sont réservés au mode « Réveil en douceur ».
