from pathlib import Path

# Patch src/storage.js
storage = Path('src/storage.js')
text = storage.read_text(encoding='utf-8')
old = ('export const getApplications = () => readKey(APPLICATIONS_KEY, []);\n'
       'export const saveApplications = (list) => writeKey(APPLICATIONS_KEY, list);\n'
       'export const getExtraGallery = () => readKey(GALLERY_KEY, []);\n'
       'export const saveExtraGallery = (list) => writeKey(GALLERY_KEY, list);\n')
new = ('const GOOGLE_SHEET_ID = "1osfCgLcoFKaNKtlv5bjqmT0hcXAxSjrIPwc9XNL9b3w";\n'
       'const GOOGLE_SHEET_TAB = "Sheet1";\n\n'
       'async function fetchGoogleSheetRows() {\n'
       '  if (!GOOGLE_SHEET_ID) return [];\n'
       '  const url = `https://docs.google.com/spreadsheets/d/${GOOGLE_SHEET_ID}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(GOOGLE_SHEET_TAB)}`;\n'
       '  try {\n'
       '    const res = await fetch(url);\n'
       '    if (!res.ok) return [];\n'
       '    const raw = await res.text();\n'
       '    const json = JSON.parse(raw.replace(/^.*?\\(/s, "").replace(/\\);?$/, ""));\n'
       '    const cols = json.table.cols.map((col, idx) => (col.label || col.id || `col${idx}`).toString().trim());\n'
       '    return json.table.rows.map((row) => {\n'
       '      const item = {};\n'
       '      (row.c || []).forEach((cell, idx) => {\n'
       '        item[cols[idx]] = cell?.v ?? "";\n'
       '      });\n'
       '      return item;\n'
       '    });\n'
       '  } catch (e) {\n'
       '    return [];\n'
       '  }\n'
       '}\n\n'
       'export const getApplications = () => readKey(APPLICATIONS_KEY, []);\n'
       'export const saveApplications = (list) => writeKey(APPLICATIONS_KEY, list);\n'
       'export const getApplicationsFromSheet = () => fetchGoogleSheetRows();\n'
       'export const getExtraGallery = () => readKey(GALLERY_KEY, []);\n'
       'export const saveExtraGallery = (list) => writeKey(GALLERY_KEY, list);\n')
if old not in text:
    raise SystemExit('storage.js anchor not found')
storage.write_text(text.replace(old, new), encoding='utf-8')

# Patch src/App.jsx
app = Path('src/App.jsx')
text = app.read_text(encoding='utf-8')
old_import = 'import { getApplications, saveApplications, getExtraGallery } from "./storage.js";\n'
new_import = 'import { getApplications, saveApplications, getExtraGallery, getApplicationsFromSheet } from "./storage.js";\n'
if old_import not in text:
    raise SystemExit('App.jsx import anchor not found')
text = text.replace(old_import, new_import, 1)

old_checker = ('  const handleCheck = async () => {\n'
               '    setResult(null);\n'
               '    if (!isValidEth(addr)) {\n'
               '      setResult({ error: "Enter a valid EVM address (0x + 40 hex characters)." });\n'
               '      return;\n'
               '    }\n'
               '    setChecking(true);\n'
               '    const list = await getApplications();\n'
               '    const entry = list.find((a) => a.wallet.toLowerCase() === addr.trim().toLowerCase());\n'
               '    setChecking(false);\n'
               '    if (entry) {\n'
               '      setResult({ found: true, entry });\n'
               '    } else {\n'
               '      setResult({ found: false });\n'
               '    }\n'
               '  };\n')
new_checker = ('  const handleCheck = async () => {\n'
               '    setResult(null);\n'
               '    if (!isValidEth(addr)) {\n'
               '      setResult({ error: "Enter a valid EVM address (0x + 40 hex characters)." });\n'
               '      return;\n'
               '    }\n'
               '    setChecking(true);\n'
               '    const sheetList = await getApplicationsFromSheet();\n'
               '    const list = sheetList.length > 0 ? sheetList : await getApplications();\n'
               '    const entry = list.find((a) => (a.wallet || "").toLowerCase() === addr.trim().toLowerCase());\n'
               '    setChecking(false);\n'
               '    if (entry) {\n'
               '      setResult({ found: true, entry });\n'
               '    } else {\n'
               '      setResult({ found: false });\n'
               '    }\n'
               '  };\n')
if old_checker not in text:
    raise SystemExit('App.jsx checker anchor not found')
text = text.replace(old_checker, new_checker, 1)
app.write_text(text, encoding='utf-8')
print('patched')
