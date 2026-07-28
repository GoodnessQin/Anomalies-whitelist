from pathlib import Path

app_path = Path('src/App.jsx')
text = app_path.read_text(encoding='utf-8')
old = '''  const handleCheck = async () => {
    setResult(null);
    if (!isValidEth(addr)) {
      setResult({ error: "Enter a valid EVM address (0x + 40 hex characters)." });
      return;
    }
    setChecking(true);
    const list = await getApplications();
    const entry = list.find((a) => a.wallet.toLowerCase() === addr.trim().toLowerCase());
    setChecking(false);
    if (entry) {
      setResult({ found: true, entry });
    } else {
      setResult({ found: false });
    }
  };'''
new = '''  const handleCheck = async () => {
    setResult(null);
    if (!isValidEth(addr)) {
      setResult({ error: "Enter a valid EVM address (0x + 40 hex characters)." });
      return;
    }
    setChecking(true);
    const sheetList = await getApplicationsFromSheet();
    const list = sheetList.length > 0 ? sheetList : await getApplications();
    const entry = list.find((a) => (a.wallet || "").toLowerCase() === addr.trim().toLowerCase());
    setChecking(false);
    if (entry) {
      setResult({ found: true, entry });
    } else {
      setResult({ found: false });
    }
  };'''
if old not in text:
    raise SystemExit('Could not find exact checker function block to patch.')
app_path.write_text(text.replace(old, new, 1), encoding='utf-8')
print('App.jsx checker function patched')
