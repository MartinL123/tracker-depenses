# Tracker Dépenses

Application de tracking de dépenses (~200€ récurrents) et de consommation de J. Objectif : espacer le plus possible les achats et réduire la conso de J dans le temps.

## Fichiers
- `index.html` — l'app elle-même (UI + logique), toujours un seul fichier
- `manifest.json`, `firebase-messaging-sw.js`, `icons/` — PWA + notifications push (voir `SETUP_NOTIFICATIONS.md`)
- `functions/` — Cloud Function planifiée (rappel push 21h), déployée séparément via Firebase CLI
- Pas de build tool, pas de bundler pour `index.html`

## Déploiement
- **Prod** : https://martinl123.github.io/tracker-depenses/
- **Repo** : https://github.com/MartinL123/tracker-depenses
- Déploiement automatique via GitHub Pages sur la branche `main`
- Pour déployer : `git add -A && git commit -m "..." && git push`
- `functions/` ne se déploie PAS via GitHub Pages — voir `SETUP_NOTIFICATIONS.md` (`firebase deploy --only functions`)

## Architecture (post-refonte v2, design Figma)
- `ORIG_DATA` = constante seed uniquement (achats historiques hardcodés)
- `DATA` = unique source de vérité, vient entièrement de Firebase via `setData()`
- Auto-seed : si Firebase vide au 1er chargement → seed avec ORIG_DATA
- `saveAchats()` / `saveJ()` avec try/catch + toast rouge sur erreur
- `J_LOG` : entrées `{type:'j', ts, sachet}` uniquement — `sachet` = nb d'achats au moment du log (pas de fermeture manuelle de sachet, retirée car absente du Figma)
- Les anciennes entrées `jlog` de type `fin`/`predicted` (ancienne UI) sont filtrées silencieusement, pas supprimées, pour compat avec les données existantes

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
- `tracker/device` → `{ token, updatedAt }` — token FCM pour les notifications push
- Firebase 10.12.0 via CDN gstatic, `<script type="module">`

## UI — mobile-first, calqué sur Figma (node-id=6-3)
Header commun : hero "jours depuis dernier achat" + barre de progression + 3 stats, tabs Consommation (bleu) / Achat (vert).

**Tab Consommation** : grille 2×4 de stats, calendrier mensuel navigable, graphique 12 mois J consommés, historique de conso par jour (heure éditable, picker natif `datetime-local`), FAB J + annuler toujours visible.

**Tab Achats** : formulaire ajout, cards moy. intervalle/record, graphique 12 mois € dépensé, historique d'achat par mois.

Suppression : clic ligne → bouton 🗑 rouge circulaire (SVG 32px) inline dans la grille de la ligne — toutes les entrées sont supprimables.

### Couleurs
- Header jours + barre de progression : vert si ≥ moyenne, jaune si 10 ≤ jours < moyenne, rouge si < 10
- Badges intervalle achat : vert ≥20j / jaune ≥10j / rouge <10j
- Graphique € dépensé/mois : vert <200€ / jaune 200-400€ / rouge ≥400€
- Graphique J/mois : vert <15J / jaune 15-50J / rouge >50J

## Notifications push (PWA)
Rappel push si aucun J loggé le jour à 21h. Nécessite 3 étapes manuelles (plan Blaze, clé VAPID, `firebase deploy`) — voir `SETUP_NOTIFICATIONS.md`. Fonctionne uniquement sur iOS 16.4+ avec l'app installée sur l'écran d'accueil.

## Style guide
```
--bg: #141414  --surface: #1d1d1d  --border: #2e2e2e
--blue: #3a86ff  --green: #61d180  --yellow: #fec84b  --red: #f04438
--text: #f5f5f5  --muted: #6b7280
```
Police : Poppins · Fond grille CSS `rgba(58,134,255,0.04)` 40px · Cards border-radius 16px · App centrée max-width 480px

## Bugs historiques à ne jamais reproduire
1. **Nested arrays Firestore** : toujours `{date, amount}`, jamais `[date, amount]`
2. **messagingSenderId** : `622273985032` — une faute de frappe casse tout silencieusement
3. **`await` hors `async`** : les callbacks `setTimeout` doivent être `async` si elles await
4. **`<button>` enfant direct de `<tr>`** : HTML invalide, éjecté du DOM — toujours dans un `<td>` (n'applique plus : l'UI v2 n'utilise plus de `<table>`, mais rester vigilant si on en réintroduit une)
5. **Labels de graphique en `nowrap`** : casse l'alignement des barres si le texte wrap différemment selon les colonnes — toujours forcer un nombre de lignes fixe (`<br>`), jamais laisser wrapper naturellement
