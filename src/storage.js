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

export const getApplications = () => readKey(APPLICATIONS_KEY, []);
export const saveApplications = (list) => writeKey(APPLICATIONS_KEY, list);
export const getExtraGallery = () => readKey(GALLERY_KEY, []);
export const saveExtraGallery = (list) => writeKey(GALLERY_KEY, list);
