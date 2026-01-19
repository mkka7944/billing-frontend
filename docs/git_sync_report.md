# Git Synchronization & "Pull Rejected" Report

This report diagnoses why your office PC likely rejects `git pull` commands and provides a standard protocol to keep your home and office machines in perfect sync.

## Part 1: Why Git Rejects Your Commands

Git is designed to prevent "data loss." When you `push` from home, the version on GitHub becomes "newer" than the version in the office. If you try to `pull` at the office and it fails, it's usually due to one of these four reasons:

### 1. The "Dirty" Working Directory (Most Common)
If you made even one small change at the office (or a file was auto-generated) and didn't commit it, Git will refuse to pull because it doesn't want to overwrite your local work.
*   **Error message:** `Your local changes to the following files would be overwritten by merge...`

### 2. Diverged Histories (Merge Conflicts)
If you made a commit at the office, then went home and made a commit and pushed it, the two machines now have "competing" histories. Git doesn't know which one is the truth.
*   **Error message:** `fatal: Not possible to fast-forward, aborting.`

### 3. Authentication / Credential Expiry
Office PCs often have enterprise security that might interfere with Git's credential manager. If you use HTTPS, your Personal Access Token (PAT) might have expired. If you use SSH, your key might not be added to the office machine.

### 4. Enterprise Firewalls/Proxies
Many office networks block **SSH (Port 22)**. If you are using SSH URLs (e.g. `git@github.com:...`), your pull will simply "time out" or say `Connection refused`.
*   **Fix:** Switch to **HTTPS** URLs.

---

## Part 2: The "Golden Flow" for Perfect Sync

To ensure you never face a rejection again, follow this 3-step ritual:

### 1. Leaving the Office (The Save)
Before you stand up from your office desk:
```powershell
git add .
git commit -m "Office sync: [Description of work]"
git push
```

### 2. Arriving at Home / Office (The Refresh)
The **very first thing** you do when you open the laptop:
```powershell
git pull
```

### 3. If Rejections Happen (The Recovery)
If Git rejects your pull at the office, run this sequence to "reset" the state to match GitHub:

> [!CAUTION]
> **`git reset --hard` will delete any uncommitted work at the office.** Use this only if you want the office PC to look exactly like the version you pushed from home.

```powershell
# 1. Save any accidental office changes just in case
git stash 

# 2. Force the office PC to match GitHub exactly
git fetch origin
git reset --hard origin/main  # (Assuming your branch is 'main')

# 3. Clean up any untracked files
git clean -fd
```

---

## Part 3: Troubleshooting Checklist for Office

1.  **Check URL Type:** Run `git remote -v`. If it starts with `git@github.com`, switch to HTTPS.
2.  **Verify Identity:** Run `git config user.email`. Ensure it matches your GitHub account.
3.  **Auth Status:** Run `gh auth status` (if you have GitHub CLI) to see if you are logged in.
4.  **Network Probe:** Try `ping github.com`. If it fails, your office network is blocking the site.
