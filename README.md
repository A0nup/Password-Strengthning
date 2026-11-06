# 🛡️ Password Strengthening System

> Evaluate password strength, receive intelligent security recommendations, and generate cryptographically secure passwords aligned with NIST SP 800-63B standards.

Developed by **[A0nup](https://github.com/A0nup)** &bull; Cybersecurity Project

---

## 🌟 Key Features

- **Real-Time Password Evaluation:**
  - Evaluates across 5 crucial security vectors: length ($\ge 8$), uppercase, lowercase, numeric digits, and special characters.
  - Dynamic 5-level scoring: *Very Weak*, *Weak*, *Moderate*, *Good*, *Strong*, *Very Strong*.
  - Visual 5-segment glowing status meter.
- **Intelligent Feedback & Checklist:**
  - Instant suggestions targeted specifically at missing criteria.
  - Interactive validation status checklist that updates as you type.
- **Cryptographic Password Generator:**
  - Uses true CSPRNG randomness (`secrets` in Python, `window.crypto.getRandomValues` in browser).
  - Quick 1-click generator in sidebar with one-click clipboard copy.
  - Advanced generator tab with adjustable length (8 to 64 chars) and custom character sets.
  - Real-time entropy computation (bits) and brute-force crack time estimates.
- **Zero-Trust Client-Side Resilience:**
  - Works 100% serverless on GitHub Pages and Netlify.
  - Passwords evaluated never leave your browser unencrypted.
- **Python Backend Included:**
  - Zero-dependency Python standard library server (`app.py`).
  - Alternative Flask backend (`flask_app.py`).
  - REST API endpoints for `/api/check-password` and `/api/generate-password`.

---

## 🚀 Quick Start (Local Run)

### Option 1: Zero-Dependency Python Server (Recommended)
No installation or pip packages required!
```bash
python3 app.py
```
Open your browser at **`http://localhost:5000`**.

### Option 2: Flask Server
```bash
pip install -r requirements.txt
python3 flask_app.py
```

---

## 🌐 Deploy to GitHub Pages (Live in 2 Minutes)

### Method 1: Using the Automated Script
Run the included deployment script:
```bash
bash deploy_github.sh
```
Follow the terminal prompt, and your project will be pushed to GitHub.

### Method 2: Manual Git Commands
```bash
# 1. Initialize git
git init
git branch -M main

# 2. Add files and commit
git add .
git commit -m "feat: initial release of password strengthening system"

# 3. Add remote (replace with your repository URL)
git remote add origin https://github.com/A0nup/Password-Strengthning.git

# 4. Push to GitHub
git push -u origin main
```

### Method 3: Enable GitHub Pages in GitHub Settings
1. Go to your repo on GitHub: `https://github.com/A0nup/Password-Strengthning`
2. Click **Settings** > **Pages** (in the left navigation).
3. Under **Build and deployment**:
   - **Source**: Select `Deploy from a branch`
   - **Branch**: Select `main` and folder `/ (root)`
   - Click **Save**
4. Your website will be live at:
   **`https://a0nup.github.io/Password-Strengthning/`**

---

## ⚡ Deploy to Netlify

### Method 1: Drag & Drop (Fastest - 10 Seconds)
1. Go to [app.netlify.com/drop](https://app.netlify.com/drop).
2. Drag and drop this project folder into the browser window.
3. Your site is instantly live with an SSL certificate!

### Method 2: Connect via GitHub
1. In Netlify dashboard, click **"Add new site"** > **"Import an existing project"**.
2. Select GitHub and pick the `Password-Strengthning` repository.
3. Leave build settings default (`publish directory: .`).
4. Click **Deploy Site**.

---

## 📁 Project Structure

```
├── index.html                 # Modern responsive frontend interface
├── style.css                  # Cyber-dark theme with glowing accents
├── script.js                  # Evaluation engine & CSPRNG generator
├── app.py                     # Zero-dependency Python backend & server
├── flask_app.py               # Alternative Flask REST API backend
├── requirements.txt           # Python dependencies (for Flask)
├── hello.py                   # Clean Python module for CLI usage
├── test.py                    # Phone number recon tool
├── netlify.toml               # Netlify configuration & security headers
├── _redirects                 # SPA redirects for Netlify
├── .nojekyll                  # Bypasses Jekyll on GitHub Pages
├── deploy_github.sh           # One-click deployment script for GitHub
├── .github/workflows/
│   └── deploy.yml             # GitHub Actions automated Pages deployment
└── README.md                  # Documentation
```

---

## 🔒 Security & Privacy Notice
This application strictly adheres to privacy-by-design principles. Evaluated passwords remain ephemeral within local memory and are never stored, logged, or transmitted across untrusted channels.
