# FaithNova frontend

React and Vite interface for the FaithNova community. The interface uses a shared light/dark palette, responsive navigation, readable discussion cards, and keyboard-accessible dialogs.

## Run locally

```sh
npm install
npm run dev
```

The API defaults to `http://localhost:8000/api`. Set `VITE_API_BASE_URL` in `.env.local` to use another backend. The existing sample-data fallback lets you preview the interface without running Laravel; authentication and server persistence require the backend.

## Verify

```sh
npm run build
node --test src/utils/feed.test.js
```

The filter tests cover discipline route aliases, search, saved posts, combined filters, and chronological/reaction sorting.

## Interface structure

- `src/index.css`: shared colors, typography, layout, responsive rules, and component styles.
- `src/layouts/MainLayout.jsx`: navigation, content columns, mobile drawer, and global composer.
- `src/components/Dialog.jsx`: native dialogs with keyboard focus management and Escape dismissal.
- `src/components/PostCard.jsx`: shared feed and full-discussion presentation.
- `src/utils/feed.js`: filtering and sorting for home, saved, and discipline feeds.

Search and filter selections are stored in the URL. `Ctrl+K` / `Cmd+K` focuses search. Sources expand within each card and are open by default on the full discussion page. A closed composer retains its draft until the page reloads.
