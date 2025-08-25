import ExifParser from 'exif-parser';
import fs from 'fs';

export const extractBasicEXIF = async (photoPath) => {
  try {
    if (!fs.existsSync(photoPath)) {
      return { hasEXIF: false };
    }

    const buffer = fs.readFileSync(photoPath);
    const parser = ExifParser.create(buffer);
    const result = parser.parse();

    return {
      hasEXIF: true,
      timestamp: result.tags?.DateTime || null,
      gps: result.tags?.GPSLatitude && result.tags?.GPSLongitude 
        ? { lat: result.tags.GPSLatitude, lng: result.tags.GPSLongitude }
        : null,
      device: result.tags?.Make || 'Unknown'
    };
  } catch (error) {
    return { hasEXIF: false, error: error.message };
  }
};
