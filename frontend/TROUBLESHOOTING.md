# Troubleshooting Guide

## Input Text Not Visible

If you can't see text while typing in input fields:

1. **Clear browser cache** - Sometimes cached CSS can cause issues
2. **Check browser console** - Press F12 and look for CSS errors
3. **Hard refresh** - Press Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)

## Authentication Issues

### Can't Sign In or Create Account

1. **Check Backend is Running**
   - Backend should be running on `http://localhost:5000`
   - Check terminal for "Server running on port 5000"

2. **Check MongoDB Connection**
   - Backend should show "MongoDB connected"
   - If not, check your `.env` file in `backend/` directory

3. **Check Browser Console**
   - Press F12 → Console tab
   - Look for any error messages
   - Check Network tab to see if API calls are failing

4. **Verify Environment Variables**
   - Frontend `.env` should have: `VITE_API_URL=http://localhost:5000/api/v1`
   - Backend `.env` should have your MongoDB connection string

5. **Common Issues:**
   - **CORS Error**: Backend CORS is configured, but if you see CORS errors, check backend is running
   - **Network Error**: Check if backend URL is correct in frontend `.env`
   - **401 Unauthorized**: Check if JWT_SECRET is set in backend `.env`

## Testing Authentication

1. **Seed the Database First:**
   ```bash
   cd backend
   npm run seed
   ```

2. **Use Sample Credentials:**
   - Admin: `admin@college.edu` / `admin123`
   - Teacher: `john.smith@college.edu` / `teacher123`
   - Student: `alice.williams@college.edu` / `student123`

3. **Check API Response:**
   - Open browser DevTools → Network tab
   - Try to login
   - Check the `/auth/login` request
   - Look at the response - should have `token` and `user` fields

## CSS Issues

If styles aren't loading:

1. **Restart Dev Server:**
   ```bash
   # Stop server (Ctrl+C)
   npm run dev
   ```

2. **Check CSS Files:**
   - All CSS files should be in `src/components/ui/` and `src/pages/`
   - Make sure `index.css` is imported in `main.jsx`

3. **Browser DevTools:**
   - Inspect the input element
   - Check computed styles
   - Verify CSS variables are set correctly

