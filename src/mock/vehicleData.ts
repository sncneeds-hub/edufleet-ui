export interface Vehicle {
  id: string;
  title: string;
  manufacturer: string;
  model: string;
  year: number;
  type: 'school-bus' | 'minibus' | 'van' | 'truck';
  price: number;
  registrationNumber: string;
  mileage: number;
  condition: 'excellent' | 'good' | 'fair' | 'needs-repair';
  features: string[];
  images: string[];
  description: string;
  sellerId: string;
  sellerName: string;
  sellerEmail: string;
  sellerPhone: string;
  isPriority: boolean;
  createdAt: string;
  status: 'pending' | 'approved' | 'rejected';
  insurance?: {
    valid: boolean;
    expiryDate?: string;
    provider?: string;
  };
  fitness?: {
    valid: boolean;
    expiryDate?: string;
  };
  roadTax?: {
    valid: boolean;
    expiryDate?: string;
  };
  permit?: {
    valid: boolean;
    expiryDate?: string;
    type?: string;
  };
}

export const mockVehicles: Vehicle[] = [
  {
    id: '1',
    title: 'Yellow School Bus 2020',
    manufacturer: 'Blue Bird',
    model: 'Vision',
    year: 2020,
    type: 'school-bus',
    price: 45000,
    registrationNumber: 'MH-02-AB-1234',
    mileage: 45000,
    condition: 'excellent',
    features: ['AC', 'GPS Tracking', 'Emergency Alarm', 'Wheelchair Accessible'],
    images: [
      'https://images.unsplash.com/photo-1464207687429-7505649dae38?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1464207687429-7505649dae38?w=800&h=600&fit=crop&q=80',
    ],
    description: 'Well-maintained school bus with modern safety features. Perfect for educational institutions.',
    sellerId: 'inst-1',
    sellerName: 'Delhi Public School',
    sellerEmail: 'transport@dps.edu.in',
    sellerPhone: '+91-9876543210',
    isPriority: true,
    createdAt: '2024-01-15',
    status: 'approved',
    insurance: { valid: true, expiryDate: '2025-12-31', provider: 'ICICI Insurance' },
    fitness: { valid: true, expiryDate: '2025-06-30' },
    roadTax: { valid: true, expiryDate: '2025-03-31' },
    permit: { valid: true, expiryDate: '2025-12-31', type: 'School Transport' },
  },
  {
    id: '2',
    title: 'Luxury Minibus 2019',
    manufacturer: 'Force',
    model: 'Traveller',
    year: 2019,
    type: 'minibus',
    price: 32000,
    registrationNumber: 'DL-01-AB-5678',
    mileage: 65000,
    condition: 'good',
    features: ['Reclining Seats', 'Power Steering', 'USB Charging', 'Reading Lights'],
    images: [
      'https://images.unsplash.com/photo-1527786356703-4b100091cd2c?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1527786356703-4b100091cd2c?w=800&h=600&fit=crop&q=80',
    ],
    description: 'Spacious minibus suitable for staff transportation. Comfortable seating for 26 passengers.',
    sellerId: 'inst-2',
    sellerName: 'Sunrise International School',
    sellerEmail: 'fleet@sunrise.edu.in',
    sellerPhone: '+91-8765432109',
    isPriority: true,
    createdAt: '2024-01-20',
    status: 'approved',
    insurance: { valid: true, expiryDate: '2025-11-30', provider: 'National Insurance' },
    fitness: { valid: true, expiryDate: '2025-05-30' },
    roadTax: { valid: true, expiryDate: '2025-02-28' },
    permit: { valid: true, expiryDate: '2025-12-31', type: 'School Transport' },
  },
  {
    id: '3',
    title: 'Compact Van 2018',
    manufacturer: 'Maruti',
    model: 'Omni',
    year: 2018,
    type: 'van',
    price: 8500,
    registrationNumber: 'KA-09-CD-9012',
    mileage: 120000,
    condition: 'fair',
    features: ['Power Windows', 'Seat Belts', 'Dual Airbags'],
    images: [
      'https://images.unsplash.com/photo-1552820728-8ac41f1ce891?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1552820728-8ac41f1ce891?w=800&h=600&fit=crop&q=80',
    ],
    description: 'Budget-friendly van for small group transportation.',
    sellerId: 'inst-3',
    sellerName: 'Central Academy',
    sellerEmail: 'transport@centralacademy.edu.in',
    sellerPhone: '+91-7654321098',
    isPriority: false,
    createdAt: '2024-01-10',
    status: 'approved',
  },
  {
    id: '4',
    title: 'Heavy Duty Truck 2017',
    manufacturer: 'Tata',
    model: 'LPT 1109',
    year: 2017,
    type: 'truck',
    price: 28000,
    registrationNumber: 'MH-04-EF-3456',
    mileage: 180000,
    condition: 'good',
    features: ['Power Steering', 'Hydraulic Brakes', 'Reinforced Chassis'],
    images: [
      'https://images.unsplash.com/photo-1533473359331-35d4c3c3c80d?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1533473359331-35d4c3c3c80d?w=800&h=600&fit=crop&q=80',
    ],
    description: 'Commercial truck for heavy load transportation and logistics.',
    sellerId: 'inst-4',
    sellerName: 'Logistics Academy',
    sellerEmail: 'fleet@logisticsacademy.edu.in',
    sellerPhone: '+91-6543210987',
    isPriority: false,
    createdAt: '2024-01-18',
    status: 'approved',
  },
  {
    id: '5',
    title: 'Premium School Bus 2021',
    manufacturer: 'Volvo',
    model: 'B7R',
    year: 2021,
    type: 'school-bus',
    price: 65000,
    registrationNumber: 'UP-14-GH-7890',
    mileage: 32000,
    condition: 'excellent',
    features: ['CCTV Cameras', 'GPS Tracking', 'Climate Control', 'First Aid Kit', 'Emergency Exit'],
    images: [
      'https://images.unsplash.com/photo-1464207687429-7505649dae38?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1464207687429-7505649dae38?w=800&h=600&fit=crop&q=80',
    ],
    description: 'State-of-the-art school bus with latest safety and comfort features.',
    sellerId: 'inst-5',
    sellerName: 'Heritage School',
    sellerEmail: 'transport@heritage.edu.in',
    sellerPhone: '+91-5432109876',
    isPriority: true,
    createdAt: '2024-01-25',
    status: 'approved',
  },
  {
    id: '6',
    title: 'Used Minibus 2016',
    manufacturer: 'Hyundai',
    model: 'H350',
    year: 2016,
    type: 'minibus',
    price: 18000,
    registrationNumber: 'HR-26-IJ-1234',
    mileage: 95000,
    condition: 'good',
    features: ['Automatic Transmission', 'ABS', 'Power Door Locks'],
    images: [
      'https://images.unsplash.com/photo-1527786356703-4b100091cd2c?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1527786356703-4b100091cd2c?w=800&h=600&fit=crop&q=80',
    ],
    description: 'Reliable minibus for staff and student transportation.',
    sellerId: 'inst-6',
    sellerName: 'St. Pauls Academy',
    sellerEmail: 'fleet@stpauls.edu.in',
    sellerPhone: '+91-4321098765',
    isPriority: false,
    createdAt: '2024-01-08',
    status: 'approved',
  },
  {
    id: '7',
    title: 'School Van 2019',
    manufacturer: 'Mahindra',
    model: 'Supro',
    year: 2019,
    type: 'van',
    price: 12500,
    registrationNumber: 'MH-12-KL-5678',
    mileage: 78000,
    condition: 'good',
    features: ['Air Conditioning', 'Power Steering', 'Music System', 'Seat Covers'],
    images: [
      'https://images.unsplash.com/photo-1552820728-8ac41f1ce891?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1552820728-8ac41f1ce891?w=800&h=600&fit=crop&q=80',
    ],
    description: 'Compact van ideal for smaller student groups. Well-maintained with regular servicing.',
    sellerId: 'inst-7',
    sellerName: 'Modern High School',
    sellerEmail: 'transport@modernhs.edu.in',
    sellerPhone: '+91-9123456789',
    isPriority: false,
    createdAt: '2024-02-01',
    status: 'pending',
  },
  {
    id: '8',
    title: 'Large Capacity Bus 2018',
    manufacturer: 'Ashok Leyland',
    model: 'Viking',
    year: 2018,
    type: 'school-bus',
    price: 38000,
    registrationNumber: 'UP-80-MN-9012',
    mileage: 92000,
    condition: 'good',
    features: ['GPS System', 'Fire Extinguisher', 'First Aid Box', 'Speed Governor', 'Seat Belts'],
    images: [
      'https://images.unsplash.com/photo-1464207687429-7505649dae38?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1464207687429-7505649dae38?w=800&h=600&fit=crop&q=80',
    ],
    description: 'Large capacity school bus with excellent safety features. Seats up to 50 students comfortably.',
    sellerId: 'inst-8',
    sellerName: 'Greenfield Academy',
    sellerEmail: 'fleet@greenfield.edu.in',
    sellerPhone: '+91-8234567890',
    isPriority: false,
    createdAt: '2024-02-05',
    status: 'pending',
  },
  {
    id: '9',
    title: 'Cargo Truck 2015',
    manufacturer: 'Eicher',
    model: 'Pro 1049',
    year: 2015,
    type: 'truck',
    price: 15000,
    registrationNumber: 'RJ-14-OP-3456',
    mileage: 210000,
    condition: 'fair',
    features: ['Heavy Duty Suspension', 'Cargo Bed Cover', 'Tool Box', 'Tow Hook'],
    images: [
      'https://images.unsplash.com/photo-1533473359331-35d4c3c3c80d?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1533473359331-35d4c3c3c80d?w=800&h=600&fit=crop&q=80',
    ],
    description: 'Utility truck for campus logistics and material transport. Reliable workhorse.',
    sellerId: 'inst-9',
    sellerName: 'Technical Institute',
    sellerEmail: 'maintenance@techins.edu.in',
    sellerPhone: '+91-7345678901',
    isPriority: false,
    createdAt: '2024-02-08',
    status: 'pending',
  },
];

export const priorityListings = mockVehicles.filter(v => v.isPriority);
export const recentListings = mockVehicles.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 3);
