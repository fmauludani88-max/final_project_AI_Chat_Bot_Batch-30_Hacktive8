import 'dotenv/config';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import multer from 'multer';
import cors from 'cors';
import { GoogleGenAI } from '@google/genai';

const app = express();
const upload = multer();
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const GEMINI_MODEL = 'gemini-3.5-flash-lite';

app.use(cors());
app.use(express.json());
app.use(
  express.static(
    path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'client')
  )
);

const PORT = 3000;

// app.get("/", (req, res) => {
//   res.send("Hello,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,cls");
// });

app.post('/generate-text', async (req, res) => {
  try {
    const { prompt } = req.body;
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
    });
    res.status(200).json({ result: response.text });
  } catch (error) {
    console.error('Error Generating text:', error);
    res
      .status(500)
      .json({ error: 'Something went wrong while generating text.' });
  }
});

app.post('/generate-from-image', upload.single('image'), async (req, res) => {
  const { prompt } = req.body;
  const base64Image = req.file.buffer.toString('base64');

  try {
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: [
        { text: prompt, type: 'text' },
        { inlineData: { data: base64Image, mimeType: req.file.mimetype } },
      ],
    });

    res.status(200).json({ result: response.text });
  } catch (error) {
    console.error('error generating text:', error);
    res
      .status(500)
      .json({ error: 'Something went wrong while generating text.' });
  }
});
app.post('/api/chat', async (req, res) => {
  try {
    const convertation = req.body.convertation || req.body.conversation;
    if (!Array.isArray(convertation))
      throw new Error('Conversation must be an array!');
    const contents = convertation.map(({ role, text }) => ({
      role: role === 'bot' ? 'model' : role,
      parts: [{ text }],
    }));
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents,
      config: {
        temperature: 0.2,
        systemInstruction:
          'our Company is callded Bali Art Classic Item , our location Location DetailsStreet: Jalan Raya Basangkasa No. 88District: Seminyak, KutaRegency: Badung Regency, BaliPostal Code: 80361 Provience: Ball Phone:+628135567789 Open 08.00 am closes 10.00 pm You Are a friendly AI grad - mentoring for sales marketing bali art that helps own customer your job is answer question from costumer about such us price,model etc item product bali art at own shop when the customers is asking you to solve their problem kami bisa jawab saya akan bisa arahkan kamu kepada product yang sesuai dengan kamu If Customer have problem you can doing assigment tell me them to contact our company do not answer any question outside of baliart item from own shop answe language that user used to communicate with you ',
      },
    });
    res.status(200).json({ result: response.text });
  } catch (error) {
    console.error('error generating text:', error);
    res.status(500).json({
      error: error.message || 'An error occurred while generating text',
    });
  }
});
app.listen(PORT, () => console.log(`server ready on http://localhost:${PORT}`));
// Configure multer untuk menangani file upload
