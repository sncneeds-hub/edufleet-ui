import api from '../lib/api';

export interface Job {
  id?: string;
  _id?: string;
  title: string;
  institute: string;
  instituteId?: string;
  location: string;
  type: 'full-time' | 'part-time' | 'contract';
  experience: string;
  salary: string;
  description: string;
  requirements: string[];
  benefits?: string[];
  postedDate?: string;
  deadline?: string;
  status?: 'open' | 'closed';
  applicants?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface JobFilters {
  searchTerm?: string;
  type?: string;
  location?: string;
  status?: 'open' | 'closed';
  page?: number;
  pageSize?: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface JobApplication {
  id?: string;
  _id?: string;
  jobId: string;
  applicantId: string;
  applicantName: string;
  applicantEmail: string;
  resume?: string;
  coverLetter?: string;
  status: 'pending' | 'reviewed' | 'shortlisted' | 'rejected' | 'hired';
  appliedAt: string;
}

export const jobService = {
  /**
   * Get all jobs with optional filters
   */
  async getJobs(filters?: JobFilters): Promise<PaginatedResponse<Job>> {
    const { data } = await api.get('/jobs', { params: filters });
    return data.data;
  },

  /**
   * Get single job by ID
   */
  async getJob(id: string): Promise<Job> {
    const { data } = await api.get(`/jobs/${id}`);
    return data.data;
  },

  /**
   * Create new job posting
   */
  async createJob(jobData: Partial<Job>): Promise<Job> {
    const { data } = await api.post('/jobs', jobData);
    return data.data;
  },

  /**
   * Update job posting
   */
  async updateJob(id: string, jobData: Partial<Job>): Promise<Job> {
    const { data } = await api.put(`/jobs/${id}`, jobData);
    return data.data;
  },

  /**
   * Delete job posting
   */
  async deleteJob(id: string): Promise<void> {
    await api.delete(`/jobs/${id}`);
  },

  /**
   * Get featured/recent jobs
   */
  async getFeaturedJobs(limit: number = 4): Promise<Job[]> {
    const { data } = await api.get('/jobs/featured', { params: { limit } });
    return data.data;
  },

  /**
   * Apply to a job
   */
  async applyToJob(jobId: string, applicationData: Partial<JobApplication>): Promise<JobApplication> {
    const { data } = await api.post(`/jobs/${jobId}/apply`, applicationData);
    return data.data;
  },

  /**
   * Get applications for a job (institute only)
   */
  async getJobApplications(jobId: string): Promise<JobApplication[]> {
    const { data } = await api.get(`/jobs/${jobId}/applications`);
    return data.data;
  },

  /**
   * Get my job applications (teacher only)
   */
  async getMyApplications(): Promise<JobApplication[]> {
    const { data } = await api.get('/jobs/my/applications');
    return data.data;
  },

  /**
   * Update application status (institute only)
   */
  async updateApplicationStatus(
    applicationId: string,
    status: JobApplication['status']
  ): Promise<JobApplication> {
    const { data } = await api.put(`/jobs/applications/${applicationId}/status`, { status });
    return data.data;
  },
};
