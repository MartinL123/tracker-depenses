# Tracker Dépenses

Application de tracking de dépenses (~200€ récurrents). Objectif : espacer le plus possible les achats dans le temps.

## Fichiers
- `index.html` — fichier unique, prod sur GitHub Pages
- Pas de build tool, pas de node_modules, pas de bundler

## Déploiement
- **Prod** : https://martinl123.github.io/tracker-depenses/
- **Repo** : https://github.com/MartinL123/tracker-depenses
- Déploiement automatique via GitHub Pages sur la branche `main`
- Pour déployer : `git add index.html && git commit -m "..." && git push`

## Architecture (post-refactor mars 2026)
- `ORIG_DATA` = constante seed uniquement (22 achats historiques hardcodés)
- `DATA` = unique source de vérité, vient entièrement de Firebase via `setData()`
- Plus de distinction ORIG/EXTRAS — tout dans Firebase
- Auto-seed : si Firebase vide au 1er chargement → seed avec ORIG_DATA
- `saveAchats()` / `saveJ()` avec try/catch + toast rouge sur erreur

## Firebase
```js
const firebaseConfig = {
  apiKey: "AIzaSyA8tPw48yaI8zCdhSLJXZdCWrKx9bm20Gg",
  authDomain: "tracker-depenses.firebaseapp.com",
  projectId: "tracker-depenses",
  storageBucket: "tracker-depenses.firebasestorage.app",
  messagingSenderId: "622273985032", // ⚠️ deux 2 consécutifs — ne jamais modifier
  appId: "1:622273985032:web:dc17d4e5c0da2a58746fbd"
};
```
- `tracker/achats` → `{ entries: [{date, amount}] }` — toujours objets, jamais tableaux imbriqués
- `tracker/jlog` → `{ log: [...] }`
- Firebase 10.12.0 via CDN gstatic, `<script type="module">`

## UI — deux sections
**Section J (haut)** : stats Total J / J par sachet / J par achat / Sachet en cours, progression sachets (5 par achat), gros bouton rond J, log 30 dernières entrées
**Section Achats (bas)** : stats intervalle, graphique canvas intervalle, dépenses par mois, formulaire ajout, tableau historique

Badges intervalle : vert ≥20j / orange ≥10j / rouge <10j
Suppression : clic ligne → bouton 🗑 rouge circulaire (SVG 32px dans `<td>`) — toutes les entrées sont supprimables

## Style guide
```
--bg: #141414  --bg2: #1d1d1d  --bg3: #252525  --border: #2e2e2e
--blue: #3a86ff  --green: #61d180  --yellow: #fec84b  --red: #f04438
--text: #eef0f7  --muted: #5f5f5e  --muted2: #888
```
Police : Poppins · Fond grille CSS `rgba(58,134,255,0.04)` 40px · Cards border-radius 20px
Responsive 640px : stats 2 colonnes, sachets 2 colonnes

## Bugs historiques à ne jamais reproduire
1. **Nested arrays Firestore** : toujours `{date, amount}`, jamais `[date, amount]`
2. **messagingSenderId** : `622273985032` — une faute de frappe casse tout silencieusement
3. **`await` hors `async`** : les callbacks `setTimeout` doivent être `async` si elles await
4. **`<button>` enfant direct de `<tr>`** : HTML invalide, éjecté du DOM — toujours dans un `<td>`
