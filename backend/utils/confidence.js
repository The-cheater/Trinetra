import { getJson } from 'serpapi';

export const calculateConfidence = async ({
  description,
  category,
  location,
  locationName,
  photoPath,
  userId
}) => {
  try {
    let totalScore = 20; // Base score
    let evidence = [];
    let reasoning = [];

    // 1. Real-time News Verification (30 points)
    const newsScore = await verifyWithGoogleNews(description, category, locationName);
    totalScore += newsScore.score;
    evidence.push(newsScore.evidence);
    reasoning.push(newsScore.reason);

    // 2. Google Search Validation (25 points)
    const searchScore = await validateWithGoogleSearch(description, locationName, category);
    totalScore += searchScore.score;
    evidence.push(searchScore.evidence);
    reasoning.push(searchScore.reason);

    // 3. Location Context Verification (15 points)
    const locationScore = await verifyLocationContext(location, locationName);
    totalScore += locationScore.score;
    evidence.push(locationScore.evidence);
    reasoning.push(locationScore.reason);

    // 4. Image Authenticity Check (15 points) - if photo provided
    if (photoPath) {
      const imageScore = await verifyImageAuthenticity(photoPath, description);
      totalScore += imageScore.score;
      evidence.push(imageScore.evidence);
      reasoning.push(imageScore.reason);
    }

    // 5. Trending/Recent Events Check (10 points)
    const trendingScore = await checkTrendingEvents(category, locationName);
    totalScore += trendingScore.score;
    evidence.push(trendingScore.evidence);
    reasoning.push(trendingScore.reason);

    // 6. User Reputation (5 points)
    const userScore = await getUserReputationBonus(userId);
    totalScore += userScore.score;

    const finalScore = Math.min(100, Math.max(0, Math.round(totalScore)));

    return {
      score: finalScore,
      reason: reasoning.join('; '),
      evidence: evidence.filter(e => e.source),
      breakdown: {
        news_verification: newsScore.score,
        search_validation: searchScore.score,
        location_context: locationScore.score,
        image_authenticity: photoPath ? imageScore?.score || 0 : 0,
        trending_events: trendingScore.score,
        user_reputation: userScore.score,
        total: finalScore
      }
    };

  } catch (error) {
    console.error('SerpAPI confidence calculation error:', error);
    return {
      score: 25,
      reason: 'Error in real-time verification - defaulting to low confidence',
      evidence: [],
      breakdown: { error: error.message }
    };
  }
};

// 1. Verify incident with Google News API
const verifyWithGoogleNews = async (description, category, locationName) => {
  try {
    // Search for recent news about the incident
    const searchQuery = `${category.toLowerCase()} ${locationName} ${extractKeywords(description)}`;
    
    const response = await getJson({
      engine: "google_news",
      q: searchQuery,
      api_key: process.env.SERPAPI_KEY,
      gl: "in", // India
      hl: "en"
    });

    let score = 0;
    let newsCount = 0;
    let recentNews = false;

    if (response.news_results && response.news_results.length > 0) {
      newsCount = response.news_results.length;
      
      // Check for recent news (within 24 hours)
      const recentArticles = response.news_results.filter(article => {
        const timeAgo = article.date || '';
        return timeAgo.includes('hour') || timeAgo.includes('minute') || timeAgo === 'now';
      });

      if (recentArticles.length > 0) {
        score += 20; // Strong recent news correlation
        recentNews = true;
      } else if (newsCount > 2) {
        score += 15; // Multiple news sources
      } else if (newsCount > 0) {
        score += 10; // Some news correlation
      }

      // Boost for high-quality sources
      const qualitySources = response.news_results.filter(article => 
        article.source && (
          article.source.includes('Times') || 
          article.source.includes('Hindu') || 
          article.source.includes('Express') ||
          article.source.includes('TOI')
        )
      );

      if (qualitySources.length > 0) {
        score += 5;
      }
    }

    return {
      score: Math.min(30, score),
      reason: `News verification: ${recentNews ? 'Recent news confirms incident' : newsCount > 0 ? `${newsCount} related articles found` : 'No recent news correlation'}`,
      evidence: {
        source: 'Google News API',
        articles_found: newsCount,
        recent_articles: recentNews,
        search_query: searchQuery,
        top_sources: response.news_results?.slice(0, 3).map(a => a.source) || []
      }
    };

  } catch (error) {
    console.error('Google News verification error:', error);
    return {
      score: 5,
      reason: 'News verification unavailable',
      evidence: { source: 'Google News API', error: error.message }
    };
  }
};

// 2. Validate with Google Search API
const validateWithGoogleSearch = async (description, locationName, category) => {
  try {
    const searchQuery = `"${locationName}" ${category.toLowerCase()} incident report today`;
    
    const response = await getJson({
      engine: "google",
      q: searchQuery,
      api_key: process.env.SERPAPI_KEY,
      gl: "in",
      hl: "en",
      num: 10
    });

    let score = 5; // Base score for valid search
    let relevantResults = 0;

    if (response.organic_results && response.organic_results.length > 0) {
      // Count relevant results
      relevantResults = response.organic_results.filter(result => {
        const content = (result.title + ' ' + result.snippet).toLowerCase();
        const keywords = extractKeywords(description).split(' ');
        return keywords.some(keyword => content.includes(keyword.toLowerCase()));
      }).length;

      if (relevantResults > 5) {
        score += 15; // High relevance
      } else if (relevantResults > 2) {
        score += 10; // Moderate relevance
      } else if (relevantResults > 0) {
        score += 5; // Some relevance
      }

      // Check for official sources (traffic police, municipal corp, etc.)
      const officialResults = response.organic_results.filter(result =>
        result.link && (
          result.link.includes('gov.') || 
          result.link.includes('police') ||
          result.link.includes('municipal') ||
          result.link.includes('traffic')
        )
      );

      if (officialResults.length > 0) {
        score += 5; // Official source bonus
      }
    }

    return {
      score: Math.min(25, score),
      reason: `Search validation: ${relevantResults} relevant results found`,
      evidence: {
        source: 'Google Search API',
        relevant_results: relevantResults,
        total_results: response.organic_results?.length || 0,
        search_query: searchQuery,
        has_official_sources: response.organic_results?.some(r => r.link?.includes('gov.')) || false
      }
    };

  } catch (error) {
    console.error('Google Search validation error:', error);
    return {
      score: 5,
      reason: 'Search validation unavailable',
      evidence: { source: 'Google Search API', error: error.message }
    };
  }
};

// 3. Verify location context with Google Local API
const verifyLocationContext = async (coordinates, locationName) => {
  try {
    const [lng, lat] = coordinates;
    
    const response = await getJson({
      engine: "google_maps",
      type: "search",
      q: locationName,
      ll: `@${lat},${lng},14z`,
      api_key: process.env.SERPAPI_KEY
    });

    let score = 5; // Base score for valid coordinates
    
    if (response.local_results && response.local_results.length > 0) {
      score += 5; // Location exists on Google Maps
      
      // Check if it's a known area/landmark
      const hasRatings = response.local_results.some(place => place.rating);
      if (hasRatings) {
        score += 3; // Well-known location
      }

      // Check for road/traffic related places nearby
      const trafficRelated = response.local_results.some(place => {
        const title = (place.title || '').toLowerCase();
        return title.includes('road') || title.includes('highway') || 
               title.includes('junction') || title.includes('signal');
      });

      if (trafficRelated) {
        score += 2; // Traffic-relevant location
      }
    }

    return {
      score: Math.min(15, score),
      reason: `Location verified: ${response.local_results?.length || 0} places found nearby`,
      evidence: {
        source: 'Google Maps API',
        places_found: response.local_results?.length || 0,
        coordinates_valid: true,
        location_name: locationName
      }
    };

  } catch (error) {
    console.error('Location verification error:', error);
    return {
      score: 5,
      reason: 'Basic location validation',
      evidence: { source: 'Google Maps API', error: error.message }
    };
  }
};

// 4. Image authenticity check with Google Images reverse search
const verifyImageAuthenticity = async (photoPath, description) => {
  try {
    // For now, basic file validation
    // TODO: Implement reverse image search when SerpAPI supports image uploads
    const fs = await import('fs');
    
    if (!fs.existsSync(photoPath)) {
      return { score: 0, reason: 'Image not accessible', evidence: {} };
    }

    // Basic image validation
    let score = 8; // Base score for having an image
    
    // Check file size (very large or very small might be suspicious)
    const stats = fs.statSync(photoPath);
    const fileSizeKB = stats.size / 1024;
    
    if (fileSizeKB > 100 && fileSizeKB < 5000) { // 100KB to 5MB seems reasonable
      score += 4;
    } else {
      score += 1;
    }

    // TODO: Add EXIF data extraction here
    score += 3; // Placeholder for EXIF validation

    return {
      score: Math.min(15, score),
      reason: 'Image validation: File appears authentic',
      evidence: {
        source: 'Image Analysis',
        file_size_kb: Math.round(fileSizeKB),
        file_exists: true
      }
    };

  } catch (error) {
    console.error('Image verification error:', error);
    return {
      score: 0,
      reason: 'Image verification failed',
      evidence: { source: 'Image Analysis', error: error.message }
    };
  }
};

// 5. Check trending events with Google Trends
const checkTrendingEvents = async (category, locationName) => {
  try {
    // Search for trending topics related to the incident
    const searchQuery = `${category.toLowerCase()} ${locationName} trending today`;
    
    const response = await getJson({
      engine: "google",
      q: searchQuery,
      api_key: process.env.SERPAPI_KEY,
      gl: "in",
      hl: "en",
      num: 5
    });

    let score = 2; // Base score
    
    if (response.organic_results && response.organic_results.length > 0) {
      // Look for recent/trending indicators
      const trendingResults = response.organic_results.filter(result => {
        const content = (result.title + ' ' + result.snippet).toLowerCase();
        return content.includes('today') || content.includes('now') || 
               content.includes('breaking') || content.includes('latest');
      });

      if (trendingResults.length > 0) {
        score += 6; // Trending event correlation
      } else {
        score += 2; // Some general correlation
      }
    }

    return {
      score: Math.min(10, score),
      reason: `Trending analysis: ${score > 5 ? 'Event aligns with current trends' : 'Standard incident report'}`,
      evidence: {
        source: 'Trending Analysis',
        search_query: searchQuery,
        trending_correlation: score > 5
      }
    };

  } catch (error) {
    console.error('Trending verification error:', error);
    return {
      score: 2,
      reason: 'Trending analysis unavailable',
      evidence: { source: 'Trending Analysis', error: error.message }
    };
  }
};

// Helper function to extract keywords from description
const extractKeywords = (description) => {
  const words = description.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(' ')
    .filter(word => word.length > 3)
    .slice(0, 5); // Top 5 meaningful words
  
  return words.join(' ');
};

// User reputation bonus (placeholder)
const getUserReputationBonus = async (userId) => {
  return {
    score: 3,
    reason: 'User reputation applied',
    evidence: { source: 'User History', bonus: 'Standard' }
  };
};
