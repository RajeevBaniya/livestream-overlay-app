# Livestream Player with Custom Overlays

A full-stack web application for streaming RTSP video with custom overlay management.

## Tech Stack

- **Frontend**: React (JavaScript) + Vite + HLS.js
- **Backend**: Flask (Python) + MongoDB
- **Streaming**: MediaMTX (RTSP → HLS converter)

## Project Structure

```
livestream/
├── frontend/           # React application (JavaScript)
│   ├── src/
│   │   ├── components/
│   │   │   └── VideoPlayer.jsx
│   │   ├── pages/
│   │   │   └── Landing.jsx
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
├── backend/            # Flask API
│   ├── app/
│   │   ├── __init__.py
│   │   └── routes.py
│   ├── requirements.txt
│   └── run.py
├── mediamtx/           # RTSP → HLS streaming server
│   ├── mediamtx.exe
│   ├── mediamtx-custom.yml
│   └── README.md
└── README.md
```

## Phase Status

### ✅ Phase 1: Setup & Basic Landing Page
- [x] React frontend initialized (JavaScript only, no TypeScript)
- [x] Flask backend structure created
- [x] Landing page with video player
- [x] Basic play/pause and volume controls
- [x] Sample HLS stream integration

### 🔄 Phase 2: RTSP Video Streaming (In Progress)
- [x] MediaMTX installed and configured
- [x] RTSP → HLS conversion setup
- [ ] Update VideoPlayer for RTSP streams
- [ ] Add RTSP URL input field
- [ ] Test with RTSP.me streams

### ⏳ Phase 3: Overlay Feature (Pending)
- [ ] Draggable overlay components
- [ ] Text and image overlays
- [ ] Position and resize functionality

### ⏳ Phase 4: Backend CRUD API (Pending)
- [ ] MongoDB connection
- [ ] Overlay CRUD endpoints
- [ ] API testing

### ⏳ Phase 5: Frontend-Backend Integration (Pending)
- [ ] Connect React to Flask API
- [ ] Persistent overlays
- [ ] Full CRUD from UI

### ⏳ Phase 6: Documentation (Pending)
- [ ] API documentation
- [ ] User guide
- [ ] Final testing

## Setup Instructions

### Prerequisites

- Node.js v18+
- Python 3.9+
- MongoDB (Atlas or local)

### 1. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The app will run on **http://localhost:5173**

### 2. Backend Setup

```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
```

Create `.env` file:
```env
MONGO_URI=your_mongodb_connection_string
FLASK_ENV=development
FLASK_PORT=5000
```

Run the server:
```bash
python run.py
```

The API will run on **http://localhost:5000**

### 3. MediaMTX Setup (RTSP Streaming)

```bash
cd mediamtx
.\mediamtx.exe mediamtx-custom.yml
```

MediaMTX will run on:
- **RTSP**: port 8554
- **HLS**: port 8888

## How to Use RTSP Streaming

### Method 1: Using RTSP.me (Recommended for Testing)

1. Go to https://rtsp.me
2. Upload a video or use their sample
3. Get your RTSP URL (e.g., `rtsp://rtsp.me/abc123`)
4. MediaMTX will convert it to HLS
5. Access in browser: `http://localhost:8888/livestream/index.m3u8`

### Method 2: Test Pattern

MediaMTX includes a test pattern:
- URL: `http://localhost:8888/test/index.m3u8`

## Current Features

- ✅ Video player with HLS stream support
- ✅ Play/Pause controls
- ✅ Volume adjustment
- ✅ Responsive design
- ✅ Flask API server with CORS
- ✅ RTSP → HLS conversion via MediaMTX

## Architecture

```
RTSP Stream (rtsp.me) 
    ↓
MediaMTX (port 8554)
    ↓ converts to
HLS Stream (port 8888)
    ↓
React Frontend (port 5173) ← → Flask API (port 5000) ← → MongoDB
```

## Next Steps

1. ✅ MediaMTX installed
2. ⏳ Update VideoPlayer to accept RTSP URLs
3. ⏳ Add stream URL input field
4. ⏳ Integrate with backend for stream management

## Development Notes

- All frontend code is **JavaScript** (no TypeScript)
- Code follows clean, human-readable structure
- Environment variables for sensitive data
- CORS configured for local development

## Useful Links

- MediaMTX Docs: https://github.com/bluenviron/mediamtx
- RTSP Test Streams: https://rtsp.me
- HLS.js Docs: https://github.com/video-dev/hls.js

