# Bali Art Classic Item - AI Chat Bot (Gemini)

Landing page + floating chatbot yang memakai Google Gemini API.

## Cara menjalankan

```bash
cd server
npm install
cp .env.example .env   # isi GEMINI_API_KEY dari https://aistudio.google.com/app/apikey
npm start
```

Buka http://localhost:3000 — server Express juga menyajikan file di `client/`.

## Endpoint

- `POST /api/chat` — body `{ "convertation": [{ "role": "user", "text": "..." }] }`
- `POST /generate-text` — body `{ "prompt": "..." }`
- `POST /generate-from-image` — multipart `image` + field `prompt`
- `GET /health`
