# Hotel Review Funnel

A simple web app that collects star ratings from hotel guests. Happy guests (3.5★ and above) are redirected to your Google Review page. Unhappy guests see a private feedback form — their comments are saved internally and never posted publicly.

---

## Install

1. Make sure you have [Node.js](https://nodejs.org) installed (download the LTS version).
2. Clone or download this project to your computer.
3. Open a terminal in the project folder and run:

```
npm install
```

This installs all the required packages.

---

## Configure

Open `config.js` and update these two lines:

```js
hotelName: 'Your Hotel Name Here',
googleReviewUrl: 'https://search.google.com/local/writereview?placeid=YOUR_PLACE_ID_HERE',
```

### How to find your Google Place ID

1. Go to https://developers.google.com/maps/documentation/places/web-service/place-id-finder
2. Search for your hotel by name
3. Copy the **Place ID** (it starts with `ChIJ...`)
4. Replace `YOUR_PLACE_ID_HERE` in the URL above with your Place ID

You can also adjust `ratingThreshold` (default `3.5`) — guests at or above this rating go to Google. Below it, they see the private feedback form.

---

## Run Locally

In your terminal (inside the project folder), run:

```
node server.js
```

Then open your browser and go to:

```
http://localhost:3000
```

You should see the star rating page. Test it by clicking stars — high ratings redirect to Google, low ones show the feedback form.

---

## Deploy to Render.com (Free)

1. Create a free account at https://github.com and upload your project as a new repository.
   - In VS Code, open the terminal and run:
     ```
     git init
     git add .
     git commit -m "first commit"
     ```
   - Then create a new repo on GitHub and follow the instructions to push.

2. Go to https://render.com and sign up (use your GitHub account).

3. Click **New → Web Service**.

4. Connect your GitHub repository.

5. Set these options:
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
   - **Environment:** Node

6. Click **Create Web Service**. Render will deploy your app and give you a public URL like `https://your-app.onrender.com`.

7. Share that link with guests via SMS or email after checkout!

> **Note:** On Render's free tier, the server sleeps after 15 minutes of inactivity. The first visit after it sleeps may take ~30 seconds to wake up. For a hotel production setup, Render's $7/month paid tier keeps it always on.

---

## File Structure

```
hotel-review-funnel/
├── public/
│   ├── index.html       ← Star rating page guests see first
│   ├── feedback.html    ← Private feedback form (low ratings only)
│   ├── thankyou.html    ← Confirmation page after feedback submitted
│   └── style.css        ← All styling — mobile-first
├── server.js            ← Express backend — handles all API requests
├── config.js            ← Your hotel name, Google Review URL, settings
├── database.js          ← SQLite database setup and helper functions
├── package.json         ← Project dependencies
├── .env                 ← Port setting (not uploaded to GitHub)
├── .gitignore           ← Files to exclude from Git
└── README.md            ← This file
```
