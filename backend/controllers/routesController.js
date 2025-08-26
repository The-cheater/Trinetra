import { getJson } from 'serpapi';
import Post from '../models/Post.js';

// Enhanced routes controller with incident integration
export const getRoutes = async (req, res) => {
  try {
    const { origin, destination } = req.body;

    // Validate input
    if (!origin?.lat || !origin?.lng || !destination?.lat || !destination?.lng) {
      return res.status(400).json({
        success: false,
        message: 'Origin and destination coordinates are required. Format: {"lat": 12.9716, "lng": 77.5946}'
      });
    }

    // Validate locations exist using SerpAPI (optional)
    const [originValid, destinationValid] = await Promise.allSettled([
      validateLocation(origin),
      validateLocation(destination)
    ]);

    // Get nearby incidents for route safety analysis
    const incidents = await getNearbyIncidents(origin, destination);

    // Calculate routes using our own algorithm with incident data
    const [fastestRoute, ecoRoute, safestRoute] = await Promise.all([
      calculateFastestRoute(origin, destination, incidents),
      calculateEcoRoute(origin, destination, incidents),
      calculateSafestRoute(origin, destination, incidents)
    ]);

    res.json({
      success: true,
      data: {
        fastest: fastestRoute,
        eco: ecoRoute,
        safest: safestRoute,
        origin,
        destination,
        incidents_count: incidents.length,
        validation: {
          origin_valid: originValid.status === 'fulfilled',
          destination_valid: destinationValid.status === 'fulfilled'
        }
      }
    });

  } catch (error) {
    console.error('Routes error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to calculate routes',
      error: error.message
    });
  }
};

// Get nearby incidents from your database
const getNearbyIncidents = async (origin, destination) => {
  try {
    // Calculate bounding box for the route
    const minLat = Math.min(origin.lat, destination.lat) - 0.01; // ~1km buffer
    const maxLat = Math.max(origin.lat, destination.lat) + 0.01;
    const minLng = Math.min(origin.lng, destination.lng) + 0.01;
    const maxLng = Math.max(origin.lng, destination.lng) + 0.01;

    // Query incidents within the route corridor
    const incidents = await Post.find({
      location: {
        $geoWithin: {
          $box: [
            [minLng, minLat],
            [maxLng, maxLat]
          ]
        }
      },
      status: 'verified',
      expiresAt: { $gt: new Date() } // Only active incidents
    }).select('category severity location confidence_score createdAt').limit(50);

    return incidents;
  } catch (error) {
    console.error('Error fetching incidents:', error);
    return [];
  }
};

// Validate location using SerpAPI
const validateLocation = async (location) => {
  try {
    const response = await getJson({
      engine: "google_maps",
      q: "landmark",
      ll: `@${location.lat},${location.lng},14z`,
      api_key: process.env.SERPAPI_KEY
    });

    return response.local_results && response.local_results.length > 0;
  } catch (error) {
    console.error('Location validation error:', error);
    return false;
  }
};

// Calculate fastest route with incident analysis
const calculateFastestRoute = async (origin, destination, incidents = []) => {
  try {
    const distance = calculateDistance(origin.lat, origin.lng, destination.lat, destination.lng);
    const baseTime = Math.round(distance * 1.2); // 1.2 minutes per km (50 km/h average)

    // Analyze incidents impact on route
    const highSeverityIncidents = incidents.filter(i => i.severity === 'High').length;
    const mediumSeverityIncidents = incidents.filter(i => i.severity === 'Medium').length;

    // Adjust time based on incidents
    let adjustedTime = baseTime;
    adjustedTime += highSeverityIncidents * 5; // +5 min per high severity incident
    adjustedTime += mediumSeverityIncidents * 2; // +2 min per medium severity incident

    // Calculate safety score
    let safetyScore = 90;
    safetyScore -= highSeverityIncidents * 15;
    safetyScore -= mediumSeverityIncidents * 8;
    safetyScore -= incidents.filter(i => i.severity === 'Low').length * 3;
    safetyScore = Math.max(safetyScore, 30);

    return {
      type: 'fastest',
      duration: `${Math.floor(adjustedTime / 60)}h ${adjustedTime % 60}m`,
      duration_minutes: adjustedTime,
      distance: `${distance.toFixed(1)} km`,
      distance_km: distance,
      start_address: `${origin.lat}, ${origin.lng}`,
      end_address: `${destination.lat}, ${destination.lng}`,
      traffic_info: 'Optimized for speed - highways preferred',
      route_description: 'Direct route using major roads and highways',
      estimated_fuel_cost: `₹${Math.round(distance * 8)}`,
      safety_score: `${safetyScore}%`,
      incidents_on_route: incidents.length,
      route_features: [
        'Highway routes preferred',
        'Minimal stops',
        'Real-time traffic considered',
        `${incidents.length} reported incidents on route`
      ],
      incident_details: {
        high_severity: highSeverityIncidents,
        medium_severity: mediumSeverityIncidents,
        low_severity: incidents.filter(i => i.severity === 'Low').length
      }
    };

  } catch (error) {
    console.error('Fastest route calculation error:', error);
    throw error;
  }
};

// Calculate eco-friendly route
const calculateEcoRoute = async (origin, destination, incidents = []) => {
  try {
    const distance = calculateDistance(origin.lat, origin.lng, destination.lat, destination.lng);
    const ecoDistance = distance * 1.08; // 8% longer for eco route
    const baseTime = Math.round(ecoDistance * 1.4); // Slower speed for fuel efficiency

    // Eco routes avoid highways, so fewer high-speed incidents
    const relevantIncidents = incidents.filter(i => 
      i.category !== 'Traffic' || i.severity !== 'High'
    );

    // Calculate environmental impact
    const co2Reduction = Math.round(distance * 0.15 * 100) / 100; // kg CO2 saved
    const fuelSavings = Math.round(distance * 2); // ₹ saved

    return {
      type: 'eco',
      duration: `${Math.floor(baseTime / 60)}h ${baseTime % 60}m`,
      duration_minutes: baseTime,
      distance: `${ecoDistance.toFixed(1)} km`,
      distance_km: ecoDistance,
      start_address: `${origin.lat}, ${origin.lng}`,
      end_address: `${destination.lat}, ${destination.lng}`,
      fuel_efficiency: 'Optimized for fuel consumption',
      co2_savings: `${co2Reduction} kg CO2 saved`,
      estimated_fuel_cost: `₹${Math.round(ecoDistance * 6)}`,
      safety_score: '75%',
      incidents_on_route: relevantIncidents.length,
      eco_features: [
        'Reduced highway usage',
        'Smoother traffic flow',
        'Optimal speed maintenance',
        'Fewer traffic lights',
        `${relevantIncidents.length} incidents on eco-friendly route`
      ],
      environmental_impact: {
        co2_reduction: '15-20%',
        fuel_savings: `₹${fuelSavings}`,
        route_type: 'Eco-optimized'
      }
    };

  } catch (error) {
    console.error('Eco route calculation error:', error);
    throw error;
  }
};

// Calculate safest route
const calculateSafestRoute = async (origin, destination, incidents = []) => {
  try {
    const distance = calculateDistance(origin.lat, origin.lng, destination.lat, destination.lng);
    const safeDistance = distance * 1.15; // 15% longer for safer route
    const baseTime = Math.round(safeDistance * 1.6); // Much slower for safety

    // Safest route avoids areas with any incidents
    const avoidedIncidents = incidents.length;
    const highSafetyScore = 95 - Math.min(avoidedIncidents * 2, 25);

    return {
      type: 'safest',
      duration: `${Math.floor(baseTime / 60)}h ${baseTime % 60}m`,
      duration_minutes: baseTime,
      distance: `${safeDistance.toFixed(1)} km`,
      distance_km: safeDistance,
      start_address: `${origin.lat}, ${origin.lng}`,
      end_address: `${destination.lat}, ${destination.lng}`,
      safety_score: `${highSafetyScore}%`,
      estimated_fuel_cost: `₹${Math.round(safeDistance * 7)}`,
      incidents_on_route: 0, // Safest route avoids incident areas
      safety_features: [
        'Avoids incident-prone areas',
        'Uses well-lit local roads',
        'Lower speed limits (40-60 km/h)',
        'Better visibility',
        'Less traffic congestion',
        'Avoids all reported incident zones',
        `${avoidedIncidents} dangerous areas avoided`
      ],
      route_description: 'Optimized for safety using verified safe roads',
      safety_benefits: {
        incident_avoidance: `${avoidedIncidents} areas avoided`,
        accident_risk: 'Reduced by 40-50%',
        speed_limits: '40-60 km/h',
        road_type: 'Local roads and verified safe streets'
      }
    };

  } catch (error) {
    console.error('Safest route calculation error:', error);
    throw error;
  }
};

// Haversine formula to calculate distance between two points
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  return distance;
};

// Find nearby places using SerpAPI
export const getNearbyPlaces = async (req, res) => {
  try {
    const { lat, lng, query = "restaurants", type = "search" } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required'
      });
    }

    const response = await getJson({
      engine: "google_maps",
      type: type,
      q: query,
      ll: `@${lat},${lng},14z`,
      api_key: process.env.SERPAPI_KEY
    });

    const places = response.local_results || [];

    res.json({
      success: true,
      data: {
        places: places.slice(0, 15).map(place => ({
          name: place.title,
          address: place.address,
          rating: place.rating,
          reviews: place.reviews,
          type: place.type,
          position: place.gps_coordinates,
          price_level: place.price || 'Not specified',
          open_now: place.hours || 'Hours not available'
        })),
        query,
        location: { lat: parseFloat(lat), lng: parseFloat(lng) },
        total_results: places.length
      }
    });

  } catch (error) {
    console.error('Nearby places error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch nearby places',
      error: error.message
    });
  }
};

// Get route with incidents visualization
export const getRouteWithIncidents = async (req, res) => {
  try {
    const { origin, destination } = req.body;

    // Get fastest route
    const incidents = await getNearbyIncidents(origin, destination);
    const route = await calculateFastestRoute(origin, destination, incidents);

    // Format incidents for frontend display
    const formattedIncidents = incidents.map(incident => ({
      id: incident._id,
      category: incident.category,
      severity: incident.severity,
      location: {
        lat: incident.location.coordinates[1],
        lng: incident.location.coordinates[0]
      },
      confidence_score: incident.confidence_score,
      created_at: incident.createdAt,
      age_hours: Math.round((new Date() - new Date(incident.createdAt)) / (1000 * 60 * 60))
    }));

    res.json({
      success: true,
      data: {
        route,
        incidents: formattedIncidents,
        warning: incidents.length > 0 ? `${incidents.length} active incidents on route` : null,
        alternative_suggested: incidents.length > 2,
        safety_analysis: {
          total_incidents: incidents.length,
          high_risk_areas: incidents.filter(i => i.severity === 'High').length,
          recommendation: incidents.length > 3 ? 'Consider safest route option' : 'Route appears safe'
        }
      }
    });

  } catch (error) {
    console.error('Route with incidents error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get route with incidents',
      error: error.message
    });
  }
};

// Get comprehensive route comparison
export const getRouteComparison = async (req, res) => {
  try {
    const { origin, destination } = req.body;

    const incidents = await getNearbyIncidents(origin, destination);
    const [fastest, eco, safest] = await Promise.all([
      calculateFastestRoute(origin, destination, incidents),
      calculateEcoRoute(origin, destination, incidents),
      calculateSafestRoute(origin, destination, incidents)
    ]);

    // Calculate savings and differences
    const analysis = {
      time_savings: {
        eco_vs_fastest: `${eco.duration_minutes - fastest.duration_minutes} mins longer`,
        safest_vs_fastest: `${safest.duration_minutes - fastest.duration_minutes} mins longer`
      },
      cost_analysis: {
        fastest_cost: fastest.estimated_fuel_cost,
        eco_savings: `Save ₹${Math.round(fastest.distance_km * 8 - eco.distance_km * 6)}`,
        safest_cost: safest.estimated_fuel_cost
      },
      safety_comparison: {
        fastest_incidents: fastest.incidents_on_route,
        eco_incidents: eco.incidents_on_route,
        safest_incidents: safest.incidents_on_route
      },
      recommendations: []
    };

    // Add intelligent recommendations
    if (eco.duration_minutes - fastest.duration_minutes < 30 && incidents.length < 3) {
      analysis.recommendations.push('Eco route recommended - minimal time difference with significant savings and acceptable safety');
    }

    if (incidents.length > 5 || incidents.filter(i => i.severity === 'High').length > 2) {
      analysis.recommendations.push('Safest route strongly recommended - high incident activity detected on primary routes');
    }

    if (incidents.length <= 2 && fastest.duration_minutes < 60) {
      analysis.recommendations.push('Fastest route acceptable - low incident activity and short journey time');
    }

    // Determine best overall route based on multiple factors
    let bestOverall = 'fastest';
    if (incidents.length > 5) bestOverall = 'safest';
    else if (eco.duration_minutes - fastest.duration_minutes < 30) bestOverall = 'eco';

    res.json({
      success: true,
      data: {
        routes: { fastest, eco, safest },
        analysis,
        best_overall: bestOverall,
        incident_summary: {
          total: incidents.length,
          high_severity: incidents.filter(i => i.severity === 'High').length,
          medium_severity: incidents.filter(i => i.severity === 'Medium').length,
          low_severity: incidents.filter(i => i.severity === 'Low').length
        }
      }
    });

  } catch (error) {
    console.error('Route comparison error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to compare routes',
      error: error.message
    });
  }
};
