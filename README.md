# Frontend

Vue 3 + Tailwind CSS frontend based on the Stitch finance tracker screens.

## Deploy To Cloudflare Pages

Use this folder as the root of the frontend repository.

Cloudflare Pages settings:

```text
Framework preset: Vite
Build command: npm run build
Build output directory: dist
```

Set this Cloudflare Pages environment variable:

```text
VITE_API_BASE_URL=https://your-render-backend.onrender.com
```

The value should be the Render backend origin only, without `/api/v1`.

## Run

```bash
npm install
npm run dev
```

Open <http://127.0.0.1:5173>.

The local backend API base URL is:

```text
http://127.0.0.1:8013/api/v1
```

Override the backend origin locally by copying `.env.example` to `.env` and changing:

```text
VITE_API_BASE_URL=http://127.0.0.1:8013
```

The app signs users in with Neon Auth and silently attaches:

```text
Authorization: Bearer <token>
```

Users do not need to paste tokens manually.

Downloaded Stitch references are in `stitch/screens`, `stitch/html`, and `stitch/images`.
