export interface TeacherProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  experience: number;
  qualifications: string[];
  subjects: string[];
  bio: string;
  resume?: string;
  avatar: string;
  isAvailable: boolean;
  expectedSalary?: {
    min: number;
    max: number;
    currency: string;
  };
  preferredJobType?: string[];
  createdAt: string;
}

export interface JobApplication {
  id: string;
  jobId: string;
  jobTitle: string;
  teacherId: string;
  teacherName: string;
  instituteId: string;
  instituteName: string;
  status: 'pending' | 'reviewed' | 'shortlisted' | 'rejected' | 'accepted';
  appliedDate: string;
  coverLetter: string;
  resume: string;
  interviewScheduled?: Interview;
}

export interface Interview {
  id: string;
  applicationId: string;
  jobId: string;
  teacherId: string;
  teacherName: string;
  instituteId: string;
  instituteName: string;
  scheduledDate: string;
  scheduledTime: string;
  duration: number; // in minutes
  mode: 'in-person' | 'video' | 'phone';
  location?: string;
  meetingLink?: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';
  notes?: string;
  feedback?: string;
}

export const mockTeachers: TeacherProfile[] = [
  {
    id: 'teacher-1',
    name: 'John Smith',
    email: 'john.teacher@gmail.com',
    phone: '+91-9876543210',
    location: 'Delhi, India',
    experience: 5,
    qualifications: ['B.Ed', 'M.A. in English Literature'],
    subjects: ['English', 'Literature', 'Grammar'],
    bio: 'Passionate English teacher with 5 years of experience in CBSE curriculum. Specialized in creative writing and literature.',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=john.teacher@gmail.com',
    isAvailable: true,
    expectedSalary: {
      min: 40000,
      max: 55000,
      currency: '₹',
    },
    preferredJobType: ['full-time', 'part-time'],
    createdAt: '2024-01-15',
  },
  {
    id: 'teacher-2',
    name: 'Sarah Johnson',
    email: 'sarah.teacher@gmail.com',
    phone: '+91-8765432109',
    location: 'Mumbai, India',
    experience: 8,
    qualifications: ['B.Sc in Mathematics', 'M.Ed'],
    subjects: ['Mathematics', 'Physics', 'Statistics'],
    bio: 'Experienced mathematics teacher with a track record of improving student performance. Passionate about making math fun and accessible.',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah.teacher@gmail.com',
    isAvailable: true,
    expectedSalary: {
      min: 50000,
      max: 70000,
      currency: '₹',
    },
    preferredJobType: ['full-time'],
    createdAt: '2024-01-10',
  },
  {
    id: 'teacher-3',
    name: 'Rajesh Kumar',
    email: 'rajesh.kumar@gmail.com',
    phone: '+91-7654321098',
    location: 'Bangalore, India',
    experience: 3,
    qualifications: ['B.Tech in Computer Science', 'PG Diploma in Education'],
    subjects: ['Computer Science', 'Information Technology', 'Coding'],
    bio: 'Tech-savvy educator passionate about teaching programming and technology to young minds.',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=rajesh.kumar@gmail.com',
    isAvailable: true,
    expectedSalary: {
      min: 45000,
      max: 60000,
      currency: '₹',
    },
    preferredJobType: ['full-time', 'contract'],
    createdAt: '2024-02-01',
  },
  {
    id: 'teacher-4',
    name: 'Priya Sharma',
    email: 'priya.sharma@gmail.com',
    phone: '+91-6543210987',
    location: 'Pune, India',
    experience: 6,
    qualifications: ['M.Sc in Chemistry', 'B.Ed'],
    subjects: ['Chemistry', 'Biology', 'Environmental Science'],
    bio: 'Science educator with hands-on teaching approach. Love conducting experiments and making science practical.',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=priya.sharma@gmail.com',
    isAvailable: false,
    expectedSalary: {
      min: 42000,
      max: 58000,
      currency: '₹',
    },
    preferredJobType: ['full-time'],
    createdAt: '2024-01-20',
  },
  {
    id: 'teacher-5',
    name: 'Michael Brown',
    email: 'michael.brown@gmail.com',
    phone: '+91-5432109876',
    location: 'Hyderabad, India',
    experience: 10,
    qualifications: ['M.A. in History', 'B.Ed', 'Ph.D candidate'],
    subjects: ['History', 'Social Studies', 'Geography'],
    bio: 'Veteran educator with a decade of experience. Specializing in making history engaging through storytelling.',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=michael.brown@gmail.com',
    isAvailable: true,
    expectedSalary: {
      min: 55000,
      max: 75000,
      currency: '₹',
    },
    preferredJobType: ['full-time'],
    createdAt: '2024-01-05',
  },
];

export const mockApplications: JobApplication[] = [
  {
    id: 'app-1',
    jobId: 'job-1',
    jobTitle: 'School Bus Driver',
    teacherId: 'teacher-1',
    teacherName: 'John Smith',
    instituteId: 'inst-1',
    instituteName: 'Delhi Public School',
    status: 'shortlisted',
    appliedDate: '2024-02-12',
    coverLetter: 'I am excited to apply for the School Bus Driver position at Delhi Public School...',
    resume: 'https://example.com/resume/john-smith.pdf',
    interviewScheduled: {
      id: 'int-1',
      applicationId: 'app-1',
      jobId: 'job-1',
      teacherId: 'teacher-1',
      teacherName: 'John Smith',
      instituteId: 'inst-1',
      instituteName: 'Delhi Public School',
      scheduledDate: '2024-03-05',
      scheduledTime: '10:00 AM',
      duration: 60,
      mode: 'in-person',
      location: 'Delhi Public School Campus',
      status: 'scheduled',
      notes: 'Please bring original documents',
    },
  },
  {
    id: 'app-2',
    jobId: 'job-2',
    jobTitle: 'Fleet Manager',
    teacherId: 'teacher-2',
    teacherName: 'Sarah Johnson',
    instituteId: 'inst-2',
    instituteName: 'Sunrise International School',
    status: 'pending',
    appliedDate: '2024-02-14',
    coverLetter: 'With my extensive experience in mathematics education...',
    resume: 'https://example.com/resume/sarah-johnson.pdf',
  },
  {
    id: 'app-3',
    jobId: 'job-3',
    jobTitle: 'Vehicle Mechanic',
    teacherId: 'teacher-3',
    teacherName: 'Rajesh Kumar',
    instituteId: 'inst-3',
    instituteName: 'Central Academy',
    status: 'reviewed',
    appliedDate: '2024-02-10',
    coverLetter: 'I am writing to express my interest in the Vehicle Mechanic position...',
    resume: 'https://example.com/resume/rajesh-kumar.pdf',
  },
  {
    id: 'app-4',
    jobId: 'job-4',
    jobTitle: 'Transport Coordinator',
    teacherId: 'teacher-1',
    teacherName: 'John Smith',
    instituteId: 'inst-5',
    instituteName: 'Heritage School',
    status: 'rejected',
    appliedDate: '2024-02-08',
    coverLetter: 'I believe my organizational skills make me perfect for this role...',
    resume: 'https://example.com/resume/john-smith.pdf',
  },
  {
    id: 'app-5',
    jobId: 'job-1',
    jobTitle: 'School Bus Driver',
    teacherId: 'teacher-5',
    teacherName: 'Michael Brown',
    instituteId: 'inst-1',
    instituteName: 'Delhi Public School',
    status: 'accepted',
    appliedDate: '2024-02-11',
    coverLetter: 'I am thrilled to submit my application for the School Bus Driver position...',
    resume: 'https://example.com/resume/michael-brown.pdf',
    interviewScheduled: {
      id: 'int-2',
      applicationId: 'app-5',
      jobId: 'job-1',
      teacherId: 'teacher-5',
      teacherName: 'Michael Brown',
      instituteId: 'inst-1',
      instituteName: 'Delhi Public School',
      scheduledDate: '2024-02-28',
      scheduledTime: '2:00 PM',
      duration: 45,
      mode: 'video',
      meetingLink: 'https://meet.google.com/abc-defg-hij',
      status: 'completed',
      notes: 'Final round interview',
      feedback: 'Excellent candidate, recommended for hire',
    },
  },
];

export const mockInterviews: Interview[] = [
  {
    id: 'int-1',
    applicationId: 'app-1',
    jobId: 'job-1',
    teacherId: 'teacher-1',
    teacherName: 'John Smith',
    instituteId: 'inst-1',
    instituteName: 'Delhi Public School',
    scheduledDate: '2024-03-05',
    scheduledTime: '10:00 AM',
    duration: 60,
    mode: 'in-person',
    location: 'Delhi Public School Campus',
    status: 'scheduled',
    notes: 'Please bring original documents',
  },
  {
    id: 'int-2',
    applicationId: 'app-5',
    jobId: 'job-1',
    teacherId: 'teacher-5',
    teacherName: 'Michael Brown',
    instituteId: 'inst-1',
    instituteName: 'Delhi Public School',
    scheduledDate: '2024-02-28',
    scheduledTime: '2:00 PM',
    duration: 45,
    mode: 'video',
    meetingLink: 'https://meet.google.com/abc-defg-hij',
    status: 'completed',
    notes: 'Final round interview',
    feedback: 'Excellent candidate, recommended for hire',
  },
  {
    id: 'int-3',
    applicationId: 'app-3',
    jobId: 'job-3',
    teacherId: 'teacher-3',
    teacherName: 'Rajesh Kumar',
    instituteId: 'inst-3',
    instituteName: 'Central Academy',
    scheduledDate: '2024-03-10',
    scheduledTime: '11:30 AM',
    duration: 60,
    mode: 'phone',
    status: 'scheduled',
    notes: 'Technical round',
  },
];

export const getTeacherApplications = (teacherId: string): JobApplication[] => {
  return mockApplications.filter(app => app.teacherId === teacherId);
};

export const getInstituteApplications = (instituteId: string): JobApplication[] => {
  return mockApplications.filter(app => app.instituteId === instituteId);
};

export const getJobApplications = (jobId: string): JobApplication[] => {
  return mockApplications.filter(app => app.jobId === jobId);
};

export const getTeacherInterviews = (teacherId: string): Interview[] => {
  return mockInterviews.filter(int => int.teacherId === teacherId);
};

export const getInstituteInterviews = (instituteId: string): Interview[] => {
  return mockInterviews.filter(int => int.instituteId === instituteId);
};
