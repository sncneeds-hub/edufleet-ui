import { useState, useEffect, useCallback } from 'react';
import { api } from '@/api';
import type { Vehicle, VehicleFilters, CreateVehicleDto, UpdateVehicleDto, Job } from '@/api/types';
import type { Teacher, TeacherFilters } from '@/api/services/teacherService';
import type { SubscriptionPlan } from '@/types/subscriptionTypes';

/**
 * Hook to fetch vehicles with filters
 */
export function useVehicles(filters?: VehicleFilters) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  const fetchVehicles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.vehicles.getVehicles(filters);
      setVehicles(response.data.items);
      setTotal(response.data.total);
      setHasMore(response.data.hasMore);
    } catch (err: any) {
      setError(err.error || 'Failed to load vehicles');
      console.error('Error fetching vehicles:', err);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(filters)]);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  return {
    vehicles,
    loading,
    error,
    total,
    hasMore,
    refetch: fetchVehicles,
  };
}

/**
 * Hook to fetch a single vehicle by ID
 */
export function useVehicle(id: string | undefined) {
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    async function fetchVehicle() {
      try {
        setLoading(true);
        setError(null);
        const response = await api.vehicles.getVehicleById(id);
        setVehicle(response.data);
      } catch (err: any) {
        setError(err.error || 'Failed to load vehicle');
        console.error('Error fetching vehicle:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchVehicle();
  }, [id]);

  return { vehicle, loading, error };
}

/**
 * Hook to fetch priority listings
 */
export function usePriorityListings() {
  const [listings, setListings] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPriority() {
      try {
        setLoading(true);
        setError(null);
        const response = await api.vehicles.getPriorityListings();
        setListings(response.data);
      } catch (err: any) {
        setError(err.error || 'Failed to load priority listings');
        console.error('Error fetching priority listings:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchPriority();
  }, []);

  return { listings, loading, error };
}

/**
 * Hook to fetch recent listings
 */
export function useRecentListings(limit = 3) {
  const [listings, setListings] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRecent() {
      try {
        setLoading(true);
        setError(null);
        const response = await api.vehicles.getRecentListings(limit);
        setListings(response.data);
      } catch (err: any) {
        setError(err.error || 'Failed to load recent listings');
        console.error('Error fetching recent listings:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchRecent();
  }, [limit]);

  return { listings, loading, error };
}

/**
 * Hook to fetch user's listings
 */
export function useMyListings(userId: string | undefined) {
  const [listings, setListings] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!userId) {
      // Don't set loading to false here, keep it true or handle it in component
      // But if we return, listings is empty.
      // If we set loading false, component renders empty list.
      // Better to wait for userId.
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await api.vehicles.getMyListings(userId);
      setListings(response.data);
    } catch (err: any) {
      setError(err.error || 'Failed to load your listings');
      console.error('Error fetching user listings:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      refetch();
    }
  }, [refetch, userId]);

  return { listings, loading, error, refetch };
}

/**
 * Hook to fetch user's jobs (for Institute)
 */
export function useMyJobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.jobs.getMyJobs();
      setJobs(response.data);
    } catch (err: any) {
      setError(err.error || 'Failed to load your jobs');
      console.error('Error fetching user jobs:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { jobs, loading, error, refetch };
}

/**
 * Hook to fetch user's applications (for Teacher)
 */
export function useMyApplications() {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.jobs.getMyApplications();
      setApplications(response.data || []);
    } catch (err: any) {
      setError(err.error || 'Failed to load your applications');
      console.error('Error fetching applications:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { applications, loading, error, refetch };
}

/**
 * Hook for vehicle CRUD operations
 */
export function useVehicleActions() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createVehicle = useCallback(async (data: CreateVehicleDto, sellerId: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.vehicles.createVehicle(data, sellerId);
      return response;
    } catch (err: any) {
      setError(err.error || 'Failed to create vehicle');
      console.error('Error creating vehicle:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateVehicle = useCallback(async (updates: UpdateVehicleDto) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.vehicles.updateVehicle(updates);
      return response;
    } catch (err: any) {
      setError(err.error || 'Failed to update vehicle');
      console.error('Error updating vehicle:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteVehicle = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.vehicles.deleteVehicle(id);
      return response;
    } catch (err: any) {
      setError(err.error || 'Failed to delete vehicle');
      console.error('Error deleting vehicle:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    createVehicle,
    updateVehicle,
    deleteVehicle,
    loading,
    error,
  };
}

/**
 * Hook for admin operations
 */
export function useAdminStats() {
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    priorityListings: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.admin.getStats();
      setStats(response.data);
    } catch (err: any) {
      setError(err.error || 'Failed to load statistics');
      console.error('Error fetching admin stats:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { stats, loading, error, refetch };
}

/**
 * Hook for pending approvals
 */
export function usePendingApprovals() {
  const [pending, setPending] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.admin.getPendingApprovals();
      setPending(response.data);
    } catch (err: any) {
      setError(err.error || 'Failed to load pending approvals');
      console.error('Error fetching pending approvals:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { pending, loading, error, refetch };
}

/**
 * Hook for admin actions
 */
export function useAdminActions() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const approveVehicle = useCallback(async (vehicleId: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.admin.updateApprovalStatus({
        vehicleId,
        status: 'approved',
      });
      return response;
    } catch (err: any) {
      setError(err.message || err.error || 'Failed to approve vehicle');
      console.error('Error approving vehicle:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const rejectVehicle = useCallback(async (vehicleId: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.admin.updateApprovalStatus({
        vehicleId,
        status: 'rejected',
      });
      return response;
    } catch (err: any) {
      setError(err.message || err.error || 'Failed to reject vehicle');
      console.error('Error rejecting vehicle:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const togglePriority = useCallback(async (vehicleId: string, isPriority: boolean) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.admin.togglePriority({
        vehicleId,
        isPriority,
      });
      return response;
    } catch (err: any) {
      setError(err.error || 'Failed to toggle priority');
      console.error('Error toggling priority:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    approveVehicle,
    rejectVehicle,
    togglePriority,
    loading,
    error,
  };
}

/**
 * Hook to fetch all jobs
 */
export function useJobs(filters?: any) {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.jobs.getJobs(filters);
      // Fix: Handle paginated response structure
      if (response.data && Array.isArray(response.data.items)) {
        setJobs(response.data.items);
      } else if (Array.isArray(response.data)) {
        setJobs(response.data);
      } else {
        setJobs([]);
      }
    } catch (err: any) {
      setError(err.error || 'Failed to load jobs');
      console.error('Error fetching jobs:', err);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(filters)]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  return { jobs, loading, error, refetch: fetchJobs };
}

/**
 * Hook to fetch a single job by ID
 */
export function useJobById(id: string) {
  const [job, setJob] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    async function fetchJob() {
      try {
        setLoading(true);
        setError(null);
        const response = await api.jobs.getJobById(id);
        setJob(response.data);
      } catch (err: any) {
        setError(err.error || 'Failed to load job');
        console.error('Error fetching job:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchJob();
  }, [id]);

  return { job, loading, error };
}

/**
 * Hook to fetch applications (for Institute)
 */
export function useApplications(params?: { jobId?: string }) {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.jobs.getJobApplications(params);
      setApplications(response.data || []);
    } catch (err: any) {
      setError(err.error || 'Failed to load applications');
      console.error('Error fetching applications:', err);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(params)]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { applications, loading, error, refetch };
}

/**
 * Hook to fetch teachers with filters
 */
export function useTeachers(filters?: TeacherFilters) {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  const fetchTeachers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.teachers.getTeachers(filters);
      setTeachers(response.data.items);
      setTotal(response.data.total);
      setHasMore(response.data.hasMore);
    } catch (err: any) {
      setError(err.error || 'Failed to load teachers');
      console.error('Error fetching teachers:', err);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(filters)]);

  useEffect(() => {
    fetchTeachers();
  }, [fetchTeachers]);

  return {
    teachers,
    loading,
    error,
    total,
    hasMore,
    refetch: fetchTeachers,
  };
}

/**
 * Hook to fetch a single teacher by ID
 */
export function useTeacherById(id: string | undefined) {
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    async function fetchTeacher() {
      try {
        setLoading(true);
        setError(null);
        const response = await api.teachers.getTeacherById(id);
        setTeacher(response.data);
      } catch (err: any) {
        setError(err.error || 'Failed to load teacher');
        console.error('Error fetching teacher:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchTeacher();
  }, [id]);

  return { teacher, loading, error };
}

/**
 * Hook to fetch active subscription plans
 */
export function useSubscriptionPlans() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPlans() {
      try {
        setLoading(true);
        setError(null);
        const response = await api.subscriptions.getActiveSubscriptionPlans();
        setPlans(response.data);
      } catch (err: any) {
        setError(err.error || 'Failed to load subscription plans');
        console.error('Error fetching subscription plans:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchPlans();
  }, []);

  return { plans, loading, error };
}
