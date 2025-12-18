import { Supplier } from '@/api/types';

export const mockSuppliers: Supplier[] = [
  {
    id: 'sup-001',
    name: 'EduTech Solutions India',
    category: 'edutech',
    description: 'Leading provider of digital learning platforms, LMS solutions, and educational software for schools and colleges across India.',
    services: [
      'Learning Management Systems',
      'Virtual Classroom Software',
      'Student Assessment Tools',
      'Parent-Teacher Communication Apps',
      'AI-Powered Tutoring',
      'Educational Content Development'
    ],
    contactPerson: 'Rajesh Kumar',
    email: 'rajesh@edutechsolutions.in',
    phone: '+91 98765 43210',
    website: 'https://edutechsolutions.in',
    address: {
      street: '23, Tech Park, MG Road',
      city: 'Bangalore',
      state: 'Karnataka',
      pincode: '560001',
      country: 'India'
    },
    logo: 'https://images.unsplash.com/photo-1633409361618-c73427e4e206?w=200&h=200&fit=crop',
    certifications: ['ISO 9001:2015', 'ISO 27001:2013', 'Microsoft Gold Partner'],
    yearsInBusiness: 8,
    clientCount: 250,
    isVerified: true,
    status: 'approved',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-11-20T14:22:00Z'
  },
  {
    id: 'sup-002',
    name: 'SmartClass Technologies',
    category: 'technology',
    description: 'Specializing in interactive smartboards, digital projectors, and classroom technology infrastructure for modern educational institutions.',
    services: [
      'Interactive Smartboards',
      'Digital Projectors',
      'Audio-Visual Systems',
      'Computer Lab Setup',
      'Network Infrastructure',
      'IT Support & Maintenance'
    ],
    contactPerson: 'Priya Sharma',
    email: 'priya@smartclass.co.in',
    phone: '+91 99887 76543',
    website: 'https://smartclass.co.in',
    address: {
      street: '45, Industrial Area, Sector 18',
      city: 'Gurgaon',
      state: 'Haryana',
      pincode: '122001',
      country: 'India'
    },
    logo: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=200&h=200&fit=crop',
    certifications: ['ISO 9001:2015', 'CE Certified Products'],
    yearsInBusiness: 12,
    clientCount: 400,
    isVerified: true,
    status: 'approved',
    createdAt: '2024-02-10T09:15:00Z',
    updatedAt: '2024-11-18T11:30:00Z'
  },
  {
    id: 'sup-003',
    name: 'EduFurniture Plus',
    category: 'furniture',
    description: 'Premium manufacturer of ergonomic school furniture, classroom seating, lab tables, and office furniture for educational institutions.',
    services: [
      'Classroom Desks & Chairs',
      'Laboratory Furniture',
      'Library Furniture',
      'Auditorium Seating',
      'Staff Office Furniture',
      'Outdoor Furniture'
    ],
    contactPerson: 'Amit Patel',
    email: 'amit@edufurniture.com',
    phone: '+91 97654 32109',
    website: 'https://edufurniture.com',
    address: {
      street: '12, Furniture Complex, GIDC',
      city: 'Ahmedabad',
      state: 'Gujarat',
      pincode: '380001',
      country: 'India'
    },
    logo: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=200&h=200&fit=crop',
    certifications: ['ISO 9001:2015', 'FSC Certified'],
    yearsInBusiness: 15,
    clientCount: 600,
    isVerified: true,
    status: 'approved',
    createdAt: '2024-03-05T12:00:00Z',
    updatedAt: '2024-11-25T16:45:00Z'
  },
  {
    id: 'sup-004',
    name: 'Science Lab Equipment Co.',
    category: 'lab-equipment',
    description: 'Complete range of science laboratory equipment, chemicals, and supplies for schools, colleges, and research institutions.',
    services: [
      'Physics Lab Equipment',
      'Chemistry Lab Setup',
      'Biology Lab Instruments',
      'Laboratory Chemicals',
      'Safety Equipment',
      'Lab Maintenance Services'
    ],
    contactPerson: 'Dr. Sunita Reddy',
    email: 'sunita@sciencelabequip.in',
    phone: '+91 96543 21098',
    website: 'https://sciencelabequip.in',
    address: {
      street: '78, Science Park, Hitech City',
      city: 'Hyderabad',
      state: 'Telangana',
      pincode: '500081',
      country: 'India'
    },
    logo: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=200&h=200&fit=crop',
    certifications: ['ISO 9001:2015', 'NABL Accredited', 'GMP Certified'],
    yearsInBusiness: 20,
    clientCount: 350,
    isVerified: true,
    status: 'approved',
    createdAt: '2024-01-20T08:30:00Z',
    updatedAt: '2024-11-22T10:15:00Z'
  },
  {
    id: 'sup-005',
    name: 'BookWorm Library Solutions',
    category: 'library',
    description: 'Complete library management solutions including books, digital catalogs, RFID systems, and automation software.',
    services: [
      'Library Automation Software',
      'RFID Book Management',
      'Digital Library Setup',
      'Book Procurement',
      'Library Furniture',
      'Cataloging Services'
    ],
    contactPerson: 'Kavita Menon',
    email: 'kavita@bookwormlibrary.in',
    phone: '+91 95432 10987',
    website: 'https://bookwormlibrary.in',
    address: {
      street: '56, Book Market, Connaught Place',
      city: 'New Delhi',
      state: 'Delhi',
      pincode: '110001',
      country: 'India'
    },
    logo: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=200&h=200&fit=crop',
    certifications: ['ISO 9001:2015'],
    yearsInBusiness: 10,
    clientCount: 180,
    isVerified: true,
    status: 'approved',
    createdAt: '2024-02-28T11:20:00Z',
    updatedAt: '2024-11-19T13:50:00Z'
  },
  {
    id: 'sup-006',
    name: 'SportsPro Equipment',
    category: 'sports',
    description: 'Quality sports equipment, playground installations, and sports facility management for schools and colleges.',
    services: [
      'Sports Equipment Supply',
      'Playground Installation',
      'Gym Equipment',
      'Athletic Track Setup',
      'Sports Flooring',
      'Maintenance Services'
    ],
    contactPerson: 'Vikram Singh',
    email: 'vikram@sportspro.in',
    phone: '+91 94321 09876',
    website: 'https://sportspro.in',
    address: {
      street: '34, Sports Complex, Andheri East',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400069',
      country: 'India'
    },
    logo: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=200&h=200&fit=crop',
    certifications: ['ISO 9001:2015', 'BIS Certified'],
    yearsInBusiness: 7,
    clientCount: 220,
    isVerified: true,
    status: 'approved',
    createdAt: '2024-03-15T14:00:00Z',
    updatedAt: '2024-11-21T09:30:00Z'
  },
  {
    id: 'sup-007',
    name: 'StatHub Stationery Supplies',
    category: 'stationery',
    description: 'Bulk supplier of quality stationery, art supplies, and educational materials for schools and institutes.',
    services: [
      'Bulk Stationery Supply',
      'Art & Craft Materials',
      'Educational Charts',
      'Office Supplies',
      'Custom Printing',
      'Regular Delivery Services'
    ],
    contactPerson: 'Meena Gupta',
    email: 'meena@stathub.in',
    phone: '+91 93210 98765',
    website: 'https://stathub.in',
    address: {
      street: '89, Wholesale Market, Chandni Chowk',
      city: 'Delhi',
      state: 'Delhi',
      pincode: '110006',
      country: 'India'
    },
    logo: 'https://images.unsplash.com/photo-1565843708714-52ecf69ab81f?w=200&h=200&fit=crop',
    certifications: ['ISO 9001:2015'],
    yearsInBusiness: 18,
    clientCount: 500,
    isVerified: true,
    status: 'approved',
    createdAt: '2024-01-10T07:45:00Z',
    updatedAt: '2024-11-24T15:20:00Z'
  },
  {
    id: 'sup-008',
    name: 'NextGen EduApps',
    category: 'edutech',
    description: 'Innovative mobile apps and web platforms for education management, attendance tracking, and parent engagement.',
    services: [
      'School Management Software',
      'Attendance Tracking Apps',
      'Fee Management System',
      'Online Admission Portal',
      'Parent Mobile App',
      'Student Information System'
    ],
    contactPerson: 'Arjun Malhotra',
    email: 'arjun@nextgenedu.in',
    phone: '+91 92109 87654',
    website: 'https://nextgenedu.in',
    address: {
      street: '67, IT Park, Electronic City',
      city: 'Bangalore',
      state: 'Karnataka',
      pincode: '560100',
      country: 'India'
    },
    logo: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=200&h=200&fit=crop',
    certifications: ['ISO 27001:2013', 'CMMI Level 3'],
    yearsInBusiness: 5,
    clientCount: 120,
    isVerified: false,
    status: 'pending',
    createdAt: '2024-11-28T10:00:00Z',
    updatedAt: '2024-11-28T10:00:00Z'
  },
  {
    id: 'sup-009',
    name: 'GreenBoard Solutions',
    category: 'technology',
    description: 'Eco-friendly classroom technology solutions including digital boards, tablets, and sustainable tech infrastructure.',
    services: [
      'Eco-Friendly Digital Boards',
      'Tablet Distribution Programs',
      'Solar-Powered Solutions',
      'E-Waste Management',
      'Green Technology Consulting',
      'Energy Efficient Systems'
    ],
    contactPerson: 'Neha Verma',
    email: 'neha@greenboard.in',
    phone: '+91 91098 76543',
    website: 'https://greenboard.in',
    address: {
      street: '45, Green Park Extension',
      city: 'Pune',
      state: 'Maharashtra',
      pincode: '411001',
      country: 'India'
    },
    logo: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=200&h=200&fit=crop',
    certifications: ['ISO 14001:2015', 'Energy Star Certified'],
    yearsInBusiness: 4,
    clientCount: 80,
    isVerified: false,
    status: 'pending',
    createdAt: '2024-11-25T12:30:00Z',
    updatedAt: '2024-11-25T12:30:00Z'
  },
  {
    id: 'sup-010',
    name: 'TechDesk Computer Solutions',
    category: 'technology',
    description: 'Computer hardware, software licensing, and IT infrastructure services for educational institutions.',
    services: [
      'Computer Hardware Supply',
      'Software Licensing',
      'Network Setup',
      'Server Management',
      'IT Security Solutions',
      'Annual Maintenance Contracts'
    ],
    contactPerson: 'Suresh Nair',
    email: 'suresh@techdesk.in',
    phone: '+91 90987 65432',
    website: 'https://techdesk.in',
    address: {
      street: '23, Tech Plaza, Infopark',
      city: 'Kochi',
      state: 'Kerala',
      pincode: '682030',
      country: 'India'
    },
    logo: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=200&h=200&fit=crop',
    certifications: ['ISO 9001:2015', 'Microsoft Certified Partner'],
    yearsInBusiness: 11,
    clientCount: 290,
    isVerified: true,
    status: 'approved',
    createdAt: '2024-02-18T09:00:00Z',
    updatedAt: '2024-11-23T14:10:00Z'
  }
];

export const categoryLabels: Record<string, string> = {
  'edutech': 'EduTech Solutions',
  'stationery': 'Stationery & Supplies',
  'furniture': 'Furniture',
  'technology': 'Technology & IT',
  'sports': 'Sports Equipment',
  'library': 'Library Solutions',
  'lab-equipment': 'Lab Equipment',
  'other': 'Other Services'
};
