# Wanderlust Elite Deployment Guide

This project is a full-stack application built with React (Vite) and Express. To deploy this to Netlify, you have two main options:

## Option 1: Static Deployment (Netlify)
*Note: This will disable the Stripe payment backend unless you convert it to Netlify Functions.*

1. **Push to GitHub**: Initialize a git repo and push your code to GitHub.
2. **Connect to Netlify**:
   - Go to Netlify Dashboard -> Add new site -> Import from GitHub.
   - Select your repository.
3. **Build Settings**:
   - Build Command: `npm run build`
   - Publish Directory: `dist`
4. **Environment Variables**:
   - Add `GEMINI_API_KEY` in Netlify Dashboard (Site settings -> Environment variables).
   - Add `VITE_STRIPE_PUBLISHABLE_KEY` (if using Stripe).

## Option 2: Full-Stack Deployment (Render / Railway / Heroku)
*Recommended for full functionality including Stripe payments.*

1. **Push to GitHub**.
2. **Connect to Render/Railway**:
   - Create a new "Web Service".
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start` (Make sure `package.json` has `"start": "node server.ts"`)
3. **Environment Variables**:
   - Add `GEMINI_API_KEY`, `STRIPE_SECRET_KEY`, `VITE_STRIPE_PUBLISHABLE_KEY`, and `APP_URL`.

## API Keys Setup
- **Gemini API**: Get your key from [Google AI Studio](https://aistudio.google.com/app/apikey).
- **Stripe API**: Get your keys from [Stripe Dashboard](https://dashboard.stripe.com/apikeys).
