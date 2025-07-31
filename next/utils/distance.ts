// Written by AI
// Utility function to calculate distance between two coordinates
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in kilometers
  return d;
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}

// Get notices within a certain radius
export function filterNoticesByRadius(
  notices: any[],
  userLat: number,
  userLon: number,
  radiusKm: number
) {
  return notices
    .filter((notice) => {
      const distance = calculateDistance(
        userLat,
        userLon,
        notice.latitude,
        notice.longitude
      );
      return distance <= radiusKm;
    })
    .map((notice) => ({
      ...notice,
      distance: calculateDistance(
        userLat,
        userLon,
        notice.latitude,
        notice.longitude
      ),
    }));
}
