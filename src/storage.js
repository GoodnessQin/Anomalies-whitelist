/*
  This is the "backend" for the app.

  Locally (npm run dev) it just uses the browser's localStorage, so data
  only lives on your own machine and won't be shared between visitors.

  When this same code runs inside a Claude.ai artifact, `window.storage`
  exists and is used instead — that's a real shared, persistent store.

  When you're ready to go live for real, replace the bodies of these four
  functions with calls to your own backend (fetch("/api/applications"), etc).
  Every other component in the app only talks to these four functions, so
  that's the only file you need to touch.
*/

const APPLICATIONS_KEY = "anomalies:applications";
const GALLERY_KEY = "anomalies:gallery-extra";

const hasClaudeStorage = () =>
  typeof window !== "undefined" && window.storage;

async function readKey(key, fallback) {
  if (hasClaudeStorage()) {
    try {
      const res = await window.storage.get(key, true);
      return res ? JSON.parse(res.value) : fallback;
    } catch (e) {
      return fallback;
    }
  }
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    return fallback;
  }
}

async function writeKey(key, value) {
  if (hasClaudeStorage()) {
    try {
      await window.storage.set(key, JSON.stringify(value), true);
      return true;
    } catch (e) {
      return false;
    }
  }
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (e) {
    return false;
  }
}

async function fetchGoogleSheetRows() {
  if (!GOOGLE_SHEET_ID) return [];
  const url = `https://docs.google.com/spreadsheets/d/${GOOGLE_SHEET_ID}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(GOOGLE_SHEET_TAB)}`;
  try {
    const res = await fetch(url);
    if (!res.ok || res.url.includes("ServiceLogin")) return null;
    const raw = await res.text();
    const json = JSON.parse(raw.replace(/^.*?\(/s, "").replace(/\);?$/, ""));
    const cols = json.table.cols.map((col) => (col.label || col.id || "").toString().trim());
    const rows = json.table.rows.map((row) => row.c.map((cell) => cell?.v ?? ""));

    let headers = cols;
    let dataRows = rows;
    const genericHeaders = headers.every((h, idx) => h === "" || h === String.fromCharCode(65 + idx));
    if (genericHeaders && rows.length > 0) {
      headers = rows[0].map((value) => String(value || "").trim());
      dataRows = rows.slice(1);
    }

    const roleForIndex = headers.map((c) => {
      const low = (c || "").toLowerCase();
      if (low.includes("wallet") || low.includes("address")) return "wallet";
      if (low.includes("user") || low.includes("username") || low.includes("handle")) return "username";
      if (low.includes("tag") || low.includes("comment") || low.includes("mention")) return "commentLink";
      if (low.includes("qt") || low.includes("quote")) return "qtLink";
      if (low.includes("status")) return "status";
      if (low.includes("submitted") || low.includes("date") || low.includes("time")) return "submittedAt";
      return null;
    });

    return dataRows.map((row) => {
      const item = {};
      row.forEach((rawValue, idx) => {
        const cellValue = String(rawValue || "");
        const role = roleForIndex[idx];
        if (role === "wallet") item.wallet = cellValue;
        else if (role === "username") item.username = cellValue;
        else if (role === "commentLink") item.commentLink = cellValue;
        else if (role === "qtLink") item.qtLink = cellValue;
        else if (role === "status") item.status = cellValue;
        else if (role === "submittedAt") item.submittedAt = cellValue;
        else item[headers[idx] || `col${idx}`] = cellValue;
      });
      return item;
    });
  } catch (e) {
    return null;
  }
}

const GOOGLE_SHEET_ID = "1osfCgLcoFKaNKtlv5bjqmT0hcXAxSjrIPwc9XNL9b3w";
const GOOGLE_SHEET_TAB = "Anomalies-whitelist";
const GOOGLE_SHEET_WRITE_URL = "/api/applications";

async function postApplicationToGoogleSheet(entry) {
  if (!GOOGLE_SHEET_WRITE_URL) return true;
  try {
    const res = await fetch(GOOGLE_SHEET_WRITE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(entry),
    });
    return res.ok;
  } catch (e) {
    return false;
  }
}

export const getApplications = () => readKey(APPLICATIONS_KEY, []);
export const saveApplications = (list) => writeKey(APPLICATIONS_KEY, list);
export const getApplicationsFromSheet = () => fetchGoogleSheetRows();
export const saveApplicationToSheet = (entry) => postApplicationToGoogleSheet(entry);
export const getExtraGallery = () => readKey(GALLERY_KEY, []);
export const saveExtraGallery = (list) => writeKey(GALLERY_KEY, list);
