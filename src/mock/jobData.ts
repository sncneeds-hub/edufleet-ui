export interface Job {
  id: string;
  title: string;
  department: string;
  location: string;
  type: 'full-time' | 'part-time' | 'contract' | 'internship';
  experience: string;
  salary: {
    min: number;
    max: number;
    currency: string;
  };
  description: string;
  requirements: string[];
  responsibilities: string[];
  benefits: string[];
  instituteName: string;
  instituteId: string;
  instituteEmail: string;
  institutePhone: string;
  postedDate: string;
  deadline: string;
  status: 'pending' | 'approved' | 'rejected';
  isPriority: boolean;
  applicants?: number;
}

export const mockJobs: Job[] = [
  {
    id: 'job-1',
    title: 'School Bus Driver',
    department: 'Transport',
    location: 'Delhi, India',
    type: 'full-time',
    experience: '3-5 years',
    salary: {
      min: 25000,
      max: 35000,
      currency: '₹',
    },
    description: 'We are looking for an experienced and responsible school bus driver to safely transport students to and from school.',
    requirements: [
      'Valid commercial driving license',
      'Clean driving record',
      'Experience driving school buses',
      'First aid certified',
      'Good communication skills',
    ],
    responsibilities: [
      'Safely transport students to and from school',
      'Conduct pre-trip and post-trip vehicle inspections',
      'Maintain discipline on the bus',
      'Follow all traffic rules and regulations',
      'Keep accurate records of routes and incidents',
    ],
    benefits: [
      'Health insurance',
      'Paid leave',
      'Performance bonus',
      'Uniform provided',
    ],
    instituteName: 'Delhi Public School',
    instituteId: 'inst-1',
    instituteEmail: 'hr@dps.edu.in',
    institutePhone: '+91-9876543210',
    postedDate: '2024-02-10',
    deadline: '2024-03-15',
    status: 'approved',
    isPriority: true,
    applicants: 12,
  },
  {
    id: 'job-2',
    title: 'Fleet Manager',
    department: 'Operations',
    location: 'Mumbai, India',
    type: 'full-time',
    experience: '5-8 years',
    salary: {
      min: 50000,
      max: 75000,
      currency: '₹',
    },
    description: 'Seeking an experienced fleet manager to oversee our school transportation operations and ensure efficient fleet management.',
    requirements: [
      'Bachelor\'s degree in logistics or related field',
      'Proven experience in fleet management',
      'Knowledge of vehicle maintenance',
      'Strong organizational skills',
      'Proficiency in fleet management software',
    ],
    responsibilities: [
      'Manage fleet of 25+ school buses',
      'Schedule maintenance and repairs',
      'Monitor fuel consumption and costs',
      'Ensure compliance with safety regulations',
      'Manage driver schedules and performance',
      'Prepare monthly reports',
    ],
    benefits: [
      'Health and life insurance',
      'Provident fund',
      'Paid time off',
      'Professional development',
    ],
    instituteName: 'Sunrise International School',
    instituteId: 'inst-2',
    instituteEmail: 'careers@sunrise.edu.in',
    institutePhone: '+91-8765432109',
    postedDate: '2024-02-08',
    deadline: '2024-03-10',
    status: 'approved',
    isPriority: true,
    applicants: 8,
  },
  {
    id: 'job-3',
    title: 'Vehicle Mechanic',
    department: 'Maintenance',
    location: 'Bangalore, India',
    type: 'full-time',
    experience: '2-4 years',
    salary: {
      min: 20000,
      max: 30000,
      currency: '₹',
    },
    description: 'Looking for a skilled vehicle mechanic to maintain and repair our fleet of school buses and vans.',
    requirements: [
      'ITI or diploma in automobile engineering',
      'Experience with bus/truck maintenance',
      'Knowledge of diesel engines',
      'Problem-solving skills',
      'Ability to work independently',
    ],
    responsibilities: [
      'Perform routine maintenance on vehicles',
      'Diagnose and repair mechanical issues',
      'Conduct safety inspections',
      'Maintain maintenance records',
      'Order parts and supplies',
    ],
    benefits: [
      'Health insurance',
      'Overtime pay',
      'Tools provided',
      'Training opportunities',
    ],
    instituteName: 'Central Academy',
    instituteId: 'inst-3',
    instituteEmail: 'jobs@centralacademy.edu.in',
    institutePhone: '+91-7654321098',
    postedDate: '2024-02-05',
    deadline: '2024-03-05',
    status: 'approved',
    isPriority: false,
    applicants: 15,
  },
  {
    id: 'job-4',
    title: 'Transport Coordinator',
    department: 'Administration',
    location: 'Pune, India',
    type: 'full-time',
    experience: '3-5 years',
    salary: {
      min: 35000,
      max: 45000,
      currency: '₹',
    },
    description: 'We need a transport coordinator to manage student transportation logistics and ensure smooth operations.',
    requirements: [
      'Graduate degree',
      'Experience in logistics or transportation',
      'Excellent communication skills',
      'Computer proficiency',
      'Crisis management abilities',
    ],
    responsibilities: [
      'Coordinate student pickup and drop schedules',
      'Communicate with parents and staff',
      'Track vehicle locations using GPS',
      'Handle transportation-related queries',
      'Maintain student transport database',
      'Coordinate with drivers and attendants',
    ],
    benefits: [
      'Health insurance',
      'Annual bonus',
      'Professional development',
      'Flexible working hours',
    ],
    instituteName: 'Heritage School',
    instituteId: 'inst-5',
    instituteEmail: 'hr@heritage.edu.in',
    institutePhone: '+91-5432109876',
    postedDate: '2024-02-12',
    deadline: '2024-03-20',
    status: 'approved',
    isPriority: false,
    applicants: 6,
  },
  {
    id: 'job-5',
    title: 'Bus Attendant',
    department: 'Transport',
    location: 'Hyderabad, India',
    type: 'part-time',
    experience: '0-2 years',
    salary: {
      min: 12000,
      max: 18000,
      currency: '₹',
    },
    description: 'Seeking responsible individuals to assist with student supervision on school buses.',
    requirements: [
      'High school diploma',
      'Good with children',
      'Patient and caring nature',
      'Basic first aid knowledge',
      'Reliable and punctual',
    ],
    responsibilities: [
      'Supervise students during bus rides',
      'Ensure student safety at pickup/drop points',
      'Maintain discipline on the bus',
      'Assist students with special needs',
      'Report any incidents to school',
    ],
    benefits: [
      'Accident insurance',
      'Uniform provided',
      'Transportation allowance',
    ],
    instituteName: 'St. Pauls Academy',
    instituteId: 'inst-6',
    instituteEmail: 'recruitment@stpauls.edu.in',
    institutePhone: '+91-4321098765',
    postedDate: '2024-02-15',
    deadline: '2024-03-25',
    status: 'pending',
    isPriority: false,
    applicants: 20,
  },
  {
    id: 'job-6',
    title: 'Safety Officer',
    department: 'Safety & Compliance',
    location: 'Kolkata, India',
    type: 'full-time',
    experience: '4-6 years',
    salary: {
      min: 40000,
      max: 55000,
      currency: '₹',
    },
    description: 'Looking for a safety officer to ensure compliance with all transportation safety regulations and standards.',
    requirements: [
      'Safety certification (NEBOSH or equivalent)',
      'Experience in transport safety',
      'Knowledge of motor vehicle regulations',
      'Audit and inspection experience',
      'Strong analytical skills',
    ],
    responsibilities: [
      'Conduct regular safety audits',
      'Ensure regulatory compliance',
      'Develop safety protocols',
      'Train staff on safety procedures',
      'Investigate incidents and accidents',
      'Maintain safety documentation',
    ],
    benefits: [
      'Comprehensive health insurance',
      'Provident fund',
      'Professional certifications sponsored',
      'Annual leave',
    ],
    instituteName: 'Modern High School',
    instituteId: 'inst-7',
    instituteEmail: 'careers@modernhs.edu.in',
    institutePhone: '+91-9123456789',
    postedDate: '2024-02-18',
    deadline: '2024-03-30',
    status: 'pending',
    isPriority: false,
    applicants: 4,
  },
];

export const priorityJobs = mockJobs.filter(j => j.isPriority);
export const recentJobs = mockJobs.sort((a, b) => new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime()).slice(0, 3);
