# GDM Comms Log – WeWeb Component

Lightweight forum for comments/discussion per CMS article.

## Install

```bash
npm install
```

## Build

```bash
npm run build
```

## Serve (local dev)

```bash
npm run serve -- --port=8080
```

In WeWeb: Developer popup → Add custom element → `http://localhost:8080`

## Bindings

- `commsData` – list of comms_log rows (filtered by cms_id)
- `cmsItem` – current article this log belongs to
- `usersData` – optional, for user name lookup
- `currentUserId` – logged-in user for new comments

Requires `message` column on `comms_log` table.
