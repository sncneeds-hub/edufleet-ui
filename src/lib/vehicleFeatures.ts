export const VEHICLE_FEATURES = [
  'Air Conditioning',
  'GPS Tracking',
  'First Aid Kit',
  'Fire Extinguisher',
  'CCTV Cameras',
  'Music System',
  'Speed Governor',
  'Emergency Exit',
  'Seat Belts',
  'Reverse Camera',
  'Disabled Access',
  'USB Charging',
  'Emergency Lights',
  'Water Supply',
  'Roof Vents',
] as const

export type VehicleFeature = typeof VEHICLE_FEATURES[number]

export function getFeaturesArray(featuresJson: string | null): string[] {
  if (!featuresJson) return []
  try {
    const parsed = JSON.parse(featuresJson)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function stringifyFeatures(features: string[]): string {
  return JSON.stringify(features)
}
