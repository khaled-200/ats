# Premium ATS Resume Studio (Next.js & MongoDB Version)

A modern, responsive resume builder and scanner built with **Next.js**, **TailwindCSS**, **Redux**, and a **MongoDB** database. 

This guide explains in simple, non-technical steps how to run this project on your PC, set up your database, and launch it live on Netlify for free.

---

## 💻 Part 1: How to Run it on Your PC (Local Test)

To run this website on your computer, you need to install a helper program called **Node.js** once.

### Step 1: Download Node.js
1. Go to the [Node.js Official Website](https://nodejs.org/).
2. Download the recommended version for your PC (labeled **LTS**).
3. Open the downloaded file and install it (click "Next" until finished).

### Step 2: Open your Terminal / Command Prompt
1. On your Windows PC, click the Start menu, type **cmd** (Command Prompt) or **PowerShell**, and open it.
2. Go to your project folder by typing this command and hitting Enter:
   ```bash
   cd C:\Users\Lenovo\.gemini\antigravity\scratch\ats-resume-nextjs
   ```

### Step 3: Install the Website Files
Run this command in the terminal to automatically download all packages:
```bash
npm install
```

### Step 4: Add your Database Connection
1. Open the file named **`.env.local`** inside the `ats-resume-nextjs` folder using Notepad.
2. You will see:
   ```text
   MONGODB_URI=mongodb://localhost:27017/ats-resumes
   ADMIN_PASSWORD=admin123
   ```
3. Change `admin123` to the password you want for your Control Panel.
4. Replace `mongodb://localhost:27017/...` with your actual MongoDB connection link (see Part 2 below on how to get a free cloud link).
5. Save and close the file.

### Step 5: Start the Website
Run this command in the terminal to start the website locally:
```bash
npm run dev
```
Open your internet browser (Chrome, Edge, Safari) and go to: **`http://localhost:3000`**

---

## 🗄️ Part 2: How to Get a Free MongoDB Cloud Database

A database is a secure storage room where your generated unlock codes are kept. We can use a free cloud database from **MongoDB Atlas**.

1. Go to [MongoDB Atlas Website](https://www.mongodb.com/cloud/atlas) and sign up for a free account.
2. Create a new cluster and select the **M0 Free** tier (which costs $0).
3. During setup, create a **Database Username** and a secure **Password**. Write these down!
4. Under "Network Access", add `0.0.0.0/0` (this allows Netlify to access your database safely).
5. Click **Connect** -> select **Drivers** (Node.js).
6. Copy the connection link. It will look like this:
   ```text
   mongodb+srv://<username>:<password>@cluster0.xxxx.mongodb.net/?retryWrites=true&w=majority
   ```
7. Replace `<username>` and `<password>` with your database credentials, and paste this entire link into your `.env.local` file (and later in Netlify!).

---

## 🌐 Part 3: How to Deploy Live to Netlify (Free Hosting)

To make your website live on the internet, you will upload the code to **GitHub** and link it to **Netlify**.

### Step 1: Install Git (Once)
1. Download and install **Git** from [git-scm.com](https://git-scm.com/).

### Step 2: Create a GitHub Repository
1. Go to [GitHub.com](https://github.com/) and create a free account.
2. Click **New Repository**.
3. Name it (e.g. `ats-resume-builder`), choose **Private** (so only you can see your code), and click **Create**.

### Step 3: Upload your Code using Terminal
In your Command Prompt terminal (make sure you are inside `C:\Users\Lenovo\.gemini\antigravity\scratch\ats-resume-nextjs`), run these commands one-by-one:

```bash
# 1. Start Git
git init

# 2. Add your website files (excluding private settings)
git add .

# 3. Save the files locally
git commit -m "initial commit"

# 4. Rename the branch
git branch -M main

# 5. Link it to your GitHub (replace URL with your repository link)
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/YOUR_REPO_NAME.git

# 6. Push your files to GitHub
git push -u origin main
```

### Step 4: Link GitHub to Netlify
1. Go to [Netlify.com](https://www.netlify.com/) and create a free account (log in using your GitHub account).
2. Click **Add new site** -> select **Import from Git**.
3. Choose **GitHub** and authorize Netlify.
4. Select your `ats-resume-builder` repository.
5. Netlify will automatically configure the settings for Next.js.

### Step 5: Add your Database to Netlify (Crucial!)
1. Scroll down to **Environment variables** (or click "Add Env Variable" in your Netlify Site Settings later).
2. Add these two variables:
   * Key: **`MONGODB_URI`** 
     Value: *(Paste your MongoDB Atlas connection link from Part 2)*
   * Key: **`ADMIN_PASSWORD`** 
     Value: *(Your Control Panel password)*
3. Click **Deploy Site**.
4. In 2 minutes, Netlify will build your site and give you a live link (e.g. `https://your-site-name.netlify.app`).

### Step 6: Go to your Control Panel
Add `/admin` to the end of your live website link (e.g. `your-site-name.netlify.app/admin`), log in with your password, and start generating customer codes!
