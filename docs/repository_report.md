# Repository & Deployment Report

## 1. Repository Health Check
### Current Size
- **Total Size**: **~470 MB** (442 MB Unpacked + 27 MB Packed).
- **Status**: **Healthy**, but growing.
- **Risk Level**: **Medium**.

### GitHub Free Tier Status

| Metric | Your Usage | GitHub Free Limit | Status |
| :--- | :--- | :--- | :--- |
| **Repo Size** | **0.47 GB** | **1.0 GB** (Recommended) | ✅ Safe (50% Used) |
| **Hard Limit**| **0.47 GB** | **2.0 GB** (Block) | ✅ Safe |
| **Bandwidth** | Varied | 1GB / month (LFS) | ⚠️ Monitor LFS |

> [!WARNING]
> **Data Bloat**: You are storing large CSVs (e.g., `Biller_Sargodha...csv` ~14MB) in git. If you continue adding "Biller Lists" monthly, you will hit the 1GB limit in ~12-18 months.
> **Recommendation**: Add `inputs/excel_dumps/` to `.gitignore` immediately to prevent future bloat.

## 2. GitHub Pages Deployment Strategy

Since you are on the **Free Tier**, we need a cost-effective, zero-config strategy.

### The Strategy: "Hash Routing"
GitHub Pages is a static host. It does not support "Server Side Routing" (typical `BrowserRouter`), which causes 404 errors when you refresh `https://user.github.io/app/dashboard`.

**We will use `HashRouter` instead.**
- **URL Style**: `https://user.github.io/repo/#/dashboard`
- **Why**: It works 100% reliably on GitHub Pages Free Tier without any backend hacks (like `404.html` redirects).

### Step-by-Step Deployment Plan

1.  **Code Change**:
    Switch from `BrowserRouter` to `HashRouter` in `App.jsx`.
    ```jsx
    // src/App.jsx
    import { HashRouter as Router, ... } from 'react-router-dom';
    ```

2.  **Vite Config**:
    Set the `base` path in `vite.config.js`.
    ```javascript
    // vite.config.js
    export default defineConfig({
      base: '/billing-system/', // Your Repository Name
      // ...
    })
    ```

3.  **Deployment (Manual)**:
    Since you have limited Actions minutes (2000 min/month), a manual deploy script is safer and faster.
    - Run: `npm run build`
    - Run: `git add dist -f && git commit -m "deploy" && git subtree push --prefix dist origin gh-pages`

### Alternative: Vercel (Recommended)
If you want automatic deployments and cleaner URLs (no `#`), **Vercel** is often better for React apps on the free tier.
- **Connect GitHub**: You just link the repo.
- **Quota**: Generous free tier.
- **Routing**: Works out of the box with a simple `vercel.json` config.

**Verdict**: Stick to GitHub Pages for now if you want everything in one place, but use `HashRouter`.
