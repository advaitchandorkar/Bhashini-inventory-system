# Voice + Image Inventory System

Modern inventory management with manual, voice, image, and barcode intake. This repo keeps Next.js for the UI and Flask for the API while adding production-credible auth, validation, and consistent data modeling.

## Architecture

```
┌──────────────┐    JWT + REST     ┌──────────────┐
│  Next.js UI  │ ────────────────► │  Flask API   │
│  (app/)      │ ◄───────────────  │  (flask-app) │
└──────────────┘                   └──────┬───────┘
                                         │
                                  ┌──────▼──────┐
                                  │  MongoDB    │
                                  │ inventory   │
                                  └──────┬──────┘
                                         │
                   ┌─────────────────────┼─────────────────────┐
                   │                     │                     │
             ┌─────▼─────┐        ┌──────▼──────┐        ┌─────▼─────┐
             │ Bhashini  │        │   Gemini    │        │   OCR     │
             │   ASR     │        │   Parser    │        │ (Tesseract│
             └───────────┘        └─────────────┘        │ + fallback│
                                                        └───────────┘
```

## Features
- JWT auth with bcrypt hashing
- Unified inventory schema with server-side validation
- Browser-based voice recording + Bhashini ASR
- Gemini parsing with user confirmation step
- Image OCR + parsing fallback to Roboflow class counts
- Barcode lookup with optional camera scan (beta)
- Modern shadcn/ui tabs and guided add flow

## Setup

### 1) Backend (Flask)
```
cd flask-app
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp ../.env.example .env
flask --app app run
```

### 2) Frontend (Next.js)
```
npm install
npm run dev
```

## Environment Variables
Copy `.env.example` to `.env` and fill in:
- `FLASK_SECRET_KEY`
- `MONGO_URI`
- `FRONTEND_ORIGIN`
- `BHASHINI_*` (ASR)
- `GEMINI_API_KEY`
- `ROBOFLOW_API_KEY` (optional fallback)
- `NEXT_PUBLIC_API_URL`

## Core API Routes
- `POST /api/auth/signup`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/inventory`
- `POST /api/inventory`
- `POST /api/inventory/bulk_upsert`
- `POST /api/voice/transcribe`
- `POST /api/voice/parse`
- `POST /api/image/extract`
- `POST /api/barcode/lookup`

## Verification Checklist
- Sign up / sign in works
- JWT required for inventory APIs
- Add manual item shows in dashboard
- Voice record in browser → transcript → parse → confirm → saved
- Image upload → OCR/parse → confirm → saved
- Barcode lookup works (camera scan is beta)
- No secrets in code

## Sanity Script
```
API_URL=http://localhost:5000 ./scripts/sanity_check.sh
```

## Known Limitations
- OCR requires system Tesseract installation; fallback uses Roboflow class counts.
- Barcode camera scanning depends on browser support for `BarcodeDetector`.
- Voice pipeline assumes Bhashini accepts the uploaded audio format (webm/wav).
