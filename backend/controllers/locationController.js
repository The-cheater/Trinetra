import { getJson } from 'serpapi';
import User from '../models/User.js';

// Update user's current location
export const updateUserLocation = async (req, res) => {
  try {
    const { lat, lng } = req.body;
    const userId = req.user._id;

    // Validate coordinates
    if (!lat || !lng || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return res.status(400).json({
        success: false,
        message: 'Valid latitude and longitude are required'
      });
    }

    // Get city/area name using reverse geocoding with SerpAPI
    const locationInfo = await reverseGeocode(lat, lng);

    // Update user location
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        location: {
          type: 'Point',
          coordinates: [lng, lat] // MongoDB expects [lng, lat]
        },
        city: locationInfo.city,
        state: locationInfo.state,
        country: locationInfo.country,
        locationUpdatedAt: new Date()
      },
      { new: true, select: '-password' }
    );

    res.json({
      success: true,
      message: 'Location updated successfully',
      data: {
        location: {
          lat,
          lng,
          city: locationInfo.city,
          state: locationInfo.state,
          formatted_address: locationInfo.formatted_address
        }
      }
    });

  } catch (error) {
    console.error('Update location error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update location',
      error: error.message
    });
  }
};

// Get nearby cities/areas for user
export const getNearbyAreas = async (req, res) => {
  try {
    const { lat, lng, radius = 10000 } = req.query; // 10km default

    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required'
      });
    }

    // Get nearby places using SerpAPI
    const response = await getJson({
      engine: "google_maps",
      type: "search",
      q: "areas landmarks",
      ll: `@${lat},${lng},12z`,
      api_key: process.env.SERPAPI_KEY
    });

    const areas = (response.local_results || []).slice(0, 10).map(place => ({
      name: place.title,
      address: place.address,
      position: place.gps_coordinates,
      type: place.type
    }));

    res.json({
      success: true,
      data: {
        current_location: { lat: parseFloat(lat), lng: parseFloat(lng) },
        nearby_areas: areas,
        radius_km: parseInt(radius) / 1000
      }
    });

  } catch (error) {
    console.error('Nearby areas error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get nearby areas',
      error: error.message
    });
  }
};

// Reverse geocode coordinates to get city/area name
const reverseGeocode = async (lat, lng) => {
  try {
    // Use SerpAPI to get location details
    const response = await getJson({
      engine: "google_maps",
      type: "search",
      q: "current location",
      ll: `@${lat},${lng},14z`,
      api_key: process.env.SERPAPI_KEY
    });

    // Extract city information from results
    let city = 'Unknown';
    let state = 'Unknown';
    let country = 'India';
    let formatted_address = `${lat}, ${lng}`;

    if (response.local_results && response.local_results.length > 0) {
      const firstResult = response.local_results[0];
      formatted_address = firstResult.address || formatted_address;
      
      // Parse address to extract city/state
      const addressParts = formatted_address.split(',');
      if (addressParts.length >= 2) {
        city = addressParts[addressParts.length - 3]?.trim() || city;
        state = addressParts[addressParts.length - 2]?.trim() || state;
      }
    }

    return {
      city,
      state,
      country,
      formatted_address
    };

  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return {
      city: 'Unknown',
      state: 'Unknown', 
      country: 'India',
      formatted_address: `${lat}, ${lng}`
    };
  }
};
