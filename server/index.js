import express from 'express';
import cors from 'cors';
import { analyzeSEO } from './seoAnalyzer.js';

const app = express();
const port = process.env.PORT || 3000;

// Enable CORS for all routes
app.use(cors());
app.use(express.json());

app.post('/api/analyze', async (req, res) => {
  console.log('Received request to analyze URL:', req.body.url);
  try {
    const { url } = req.body;
    if (!url) {
      console.error('No URL provided');
      return res.status(400).json({ error: 'URL is required' });
    }
    console.log('Analyzing SEO for URL:', url);
    const seoReport = await analyzeSEO(url);
    console.log('SEO analysis complete:', seoReport);
    res.json(seoReport);
  } catch (error) {
    console.error('Error analyzing SEO:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    res.status(500).json({ error: errorMessage });
  }
});

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
  res.status(500).json({ error: errorMessage });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});