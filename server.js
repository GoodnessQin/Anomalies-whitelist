import express from 'express';
import cors from 'cors';
import { google } from 'googleapis';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.post('/api/applications', async (req, res) => {
  try {
    const entry = req.body || {};
    const spreadsheetId = process.env.GOOGLE_SHEET_ID || '1osfCgLcoFKaNKtlv5bjqmT0hcXAxSjrIPwc9XNL9b3w';
    const sheetName = process.env.GOOGLE_SHEET_TAB || 'Sheet1';

    const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
    const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;

    if (!privateKey || !clientEmail) {
      return res.status(500).json({ success: false, error: 'Missing Google service account credentials.' });
    }

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: clientEmail,
        private_key: privateKey,
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    const row = [
      entry.Username || '',
      entry.CommentLink || '',
      entry.QtLink || '',
      entry.Wallet || '',
      entry.submittedAt || new Date().toISOString(),
      entry.status || 'pending',
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${sheetName}!A:G`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [row],
      },
    });

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message || 'Failed to write to spreadsheet' });
  }
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
