// ==UserScript==
// @name         Gnuzlocke Live Sync
// @namespace    gnuzlocke-live-sync
// @version      1.0
// @description  Live sync for Nuzlocke Redux → Firebase
// @match        https://nuzlocke-redux.vercel.app/*
// @grant        GM_xmlhttpRequest
// @updateURL    https://raw.githubusercontent.com/drago5212/gnuzlocke-tm-script/main/gnuzlocke-tm-script.user.js
// @downloadURL  https://raw.githubusercontent.com/drago5212/gnuzlocke-tm-script/main/gnuzlocke-tm-script.user.js
// ==/UserScript==

(() => {
  console.log("[Gnuzlocke Sync] Loaded v1.0");

  const FIREBASE_DB_URL =
    "https://ghsotie-nuzlocke-default-rtdb.europe-west1.firebasedatabase.app";
  const RUN_ID = "ghsotie-run";

  let lastHash = null;

  function hash(str) {
    let h = 0;
    for (let i = 0; i < str.length; i++) {
      h = ((h << 5) - h) + str.charCodeAt(i);
      h |= 0;
    }
    return h;
  }

  function getActiveRunData() {
    const saveId = localStorage.getItem("nuzlocke");
    if (!saveId) return null;
    return localStorage.getItem(`nuzlocke.${saveId}`);
  }

  function sendToFirebase(payload) {
    GM_xmlhttpRequest({
      method: "PUT",
      url: `${FIREBASE_DB_URL}/runs/${RUN_ID}.json`,
      headers: { "Content-Type": "application/json" },
      data: JSON.stringify(payload),
      onload: res =>
        console.log("[Gnuzlocke Sync] Firebase updated", res.status),
      onerror: err =>
        console.error("[Gnuzlocke Sync] Firebase error", err)
    });
  }

  function sync() {
    const raw = getActiveRunData();
    if (!raw) return;

    const h = hash(raw);
    if (h === lastHash) return;
    lastHash = h;

    try {
      sendToFirebase({
        updatedAt: Date.now(),
        state: JSON.parse(raw)
      });
    } catch (e) {
      console.error("[Gnuzlocke Sync] Parse error", e);
    }
  }

  setInterval(sync, 1000);
})();
