import type { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';
import * as cheerio from 'cheerio';

function normalizeUrl(url: string): string {
  try {
    // Remove leading/trailing whitespace
    url = url.trim();
    
    // Add protocol if missing
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }
    
    const urlObject = new URL(url);
    return urlObject.href;
  } catch (error) {
    throw new Error(`Invalid URL: ${url}`);
  }
}

async function analyzeSEO(url: string) {
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      timeout: 10000 // 10 second timeout
    });
    
    const html = response.data;
    const $ = cheerio.load(html);

    const title = $('title').text();
    const metaDescription = $('meta[name="description"]').attr('content') || '';
    const h1Count = $('h1').length;
    const imgCount = $('img').length;
    const imgWithAlt = $('img[alt]').length;

    const seoScore = calculateSEOScore(title, metaDescription, h1Count, imgCount, imgWithAlt);
    const recommendations = generateRecommendations(title, metaDescription, h1Count, imgCount, imgWithAlt);

    return {
      url,
      overallScore: seoScore,
      recommendations
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        throw new Error(`Failed to fetch URL: ${error.response.status} ${error.response.statusText}`);
      } else if (error.request) {
        throw new Error('No response received from the server');
      } else {
        throw new Error(`Error setting up the request: ${error.message}`);
      }
    }
    throw new Error(`Error analyzing URL: ${error.message}`);
  }
}

function calculateSEOScore(title, metaDescription, h1Count, imgCount, imgWithAlt) {
  let score = 100;
  const penalties: string[] = [];
  const bonuses: string[] = [];

  // Title analysis
  if (!title) {
    score -= 15;
    penalties.push('Missing title tag');
  } else {
    const titleLength = title.length;
    if (titleLength < 30) {
      score -= 10;
      penalties.push('Title too short (< 30 characters)');
    } else if (titleLength > 60) {
      score -= 5;
      penalties.push('Title too long (> 60 characters)');
    } else {
      bonuses.push('Optimal title length');
    }
  }

  // Meta description analysis
  if (!metaDescription) {
    score -= 10;
    penalties.push('Missing meta description');
  } else {
    const descLength = metaDescription.length;
    if (descLength < 120) {
      score -= 8;
      penalties.push('Meta description too short (< 120 characters)');
    } else if (descLength > 160) {
      score -= 3;
      penalties.push('Meta description too long (> 160 characters)');
    } else {
      bonuses.push('Optimal meta description length');
    }
  }

  // H1 analysis
  if (h1Count === 0) {
    score -= 10;
    penalties.push('Missing H1 tag');
  } else if (h1Count > 1) {
    score -= 5;
    penalties.push('Multiple H1 tags');
  } else {
    bonuses.push('Proper H1 tag usage');
  }

  // Image analysis
  if (imgCount > 0) {
    const altTextPercentage = (imgWithAlt / imgCount) * 100;
    if (altTextPercentage < 100) {
      const penalty = Math.round((100 - altTextPercentage) / 10);
      score -= penalty;
      penalties.push(`${Math.round(100 - altTextPercentage)}% of images missing alt text`);
    } else {
      bonuses.push('All images have alt text');
    }
  }

  return {
    score: Math.max(0, Math.min(100, score)),
    penalties,
    bonuses
  };
}
  interface Recommendation {
    id: string;
    category: string;
    impact: string;
    title: string;
    description: string;
    steps: string[];
  }
  function generateRecommendations(title, metaDescription, h1Count, imgCount, imgWithAlt) {
    const recommendations: Recommendation[] = [];
  
    // Title recommendations
    if (!title) {
      recommendations.push({
        id: 'title-missing',
        category: 'Meta Tags',
        impact: 'High',
        title: 'Add Title Tag',
        description: 'Your page is missing a title tag, which is crucial for SEO and user experience.',
        steps: [
          'Add a <title> tag in the <head> section of your HTML',
          'Keep the title between 30-60 characters',
          'Include your main keyword in the title',
          'Make the title unique and descriptive'
        ]
      });
    } else if (title.length < 30 || title.length > 60) {
      recommendations.push({
        id: 'title-length',
        category: 'Meta Tags',
        impact: 'Medium',
        title: 'Optimize Title Length',
        description: `Your title is ${title.length < 30 ? 'too short' : 'too long'} (${title.length} characters).`,
        steps: [
          'Adjust title length to between 30-60 characters',
          'Ensure the title is descriptive and includes your main keyword',
          'Make it compelling for users to click'
        ]
      });
    }
  
    // Meta description recommendations
    if (!metaDescription) {
      recommendations.push({
        id: 'meta-desc-missing',
        category: 'Meta Tags',
        impact: 'High',
        title: 'Add Meta Description',
        description: 'Your page is missing a meta description, which helps search engines understand your content.',
        steps: [
          'Add a meta description tag in the <head> section',
          'Write a compelling description between 120-160 characters',
          'Include your main keyword naturally',
          'Make it actionable and relevant to the page content'
        ]
      });
    } else if (metaDescription.length < 120 || metaDescription.length > 160) {
      recommendations.push({
        id: 'meta-desc-length',
        category: 'Meta Tags',
        impact: 'Medium',
        title: 'Optimize Meta Description Length',
        description: `Your meta description is ${metaDescription.length < 120 ? 'too short' : 'too long'} (${metaDescription.length} characters).`,
        steps: [
          'Adjust meta description length to between 120-160 characters',
          'Ensure it accurately summarizes the page content',
          'Include a call-to-action when appropriate'
        ]
      });
    }
  
    // H1 recommendations
    if (h1Count === 0) {
      recommendations.push({
        id: 'h1-missing',
        category: 'Content Structure',
        impact: 'High',
        title: 'Add H1 Heading',
        description: 'Your page is missing an H1 heading, which is important for both SEO and content hierarchy.',
        steps: [
          'Add a single H1 heading to your page',
          'Make sure it contains your main keyword',
          'Keep it consistent with your title tag',
          'Use only one H1 per page'
        ]
      });
    } else if (h1Count > 1) {
      recommendations.push({
        id: 'multiple-h1',
        category: 'Content Structure',
        impact: 'Medium',
        title: 'Consolidate H1 Headings',
        description: `Your page has ${h1Count} H1 headings. It's recommended to have only one.`,
        steps: [
          'Choose the most important H1 and keep only that one',
          'Change other H1s to H2s or other lower-level headings',
          'Ensure your heading hierarchy makes sense'
        ]
      });
    }
  
    // Image recommendations
    if (imgCount > 0) {
      const missingAltCount = imgCount - imgWithAlt;
      if (missingAltCount > 0) {
        recommendations.push({
          id: 'img-alt-missing',
          category: 'Accessibility',
          impact: 'Medium',
          title: 'Add Alt Text to Images',
          description: `${missingAltCount} out of ${imgCount} images are missing alt text.`,
          steps: [
            'Add descriptive alt text to all images',
            'Keep alt text concise but descriptive',
            'Use empty alt="" for decorative images',
            'Include keywords naturally if relevant'
          ]
        });
      }
    }
  
    return recommendations;
  }

  export default async function handler(
    req: VercelRequest,
    res: VercelResponse
  ) {
    console.log('Received request:', req.method, req.body);
  
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }
  
    try {
      const { url } = req.body;
      
      if (!url) {
        console.log('No URL provided');
        return res.status(400).json({ error: 'URL is required' });
      }
  
      console.log('Processing URL:', url);
      const normalizedUrl = normalizeUrl(url);
      console.log('Normalized URL:', normalizedUrl);
      
      const seoReport = await analyzeSEO(normalizedUrl);
      console.log('Analysis complete:', seoReport);
      
      return res.status(200).json(seoReport);
    } catch (error) {
      console.error('Error in handler:', error);
      
      // Ensure we're always returning a JSON response
      res.setHeader('Content-Type', 'application/json');
      
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      return res.status(500).json({ 
        error: errorMessage,
        details: error instanceof Error ? error.stack : undefined
      });
    }
  }
  export { calculateSEOScore, generateRecommendations };