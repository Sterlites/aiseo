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
    mobileFriendlinessScore: DetailedSEOScore; // Add this line
    linkingStructureScore: DetailedSEOScore; // Add this line
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
        context: 'A meta description is crucial for SEO and click-through rates.'
      }
    };
  }

  if (descLength < 120) {
    score -= 20;
    impact = 'negative';
    context = 'Meta description is too short. Aim for 120-160 characters.';
  } else if (descLength > 160) {
    score -= 10;
    impact = 'neutral';
    context = 'Meta description exceeds 160 characters. Consider shortening it for optimal display in search results.';
  } else {
    impact = 'positive';
    context = 'Meta description length is optimal.';
  }

  // Check for keyword inclusion
  const pageTitle = $('title').text().toLowerCase();
  const keywords = pageTitle.split(' ').filter(word => word.length > 3);
  const keywordInDescription = keywords.some(keyword => metaDescription.toLowerCase().includes(keyword));

  if (!keywordInDescription) {
    score -= 10;
    context += ' Consider including a relevant keyword from the title in the meta description.';
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
  const h1Elements = $('body h1, body noscript h1').toArray();
  const h1Count = h1Elements.length;
  const h2Count = $('body h2, body noscript h2').length;
  const h3Count = $('body h3, body noscript h3').length;
  let score = 100;
  let impact: 'positive' | 'negative' | 'neutral' = 'neutral';
  let context = '';

  if (h1Count === 0) {
    score -= 30;
    impact = 'negative';
    context = 'Missing H1 heading. Each page should have exactly one H1 tag.';
  } else if (h1Count > 1) {
    score -= 15;
    impact = 'negative';
    context = `Multiple H1 headings found (${h1Count}). Consider using only one H1 tag per page.`;
  } else {
    impact = 'positive';
    context = 'Proper H1 usage.';
  }

  if (h2Count === 0) {
    score -= 10;
    context += ' No H2 headings found. Consider using H2 tags to structure your content.';
  } else {
    context += ` Good use of H2 headings (${h2Count} found).`;
  }

  // Check for keyword in H1
  const pageTitle = $('title').text().toLowerCase();
  const keywords = pageTitle.split(' ').filter(word => word.length > 3);
  const h1Text = h1Elements.map(el => $(el).text().toLowerCase()).join(' ');
  const keywordInH1 = keywords.some(keyword => h1Text.includes(keyword));

  if (!keywordInH1 && h1Count > 0) {
    score -= 10;
    context += ' Consider including a relevant keyword from the title in the H1 tag.';
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

function analyzeMobileFriendliness($: cheerio.CheerioAPI): DetailedSEOScore {
  let score = 100;
  let impact: 'positive' | 'negative' | 'neutral' = 'neutral';
  let context = '';

  const viewport = $('meta[name="viewport"]').attr('content');
  if (!viewport) {
    score -= 50;
    impact = 'negative';
    context = 'No viewport meta tag found. This is crucial for mobile responsiveness.';
  } else if (!viewport.includes('width=device-width') || !viewport.includes('initial-scale=1')) {
    score -= 25;
    impact = 'negative';
    context = 'Viewport meta tag is present but may not be optimally configured for mobile devices.';
  } else {
    impact = 'positive';
    context = 'Viewport meta tag is properly configured for mobile devices.';
  }

  return {
    score,
    category: 'Mobile-Friendliness',
    details: {
      value: viewport || 'Not found',
      impact,
      context
    }
  };
}

function analyzeLinkingStructure($: cheerio.CheerioAPI): DetailedSEOScore {
  const internalLinks = $('a[href^="/"], a[href^="' + $('meta[property="og:url"]').attr('content') + '"]').length;
  const externalLinks = $('a[href^="http"]:not([href^="' + $('meta[property="og:url"]').attr('content') + '"])').length;
  let score = 100;
  let impact: 'positive' | 'negative' | 'neutral' = 'neutral';
  let context = '';

  if (internalLinks === 0) {
    score -= 20;
    impact = 'negative';
    context = 'No internal links found. Consider adding links to other pages on your site.';
  } else if (internalLinks < 5) {
    score -= 10;
    impact = 'neutral';
    context = 'Few internal links found. Consider increasing internal linking.';
  } else {
    impact = 'positive';
    context = 'Good use of internal linking.';
  }

  if (externalLinks === 0) {
    score -= 10;
    context += ' No external links found. Consider adding links to authoritative sources.';
  } else {
    context += ' Good use of external linking.';
  }

  return {
    score,
    category: 'Linking Structure',
    details: {
      value: `Internal: ${internalLinks}, External: ${externalLinks}`,
      impact,
      context
    }
  };
}



function analyzeContentQuality($: cheerio.CheerioAPI): DetailedSEOScore {
  // Get visible body text, excluding scripts, styles, and noscript content
  const bodyText = $('body').clone().children('script, style, noscript').remove().end().text().trim();
  
  // Get noscript content
  const noscriptContent = $('noscript').text().trim();
  
  // Combine body text and noscript content
  const combinedText = `${bodyText} ${noscriptContent}`;
  
  const wordCount = combinedText.split(/\s+/).length;
  let score = 100;
  let impact: 'positive' | 'negative' | 'neutral' = 'neutral';
  let context = '';

  if (wordCount < 300) {
    score -= 30;
    impact = 'negative';
    context = 'Content length is too short. Aim for at least 300 words of quality content.';
  } else if (wordCount < 600) {
    score -= 15;
    impact = 'neutral';
    context = 'Content length is moderate. Consider expanding to at least 600 words for more comprehensive coverage.';
  } else {
    impact = 'positive';
    context = 'Good content length.';
  }

  // Check for noscript content
  if (noscriptContent.length > 0) {
    score += 5; // Bonus for having noscript content
    context += ' Noscript content present, which is good for accessibility and SEO.';
  }

  // Analyze keyword usage
  const metaKeywords = $('meta[name="keywords"]').attr('content')?.toLowerCase().split(',').map(k => k.trim()) || [];
  const pageTitle = $('title').text().toLowerCase();
  const titleKeywords = pageTitle.split(' ').filter(word => word.length > 3);
  const allKeywords = [...new Set([...metaKeywords, ...titleKeywords])];

  const keywordDensity = allKeywords.reduce((density, keyword) => {
    const count = (combinedText.toLowerCase().match(new RegExp(`\\b${keyword}\\b`, 'g')) || []).length;
    return density + (count / wordCount);
  }, 0);

  if (keywordDensity < 0.01) {
    score -= 10;
    context += ' Keyword density is low. Consider naturally incorporating more relevant keywords.';
  } else if (keywordDensity > 0.03) {
    score -= 5;
    context += ' Keyword density is high. Ensure the content reads naturally and isn\'t over-optimized.';
  } else {
    context += ' Good keyword usage and density.';
  }
  // Simple readability check (can be expanded with more sophisticated algorithms)
  const sentences = bodyText.split(/[.!?]+/);
  const avgWordsPerSentence = wordCount / sentences.length;
  if (avgWordsPerSentence > 20) {
    score -= 10;
    context += ' Average sentence length is high. Consider shortening sentences for better readability.';
  }
  return {
    score,
    category: 'Content Quality',
    details: {
      value: `Word count: ${wordCount}, Avg words per sentence: ${avgWordsPerSentence.toFixed(1)}`,
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

  // Check for Open Graph tags
  const ogTitle = $('meta[property="og:title"]').attr('content');
  const ogDescription = $('meta[property="og:description"]').attr('content');
  const ogImage = $('meta[property="og:image"]').attr('content');
  if (!ogTitle || !ogDescription || !ogImage) {
    score -= 5;
    issues.push('Incomplete Open Graph tags');
  }

  // Check for Twitter Card tags
  const twitterCard = $('meta[name="twitter:card"]').attr('content');
  if (!twitterCard) {
    score -= 5;
    issues.push('No Twitter Card meta tag found');
  }

  // Check for structured data
  const structuredData = $('script[type="application/ld+json"]');
  if (structuredData.length === 0) {
    score -= 10;
    issues.push('No structured data (JSON-LD) found');
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
      console.log('response', response.data);
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

    // Perform SEO analysis
    const titleScore = analyzeTitleTag($);
    const metaDescriptionScore = analyzeMetaDescription($);
    const headingsScore = analyzeHeadings($);
    const imageScore = analyzeImages($);
    const contentScore = analyzeContentQuality($);
    const technicalScore = analyzeTechnicalSEO($);
    const mobileFriendlinessScore = analyzeMobileFriendliness($);
    const linkingStructureScore = analyzeLinkingStructure($);

    const scores = [
      titleScore,
      metaDescriptionScore,
      headingsScore,
      imageScore,
      contentScore,
      technicalScore,
      mobileFriendlinessScore,
      linkingStructureScore
    ];
    const overallScore = calculateOverallScore(scores);

    return {
      url,
      overallScore,
      detailedScores: {
        titleScore,
        metaDescriptionScore,
        headingsScore,
        imageOptimizationScore: imageScore,
        contentScore,
        technicalScore,
        mobileFriendlinessScore,
        linkingStructureScore
      },
      recommendations: generateEnhancedRecommendations({
        titleScore,
        metaDescriptionScore,
        headingsScore,
        imageOptimizationScore: imageScore,
        contentScore,
        technicalScore,
        mobileFriendlinessScore,
        linkingStructureScore
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

  // Update heading structure recommendation
  if (scores.headingsScore.score < 100) {
    recommendations.push({
      id: 'heading-structure-optimization',
      category: 'Content Structure',
      impact: scores.headingsScore.score < 70 ? 'High' : 'Medium',
      title: 'Optimize Heading Structure',
      description: scores.headingsScore.details.context || 'Heading structure needs improvement',
      steps: [
        'Ensure there is exactly one H1 heading per page',
        'Use H2 and H3 subheadings to structure your content logically',
        'Include relevant keywords in headings naturally',
        'Check that headings in noscript content are properly structured'
      ],
      additionalContext: 'Proper heading structure improves both SEO and user experience, including for users with JavaScript disabled.'
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

  // Update content quality recommendation
  if (scores.contentScore.score < 100) {
    recommendations.push({
      id: 'content-optimization',
      category: 'Content Quality',
      impact: scores.contentScore.score < 70 ? 'High' : 'Medium',
      title: 'Enhance Content Quality',
      description: scores.contentScore.details.context || 'Content needs improvement',
      steps: [
        'Aim for at least 600 words of quality content, including noscript content',
        'Ensure content is valuable and relevant to users with and without JavaScript',
        'Incorporate relevant keywords naturally throughout the content',
        'Add internal and external links to provide additional value'
      ],
      additionalContext: 'High-quality, comprehensive content is essential for SEO success, regardless of whether JavaScript is enabled.'
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

  // Add recommendation for noscript content if needed
  if (scores?.technicalScore?.details?.context?.includes('No noscript tag found') || 
  scores?.technicalScore?.details?.context?.includes('Empty noscript tag found')) {
    recommendations.push({
      id: 'noscript-content-optimization',
      category: 'Accessibility and SEO',
      impact: 'Medium',
      title: 'Improve Noscript Content',
      description: 'Add or improve content within noscript tags',
      steps: [
        'Add a noscript tag if not present',
        'Include relevant content within the noscript tag',
        'Ensure the noscript content provides value to users without JavaScript',
        'Consider adding a text version of your main content within noscript tags'
      ],
      additionalContext: 'Noscript content improves accessibility for users without JavaScript and can be beneficial for SEO.'
    });
  }

// Add recommendations for mobile-friendliness
if (scores.mobileFriendlinessScore.score < 90) {
  recommendations.push({
    id: 'mobile-optimization',
    category: 'Mobile-Friendliness',
    impact: scores.mobileFriendlinessScore.score < 70 ? 'High' : 'Medium',
    title: 'Improve Mobile-Friendliness',
    description: scores.mobileFriendlinessScore.details.context || 'Mobile optimization needed',
    steps: [
      'Ensure viewport meta tag is properly set',
      'Use responsive design techniques',
      'Test on various mobile devices and screen sizes',
      'Optimize touch targets for mobile users'
    ],
    additionalContext: 'Mobile-friendliness is crucial for both user experience and SEO.'
  });
}

// Add recommendations for linking structure
if (scores.linkingStructureScore.score < 90) {
  recommendations.push({
    id: 'linking-structure-optimization',
    category: 'Content and Navigation',
    impact: scores.linkingStructureScore.score < 70 ? 'High' : 'Medium',
    title: 'Enhance Linking Structure',
    description: scores.linkingStructureScore.details.context || 'Linking structure needs improvement',
    steps: [
      'Increase internal linking to relevant pages',
      'Add external links to authoritative sources',
      'Use descriptive anchor text for links',
      'Ensure all links are functional and relevant'
    ],
    additionalContext: 'A good linking structure improves navigation and helps search engines understand your site.'
  });
}

return recommendations;
}



export { enhancedAnalyzeSEO, type EnhancedSEOReport };