import csv from 'csv-parser';
import { Readable } from 'stream';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { csvContent } = req.body;

    if (!csvContent) {
      return res.status(400).json({ error: "No CSV content provided" });
    }

    const emailList = [];
    
    // Convert string to stream
    const stream = new Readable();
    stream.push(csvContent);
    stream.push(null);

    // Parse CSV
    await new Promise((resolve, reject) => {
      stream
        .pipe(csv())
        .on("data", (row) => {
          if (row.email) {
            emailList.push({
              email: row.email.trim(),
              name: row.name ? row.name.trim() : "there"
            });
          }
        })
        .on("end", resolve)
        .on("error", reject);
    });

    res.status(200).json({
      success: true,
      count: emailList.length,
      emails: emailList
    });

  } catch (error) {
    console.error("Error processing CSV:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}