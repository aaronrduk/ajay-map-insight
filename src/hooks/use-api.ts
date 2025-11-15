import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as api from "@/lib/api-service";

// Custom hooks for data fetching with React Query
// These hooks provide loading states, error handling, and caching

export const useFundsData = (filters: Parameters<typeof api.fetchFundsData>[0]) => {
  return useQuery({
    queryKey: ["funds", filters],
    queryFn: () => api.fetchFundsData(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useSchemeData = (filters: Parameters<typeof api.fetchSchemeData>[0]) => {
  return useQuery({
    queryKey: ["schemes", filters],
    queryFn: () => api.fetchSchemeData(filters),
    staleTime: 5 * 60 * 1000,
  });
};

export const useCourses = (component?: string) => {
  return useQuery({
    queryKey: ["courses", component],
    queryFn: () => api.fetchCourses(component),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useColleges = (state?: string, courseId?: string) => {
  return useQuery({
    queryKey: ["colleges", state, courseId],
    queryFn: () => api.fetchColleges(state, courseId),
    enabled: !!state || !!courseId,
    staleTime: 10 * 60 * 1000,
  });
};

export const useGrantEligibility = () => {
  return useMutation({
    mutationFn: api.checkGrantEligibility,
  });
};

export const useUserGrievances = (email: string) => {
  return useQuery({
    queryKey: ["grievances", email],
    queryFn: () => api.fetchUserGrievances(email),
    enabled: !!email,
  });
};

export const useSubmitGrievance = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.submitGrievance,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["grievances"] });
    },
  });
};

export const useSubmitRegistration = () => {
  return useMutation({
    mutationFn: api.submitCourseRegistration,
  });
};

export const useSubmitProposal = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.submitProposal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["proposals"] });
    },
  });
};

export const useAgencyData = (filters: Parameters<typeof api.fetchAgencyData>[0]) => {
  return useQuery({
    queryKey: ["agency-data", filters],
    queryFn: () => api.fetchAgencyData(filters),
    staleTime: 5 * 60 * 1000,
  });
};

export const useAgencies = () => {
  return useQuery({
    queryKey: ["agencies"],
    queryFn: api.fetchAgencies,
    staleTime: 10 * 60 * 1000,
  });
};

export const useAllProposals = (status?: string) => {
  return useQuery({
    queryKey: ["all-proposals", status],
    queryFn: () => api.fetchAllProposals(status),
  });
};

export const useUpdateProposal = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status, notes, reviewer }: {
      id: string;
      status: string;
      notes?: string;
      reviewer?: string
    }) => api.updateProposalStatus(id, status, notes, reviewer),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-proposals"] });
    },
  });
};

export const useAllGrievances = (status?: string) => {
  return useQuery({
    queryKey: ["all-grievances", status],
    queryFn: () => api.fetchAllGrievances(status),
  });
};

export const useUpdateGrievance = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<api.Grievance> }) =>
      api.updateGrievanceStatus(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-grievances"] });
    },
  });
};

export const useFilterOptions = () => {
  const states = useQuery({
    queryKey: ["filter-states"],
    queryFn: api.getUniqueStates,
    staleTime: 30 * 60 * 1000, // 30 minutes
  });

  const years = useQuery({
    queryKey: ["filter-years"],
    queryFn: api.getUniqueYears,
    staleTime: 30 * 60 * 1000,
  });

  const agencies = useQuery({
    queryKey: ["filter-agencies"],
    queryFn: api.getUniqueAgencies,
    staleTime: 30 * 60 * 1000,
  });

  const components = useQuery({
    queryKey: ["filter-components"],
    queryFn: api.getUniqueComponents,
    staleTime: 30 * 60 * 1000,
  });

  return { states, years, agencies, components };
};
