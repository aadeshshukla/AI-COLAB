# JNTUH Results Analytics

Analytics dashboard for JNTUH result data with semester tables, SGPA trend, grade distribution, and subject-level charts.

## Local development

```bash
npm install
npm run dev
```

## Production deployment (Vercel)

This project includes a serverless proxy at `/api/getAcademicResult` to avoid browser CORS issues in production.

1. Push latest code to GitHub.
2. Go to Vercel and click **Add New Project**.
3. Import your `AI-COLAB` repository.
4. Set **Root Directory** to `results-analytics`.
5. Keep defaults:
	- Build Command: `npm run build`
	- Output Directory: `dist`
6. Click **Deploy**.

After deploy, your live URL will be available on Vercel (and every future push can auto-deploy).

## Notes

- Dev API path uses Vite proxy: `/jntuhresults/api/getAcademicResult`
- Prod API path uses Vercel function: `/api/getAcademicResult`
