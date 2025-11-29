# Deployment Configuration

## Backend URL
https://e-commerce-r0sh.onrender.com

## Frontend URL
https://e-commerce-flax-tau.vercel.app/

## Environment Variables

### Vercel (Frontend)
- `REACT_APP_API_URL` = `https://e-commerce-r0sh.onrender.com/api`

### Render (Backend)
- `NODE_ENV` = `production`
- `PORT` = `10000` (or let Render set it automatically)
- `ADMIN_API_KEY` = `admin-secret-key-12345`

## Quick Fix for API Error

If you see "Unexpected token '<'" error:
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add/Update: `REACT_APP_API_URL` = `https://e-commerce-r0sh.onrender.com/api`
3. Redeploy the frontend

