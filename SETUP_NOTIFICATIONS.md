# Activer les notifications push

Le code est en place (manifest PWA, service worker, bannière "Activer",
Cloud Function planifiée) mais **3 étapes manuelles côté Firebase Console
et CLI sont nécessaires** avant que ça fonctionne — impossible de les
automatiser depuis ici.

## 1. Passer le projet Firebase en plan Blaze

Les fonctions planifiées (`onSchedule`, tous les soirs à 21h) nécessitent
Cloud Scheduler, qui exige le plan **Blaze** (pay-as-you-go). L'usage réel
ici (1 exécution/jour) reste dans le tier gratuit de Cloud Functions, mais
le plan Blaze doit être activé :

Firebase Console → ⚙️ Paramètres du projet → Utilisation et facturation →
Modifier le forfait → Blaze.

## 2. Générer la clé VAPID et la coller dans `index.html`

Firebase Console → ⚙️ Paramètres du projet → Cloud Messaging → onglet
"Web configuration" → **Certificats Web Push** → "Générer une paire de clés".

Copier la clé générée dans `index.html`, ligne :

```js
const VAPID_KEY = 'REMPLACER_PAR_TA_CLE_VAPID';
```

Tant que ce placeholder n'est pas remplacé, le bouton "Activer" affiche
une erreur — c'est le garde-fou attendu.

## 3. Déployer la Cloud Function

```bash
npm install -g firebase-tools   # si pas déjà installé
firebase login
cd tracker-depenses
firebase deploy --only functions
```

## Comment ça marche une fois déployé

- L'app enregistre `firebase-messaging-sw.js` comme service worker et
  demande la permission de notifications via la bannière en haut de
  l'écran Consommation (une fois acceptée, le token FCM est stocké dans
  `tracker/device`).
- La Cloud Function `dailyJReminder` tourne tous les soirs à 21h
  (Europe/Paris). Si `tracker/jlog` ne contient aucune entrée `j` pour la
  date du jour, elle envoie une notif push au token stocké :
  *"Tu as oublié de logger tes J aujourd'hui ?"*

## Contrainte iOS

Fonctionne uniquement sur iOS 16.4+ **et** si l'app est installée sur
l'écran d'accueil (Safari → partager → "Sur l'écran d'accueil"). Dans un
onglet Safari classique, les notifications web ne sont pas supportées sur
iOS.
