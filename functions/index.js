const { onSchedule } = require("firebase-functions/v2/scheduler");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const { getMessaging } = require("firebase-admin/messaging");

initializeApp();

const TZ = "Europe/Paris";

// Tous les soirs à 21h : si aucun J loggé aujourd'hui, envoie une notif push.
exports.dailyJReminder = onSchedule(
  { schedule: "0 21 * * *", timeZone: TZ },
  async () => {
    const db = getFirestore();
    const todayKey = new Date().toLocaleDateString("fr-CA", { timeZone: TZ }); // YYYY-MM-DD

    const jlogSnap = await db.doc("tracker/jlog").get();
    const log = jlogSnap.data()?.log || [];
    const hasToday = log.some((e) => {
      if (e.type !== "j" || e.predicted) return false;
      const key = new Date(e.ts).toLocaleDateString("fr-CA", { timeZone: TZ });
      return key === todayKey;
    });
    if (hasToday) return;

    const deviceSnap = await db.doc("tracker/device").get();
    const token = deviceSnap.data()?.token;
    if (!token) return;

    await getMessaging().send({
      token,
      notification: {
        title: "Tracker Dépenses",
        body: "Tu as oublié de logger tes J aujourd'hui ?",
      },
    });
  }
);
