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

## Local development (component must load in editor)

**Important:** Local components only work in the **Dev Editor**, not the regular editor.

1. Start the dev server: `npm run serve` (port 8080 by default)
2. Authorize SSL: open **https://localhost:8080** and accept the certificate
3. WeWeb Dashboard → Dev tab → **Open Dev Editor**
4. Dev tab → Element → **Add local Element** → enter port **8080**
5. Drag the component onto the canvas

See **[LOADING-GUIDE.md](./LOADING-GUIDE.md)** for full troubleshooting.

## Bindings

- `commsData` – list of comms_log rows (filtered by cms_id)
- `cmsItem` – current article this log belongs to
- `usersData` – optional, for user name lookup
- `currentUserId` – logged-in user for new comments

Requires `message` column on `comms_log` table.
