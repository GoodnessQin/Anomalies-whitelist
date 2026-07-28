from pathlib import Path

# Patch src/storage.js
storage_path = Path('src/storage.js')
text = storage_path.read_text(encoding='utf-8')
old = 'export const getApplications = () => readKey(APPLICATIONS_KEY, []);\nexport const saveApplications = (list) => writeKey(APPLICATIONS_KEY, list);\nexport const getApplicationsFromSheet = () => fetchGoogleSheetRows();\nexport const getExtraGallery = () => readKey(GALLERY_KEY, []);\nexport const saveExtraGallery = (list) => writeKey(GALLERY_KEY, list);\n'
new = 'const GOOGLE_SHEET_ID = "1osfCgLcoFKaNKtlv5bjqmT0hcXAxSjrIPwc9XNL9b3w";\nconst GOOGLE_SHEET_TAB = "Sheet1";\nconst GOOGLE_SHEET_WRITE_URL = ""; // set your Apps Script web app URL here\n\nasync function postApplicationToGoogleSheet(entry) {\n  if (!GOOGLE_SHEET_WRITE_URL) return true;\n  try {\n    const res = await fetch(GOOGLE_SHEET_WRITE_URL, {\n      method: "POST",\n      headers: { "Content-Type": "application/json" },\n      body: JSON.stringify(entry),\n    });\n    return res.ok;\n  } catch (e) {\n    return false;\n  }\n}\n\nexport const getApplications = () => readKey(APPLICATIONS_KEY, []);\nexport const saveApplications = (list) => writeKey(APPLICATIONS_KEY, list);\nexport const getApplicationsFromSheet = () => fetchGoogleSheetRows();\nexport const saveApplicationToSheet = (entry) => postApplicationToGoogleSheet(entry);\nexport const getExtraGallery = () => readKey(GALLERY_KEY, []);\nexport const saveExtraGallery = (list) => writeKey(GALLERY_KEY, list);\n'
if old not in text:
    raise SystemExit('storage.js anchor not found')
storage_path.write_text(text.replace(old, new), encoding='utf-8')

# Patch App.jsx
app_path = Path('src/App.jsx')
text = app_path.read_text(encoding='utf-8')
old_import = 'import { getApplications, saveApplications, getExtraGallery, getApplicationsFromSheet } from "./storage.js";\n'
new_import = 'import { getApplications, saveApplications, getExtraGallery, getApplicationsFromSheet, saveApplicationToSheet } from "./storage.js";\n'
if old_import not in text:
    raise SystemExit('App.jsx import anchor not found')
text = text.replace(old_import, new_import, 1)
old_handle = ('    const ok = await saveApplications(list);\n'
               '    setSubmitting(false);\n'
               '    if (ok) {\n'
               '      setStatus({ type: "success", msg: "Application received! Head to Checker any time to see your status." });\n'
               '    } else {\n'
               '      setStatus({ type: "error", msg: "Couldn\'t save right now — please try again." });\n'
               '    }\n')
new_handle = ('    const okLocal = await saveApplications(list);\n'
              '    const okSheet = await saveApplicationToSheet(entry);\n'
              '    setSubmitting(false);\n'
              '    if (okLocal && okSheet) {\n'
              '      setStatus({ type: "success", msg: "Application received! Head to Checker any time to see your status." });\n'
              '    } else if (okLocal) {\n'
              '      setStatus({ type: "success", msg: "Application saved locally. Sheet write was skipped or failed." });\n'
              '    } else {\n'
              '      setStatus({ type: "error", msg: "Couldn\'t save right now — please try again." });\n'
              '    }\n')
if old_handle not in text:
    raise SystemExit('App.jsx handleSubmit anchor not found')
text = text.replace(old_handle, new_handle, 1)
app_path.write_text(text, encoding='utf-8')
print('patched')
