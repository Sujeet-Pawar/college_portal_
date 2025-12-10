# Frontend Environment Setup

## Create .env File

Create a `.env` file in the `frontend` directory with the following content:

```env
VITE_API_URL=http://localhost:5000/api/v1
```

## Important Notes

1. **Vite Environment Variables**: In Vite, environment variables must be prefixed with `VITE_` to be accessible in the frontend code.

2. **Backend URL**: 
   - For local development: `http://localhost:5000/api/v1`
   - For production: Update this to your production backend URL

3. **File Location**: The `.env` file should be in the `frontend/` directory (same level as `package.json`)

4. **Restart Required**: After creating or updating the `.env` file, you need to restart the Vite dev server for changes to take effect.

## How to Create the File

### Option 1: Manual Creation
1. Navigate to the `frontend` directory
2. Create a new file named `.env`
3. Add the content above

### Option 2: Using Command Line (Windows PowerShell)
```powershell
cd frontend
echo "VITE_API_URL=http://localhost:5000/api/v1" > .env
```

### Option 3: Using Command Line (Git Bash / Linux / Mac)
```bash
cd frontend
echo "VITE_API_URL=http://localhost:5000/api/v1" > .env
```

## Verification

After creating the `.env` file, restart your dev server:

```bash
npm run dev
```

The axios instance in `src/lib/axios.js` will automatically use this URL to connect to your backend API.

