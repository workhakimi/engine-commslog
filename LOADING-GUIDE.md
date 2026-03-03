# WeWeb Component Loading Guide

If the component **does not load at all** when you drag and drop it, follow this checklist.

---

## Option A: Local Development (recommended for testing)

Local components **only work in the Dev Editor**, not the regular editor.

### Step 1: Start the dev server

```bash
cd components/comms-log
npm install
npm run serve
```

Default port is **8080**. For a different port:
```bash
npm run serve -- port=4040
```

### Step 2: Authorize the SSL certificate

The dev server uses **HTTPS**. Before WeWeb can load it:

1. Open **https://localhost:8080** in your browser (or your port)
2. You'll see a certificate warning
3. Click **Advanced** → **Continue to localhost** (or equivalent)
4. The page should load (it may show a blank page or component info)

**Chrome:** If you don't see Advanced, go to `chrome://flags`, search for "Allow invalid certificates for resources loaded from localhost", and enable it.

### Step 3: Use the Dev Editor (not the regular editor)

1. Go to [WeWeb Dashboard](https://dashboard.weweb.io/)
2. Open your project
3. Click the **Dev** tab
4. Click **"Open Dev Editor"** (this opens a special editor that can load local components)
5. In the Dev tab again, select **Element**
6. Click **"Add local Element"**
7. Enter the port (e.g. **8080**) and optionally a name
8. The component should appear in the Add panel
9. Drag it onto the canvas

### Common mistakes

| Mistake | Fix |
|--------|-----|
| Using the regular Editor | Use **Open Dev Editor** from the Dev tab |
| Using `npm run build` only | Use `npm run serve` – the dev server must be running |
| Entering full URL in "Add local Element" | Enter only the **port** (e.g. 8080) |
| Not authorizing SSL | Visit https://localhost:8080 and accept the certificate |
| Dev server not running | Run `npm run serve` before opening the editor |

---

## Option B: From GitHub (production)

For components published to GitHub:

1. In [WeWeb Dashboard](https://dashboard.weweb.io/), add a **Source code** pointing to your GitHub repo
2. Open the **regular Editor** (not Dev Editor)
3. Click the **Dev** tab
4. At the bottom, find your component under the source code
5. Drag it onto the page
