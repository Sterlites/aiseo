import type { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';
import * as cheerio from 'cheerio';
import chromium from '@sparticuz/chrome-aws-lambda';
import type { Browser } from 'puppeteer-core';


interface DetailedSEOScore {
  score: number;
  category: string;
  details: {
    value: string | number;
    impact: 'positive' | 'negative' | 'neutral';
    context?: string;
  };
}

interface EnhancedSEOReport {
  url: string;
  overallScore: {
    score: number;
    interpretation: string;
    penalties: string[];
    bonuses: string[];
  };
  detailedScores: {
    titleScore: DetailedSEOScore;
    metaDescriptionScore: DetailedSEOScore;
    headingsScore: DetailedSEOScore;
    imageOptimizationScore: DetailedSEOScore;
    contentScore: DetailedSEOScore;
    technicalScore: DetailedSEOScore;
  };
  recommendations: Recommendation[];
}

interface Recommendation {
  id: string;
  category: string;
  impact: 'High' | 'Medium' | 'Low';
  title: string;
  description: string;
  steps: string[];
  additionalContext?: string;
}

function normalizeUrl(url: string): string {
  try {
    url = url.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }
    const urlObject = new URL(url);
    return urlObject.href;
  } catch (error) {
    throw new Error(`Invalid URL: ${url}`);
  }
}

function analyzeTitleTag($: cheerio.CheerioAPI): DetailedSEOScore {
  const title = $('title').text().trim();
  const titleLength = title.length;
  let score = 100;
  let impact: 'positive' | 'negative' | 'neutral' = 'neutral';
  let context = '';

  if (!title) {
    return {
      score: 0,
      category: 'Title Tag',
      details: {
        value: 'Missing',
        impact: 'negative',
        context: 'A title tag is crucial for SEO and user experience.'
      }
    };
  }

  if (titleLength < 30) {
    score -= 30;
    impact = 'negative';
    context = 'Title is too short. Aim for 30-60 characters.';
  } else if (titleLength > 60) {
    score -= 15;
    impact = 'negative';
    context = 'Title may be truncated in search results.';
  } else {
    impact = 'positive';
    context = 'Title length is optimal.';
  }

  return {
    score,
    category: 'Title Tag',
    details: {
      value: titleLength,
      impact,
      context
    }
  };
}

function analyzeMetaDescription($: cheerio.CheerioAPI): DetailedSEOScore {
  const metaDescription = $('meta[name="description"]').attr('content')?.trim() || '';
  const descLength = metaDescription.length;
  let score = 100;
  let impact: 'positive' | 'negative' | 'neutral' = 'neutral';
  let context = '';

  if (!metaDescription) {
    return {
      score: 0,
      category: 'Meta Description',
      details: {
        value: 'Missing',
        impact: 'negative',
        context: 'A meta description is important for SEO and click-through rates.'
      }
    };
  }

  if (descLength < 120) {
    score -= 20;
    impact = 'negative';
    context = 'Meta description is too short. Aim for 120-160 characters.';
  } else if (descLength > 160) {
    score -= 10;
    impact = 'negative';
    context = 'Meta description may be truncated in search results.';
  } else {
    impact = 'positive';
    context = 'Meta description length is optimal.';
  }

  return {
    score,
    category: 'Meta Description',
    details: {
      value: descLength,
      impact,
      context
    }
  };
}

function analyzeHeadings($: cheerio.CheerioAPI): DetailedSEOScore {
  const h1Count = $('h1').length;
  const h2Count = $('h2').length;
  const h3Count = $('h3').length;
  let score = 100;
  let impact: 'positive' | 'negative' | 'neutral' = 'neutral';
  let context = '';

  if (h1Count === 0) {
    score -= 30;
    impact = 'negative';
    context = 'Missing H1 heading.';
  } else if (h1Count > 1) {
    score -= 15;
    impact = 'negative';
    context = 'Multiple H1 headings found. Consider using only one.';
  } else {
    impact = 'positive';
    context = 'Proper H1 usage.';
  }

  if (h2Count === 0) {
    score -= 10;
    context += ' No H2 headings found.';
  }

  return {
    score,
    category: 'Heading Structure',
    details: {
      value: `H1: ${h1Count}, H2: ${h2Count}, H3: ${h3Count}`,
      impact,
      context
    }
  };
}

function analyzeImages($: cheerio.CheerioAPI): DetailedSEOScore {
  const images = $('img');
  const totalImages = images.length;
  const imagesWithAlt = $('img[alt]').length;
  let score = 100;
  let impact: 'positive' | 'negative' | 'neutral' = 'neutral';
  let context = '';

  if (totalImages === 0) {
    return {
      score: 100,
      category: 'Image Optimization',
      details: {
        value: 0,
        impact: 'neutral',
        context: 'No images found on the page.'
      }
    };
  }

  const altTextPercentage = (imagesWithAlt / totalImages) * 100;
  if (altTextPercentage < 100) {
    score -= Math.round((100 - altTextPercentage) / 2);
    impact = 'negative';
    context = `${totalImages - imagesWithAlt} out of ${totalImages} images missing alt text.`;
  } else {
    impact = 'positive';
    context = 'All images have alt text.';
  }

  return {
    score,
    category: 'Image Optimization',
    details: {
      value: altTextPercentage,
      impact,
      context
    }
  };
}

function analyzeContent($: cheerio.CheerioAPI): DetailedSEOScore {
  const wordCount = $('body').text().trim().split(/\s+/).length;
  const paragraphs = $('p').length;
  let score = 100;
  let impact: 'positive' | 'negative' | 'neutral' = 'neutral';
  let context = '';

  if (wordCount < 300) {
    score -= 30;
    impact = 'negative';
    context = 'Content length is too short. Consider adding more detailed content.';
  } else if (wordCount < 600) {
    score -= 15;
    impact = 'neutral';
    context = 'Content length is moderate. Could benefit from more detailed information.';
  } else {
    impact = 'positive';
    context = 'Good content length.';
  }

  return {
    score,
    category: 'Content Quality',
    details: {
      value: wordCount,
      impact,
      context
    }
  };
}

function analyzeTechnicalSEO($: cheerio.CheerioAPI): DetailedSEOScore {
  let score = 100;
  let impact: 'positive' | 'negative' | 'neutral' = 'neutral';
  const issues: string[] = [];

  // Check canonical URL
  const canonical = $('link[rel="canonical"]').attr('href');
  if (!canonical) {
    score -= 10;
    issues.push('No canonical tag found');
  }

  // Check viewport meta tag
  const viewport = $('meta[name="viewport"]').attr('content');
  if (!viewport) {
    score -= 10;
    issues.push('No viewport meta tag found');
  }

  // Check robots meta tag
  const robots = $('meta[name="robots"]').attr('content');
  if (!robots) {
    score -= 5;
    issues.push('No robots meta tag found');
  }

  impact = score < 70 ? 'negative' : score < 90 ? 'neutral' : 'positive';

  return {
    score,
    category: 'Technical SEO',
    details: {
      value: score,
      impact,
      context: issues.length > 0 ? `Issues found: ${issues.join(', ')}` : 'No major technical issues found'
    }
  };
}

async function enhancedAnalyzeSEO(url: string): Promise<EnhancedSEOReport> {
  let html: string;
  let fetchMethod = 'axios';
  let browser: Browser | null = null;

  async function attemptAxiosFetch() {
    try {
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
        },
        timeout: 15000,
        maxRedirects: 5,
      });
      return response.data;
    } catch (error) {
      console.log(`Axios fetch failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }

  async function attemptPuppeteerFetch() {
    try {
      // Configure chrome-aws-lambda
      const executablePath = await chromium.executablePath;

      if (!executablePath) {
        throw new Error('Chrome executable path not found');
      }

      // Launch browser with Vercel-specific configuration
      browser = await chromium.puppeteer.launch({
        args: chromium.args,
        defaultViewport: chromium.defaultViewport,
        executablePath: executablePath,
        headless: chromium.headless,
      });

      const page = await browser.newPage();
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
      
      // Set a timeout for navigation
      await page.setDefaultNavigationTimeout(10000);
      
      // Wait for network idle to ensure dynamic content is loaded
      await page.goto(url, { waitUntil: 'networkidle0' });
      
      // Get the rendered HTML
      const content = await page.content();
      return content;
    } catch (error) {
      console.log(`Puppeteer fetch failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }

  try {
    // First attempt: Axios
    try {
      html = await attemptAxiosFetch();
    } catch (axiosError) {
      console.log('Axios attempt failed, trying Puppeteer...');
      // Second attempt: Puppeteer
      fetchMethod = 'puppeteer';
      html = await attemptPuppeteerFetch();
    }

    const $ = cheerio.load(html);

    // Add fetch method to the report
    const baseReport = {
      url,
      fetchMethod,
      htmlLength: html.length,
    };

    // Perform SEO analysis
    const titleScore = analyzeTitleTag($);
    const metaDescriptionScore = analyzeMetaDescription($);
    const headingsScore = analyzeHeadings($);
    const imageScore = analyzeImages($);
    const contentScore = analyzeContent($);
    const technicalScore = analyzeTechnicalSEO($);

    const scores = [titleScore, metaDescriptionScore, headingsScore, imageScore, contentScore, technicalScore];
    const overallScore = calculateOverallScore(scores);

    return {
      ...baseReport,
      overallScore,
      detailedScores: {
        titleScore,
        metaDescriptionScore,
        headingsScore,
        imageOptimizationScore: imageScore,
        contentScore,
        technicalScore
      },
      recommendations: generateEnhancedRecommendations({
        titleScore,
        metaDescriptionScore,
        headingsScore,
        imageOptimizationScore: imageScore,
        contentScore,
        technicalScore
      })
    };
  } catch (error) {
    let errorMessage = 'Unknown error occurred while analyzing the website';
    if (error instanceof Error) {
      if (fetchMethod === 'axios' && axios.isAxiosError(error)) {
        if (error.code === 'ECONNREFUSED') {
          errorMessage = `Connection refused to ${url}. The website might be blocking automated requests.`;
        } else if (error.code === 'ENOTFOUND') {
          errorMessage = `Domain ${url} not found. Please check if the URL is correct.`;
        } else if (error.response) {
          errorMessage = `Server responded with error: ${error.response.status} ${error.response.statusText}`;
        } else if (error.request) {
          errorMessage = `No response received from ${url}. The website might be blocking automated requests.`;
        }
      } else if (fetchMethod === 'puppeteer') {
        errorMessage = `Failed to analyze ${url} using browser simulation. The website might have strong anti-bot measures.`;
      }
    }
    throw new Error(errorMessage);
  } finally {
    if (browser) {
      await (browser as Browser).close();
    }
  }
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  console.log('Received request:', req.method, req.body);

  if (req.method !== 'POST') {
    return res.status(405).json({ 
      error: 'Method not allowed',
      details: 'This endpoint only accepts POST requests'
    });
  }

  try {
    const { url } = req.body;
    
    if (!url) {
      console.log('No URL provided');
      return res.status(400).json({ 
        error: 'URL is required',
        details: 'Please provide a valid URL in the request body'
      });
    }

    console.log('Processing URL:', url);
    const normalizedUrl = normalizeUrl(url);
    console.log('Normalized URL:', normalizedUrl);
    
    const seoReport = await enhancedAnalyzeSEO(normalizedUrl);
    console.log('Analysis complete');
    
    return res.status(200).json(seoReport);
  } catch (error) {
    console.error('Error in handler:', error);
    
    let statusCode = 500;
    let errorMessage = 'An unknown error occurred';
    let errorDetails = '';

    if (error instanceof Error) {
      errorMessage = error.message;
      errorDetails = error.stack || '';
      
      // Determine appropriate status code based on error type
      if (errorMessage.includes('Domain not found')) {
        statusCode = 400;
      } else if (errorMessage.includes('Connection refused') || 
                 errorMessage.includes('No response received')) {
        statusCode = 503;
      }
    }
    
    return res.status(statusCode).json({ 
      error: errorMessage,
      details: errorDetails,
      suggestions: [
        'Check if the URL is correct and accessible',
        'Try analyzing the website later',
        'Make sure the website is not blocking automated requests',
        'If the issue persists, try analyzing a different URL'
      ]
    });
  }
}
function calculateOverallScore(scores: DetailedSEOScore[]): {
  score: number;
  interpretation: string;
  penalties: string[];
  bonuses: string[];
} {
  const totalScore = scores.reduce((acc, score) => acc + score.score, 0);
  const overallScore = Math.round(totalScore / scores.length);

  const penalties = scores
    .filter(score => score.details.impact === 'negative')
    .map(score => `${score.category}: ${score.details.context}`);

  const bonuses = scores
    .filter(score => score.details.impact === 'positive')
    .map(score => `${score.category}: ${score.details.context}`);

  let interpretation = '';
  if (overallScore >= 90) interpretation = 'Excellent SEO optimization';
  else if (overallScore >= 80) interpretation = 'Good SEO, with room for improvement';
  else if (overallScore >= 70) interpretation = 'Average SEO, needs attention';
  else interpretation = 'Poor SEO, requires significant improvements';

  return { score: overallScore, interpretation, penalties, bonuses };
}

function generateEnhancedRecommendations(scores: {
  [key: string]: DetailedSEOScore;
}): Recommendation[] {
  const recommendations: Recommendation[] = [];

  // Implementation for each score type...
  // Example for title:
  if (scores.titleScore.score < 90) {
    recommendations.push({
      id: 'title-optimization',
      category: 'Meta Tags',
      impact: scores.titleScore.score < 70 ? 'High' : 'Medium',
      title: 'Optimize Title Tag',
      description: scores.titleScore.details.context || 'Title needs improvement',
      steps: [
        'Keep title length between 30-60 characters',
        'Include primary keyword near the beginning',
        'Make it compelling and relevant to the page content',
        'Ensure each page has a unique title'
      ],
      additionalContext: 'Title tags are crucial for SEO and click-through rates.'
    });
  }

// Meta Description recommendations
if (scores.metaDescriptionScore.score < 90) {
  recommendations.push({
    id: 'meta-description-optimization',
    category: 'Meta Tags',
    impact: scores.metaDescriptionScore.score < 70 ? 'High' : 'Medium',
    title: 'Improve Meta Description',
    description: scores.metaDescriptionScore.details.context || 'Meta description needs optimization',
    steps: [
      'Write a compelling description between 120-160 characters',
      'Include relevant keywords naturally',
      'Make it actionable and aligned with the page content',
      'Ensure each page has a unique meta description'
    ],
    additionalContext: 'Meta descriptions impact click-through rates from search results.'
  });
}

// Headings recommendations
if (scores.headingsScore.score < 90) {
  recommendations.push({
    id: 'heading-structure-optimization',
    category: 'Content Structure',
    impact: scores.headingsScore.score < 70 ? 'High' : 'Medium',
    title: 'Optimize Heading Structure',
    description: scores.headingsScore.details.context || 'Heading structure needs improvement',
    steps: [
      'Use only one H1 heading per page',
      'Structure content with proper H2 and H3 subheadings',
      'Include relevant keywords in headings naturally',
      'Ensure headings create a logical content hierarchy'
    ],
    additionalContext: 'Proper heading structure improves both SEO and user experience.'
  });
}

// Image optimization recommendations
if (scores.imageOptimizationScore.score < 90) {
  recommendations.push({
    id: 'image-optimization',
    category: 'Media Optimization',
    impact: scores.imageOptimizationScore.score < 70 ? 'High' : 'Medium',
    title: 'Optimize Images',
    description: scores.imageOptimizationScore.details.context || 'Image optimization needed',
    steps: [
      'Add descriptive alt text to all images',
      'Compress images to reduce file size',
      'Use descriptive file names for images',
      'Implement lazy loading for images below the fold'
    ],
    additionalContext: 'Optimized images improve page load speed and accessibility.'
  });
}

// Content quality recommendations
if (scores.contentScore.score < 90) {
  recommendations.push({
    id: 'content-optimization',
    category: 'Content Quality',
    impact: scores.contentScore.score < 70 ? 'High' : 'Medium',
    title: 'Enhance Content Quality',
    description: scores.contentScore.details.context || 'Content needs improvement',
    steps: [
      'Aim for at least 600 words of quality content',
      'Structure content with short paragraphs and bullet points',
      'Include relevant keywords naturally throughout the content',
      'Add internal and external links to provide additional value'
    ],
    additionalContext: 'High-quality, comprehensive content is essential for SEO success.'
  });
}

// Technical SEO recommendations
if (scores.technicalScore.score < 90) {
  recommendations.push({
    id: 'technical-seo-optimization',
    category: 'Technical SEO',
    impact: scores.technicalScore.score < 70 ? 'High' : 'Medium',
    title: 'Improve Technical SEO',
    description: scores.technicalScore.details.context || 'Technical improvements needed',
    steps: [
      'Add a canonical tag to prevent duplicate content issues',
      'Implement a responsive design with proper viewport meta tag',
      'Add a robots meta tag to guide search engines',
      'Ensure proper XML sitemap implementation'
    ],
    additionalContext: 'Technical SEO provides the foundation for overall SEO success.'
  });
}

  return recommendations;
}



export { enhancedAnalyzeSEO, type EnhancedSEOReport };