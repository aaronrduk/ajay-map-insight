import { supabase } from "@/integrations/supabase/client";

// API Service Layer for PM-AJAY Portal
// This file contains all data fetching and mutation functions
// Backend Integration Points: All functions can be replaced with actual API calls

export interface FundsData {
  id: string;
  state: string;
  district: string;
  year: number;
  agency: string;
  component: string;
  allocated_amount: number;
  utilized_amount: number;
}

export interface BeneficiaryData {
  id: string;
  scheme_component: string;
  state: string;
  district: string;
  agency: string;
  beneficiary_count: number;
  year: number;
  category: string;
}

export interface Course {
  id: string;
  component: string;
  course_name: string;
  duration: string;
  eligibility: string;
  description: string;
  is_active: boolean;
}

export interface College {
  id: string;
  name: string;
  state: string;
  district: string;
  address: string;
  website: string;
  contact: string;
}

export interface Grievance {
  id: string;
  reference_id: string;
  name: string;
  email: string;
  phone: string;
  state: string;
  district: string;
  agency: string;
  component: string;
  grievance_type: string;
  description: string;
  status: string;
  priority: string;
  created_at: string;
  updated_at: string;
}

export interface Proposal {
  id: string;
  proposal_number: string;
  agency_name: string;
  state: string;
  district: string;
  village: string;
  component: string;
  title: string;
  description: string;
  expected_impact: string;
  funds_required: number;
  status: string;
  created_at: string;
}

// BACKEND INTEGRATION POINT: /api/funds?state=&year=&agency=&component=
export const fetchFundsData = async (filters: {
  state?: string;
  year?: number;
  agency?: string;
  component?: string;
}) => {
  let query = supabase.from("funds_allocation").select("*");

  if (filters.state) query = query.eq("state", filters.state);
  if (filters.year) query = query.eq("year", filters.year);
  if (filters.agency) query = query.eq("agency", filters.agency);
  if (filters.component) query = query.eq("component", filters.component);

  const { data, error } = await query;
  if (error) throw error;
  return data as FundsData[];
};

// BACKEND INTEGRATION POINT: /api/schemes?component=&state=
export const fetchSchemeData = async (filters: {
  component?: string;
  state?: string;
}) => {
  let query = supabase.from("scheme_beneficiaries").select("*");

  if (filters.component) query = query.eq("scheme_component", filters.component);
  if (filters.state) query = query.eq("state", filters.state);

  const { data, error } = await query;
  if (error) throw error;
  return data as BeneficiaryData[];
};

// BACKEND INTEGRATION POINT: /api/courses
export const fetchCourses = async (component?: string) => {
  let query = supabase.from("courses").select("*").eq("is_active", true);

  if (component) query = query.eq("component", component);

  const { data, error } = await query;
  if (error) throw error;
  return data as Course[];
};

// BACKEND INTEGRATION POINT: /api/colleges?state=
export const fetchColleges = async (state?: string, courseId?: string) => {
  let query = supabase.from("colleges").select(`
    *,
    college_courses!inner(course_id, seats_available)
  `);

  if (state) query = query.eq("state", state);
  if (courseId) query = query.eq("college_courses.course_id", courseId);

  const { data, error } = await query;
  if (error) throw error;
  return data as any[];
};

// BACKEND INTEGRATION POINT: /api/register
export const submitCourseRegistration = async (registration: {
  name: string;
  email: string;
  phone: string;
  state: string;
  course_id: string;
  component: string;
  document_url?: string;
}) => {
  const { data, error } = await supabase
    .from("course_registrations")
    .insert([registration])
    .select()
    .single();

  if (error) throw error;
  return data;
};

// BACKEND INTEGRATION POINT: /api/grants/eligibility
export const checkGrantEligibility = async (criteria: {
  age: number;
  state: string;
  category: string;
  income: number;
  component: string;
}) => {
  const { data, error } = await supabase
    .from("grant_eligibility_criteria")
    .select("*")
    .eq("component", criteria.component)
    .eq("category", criteria.category)
    .lte("min_age", criteria.age)
    .gte("max_age", criteria.age)
    .gte("max_income", criteria.income)
    .maybeSingle();

  if (error) throw error;

  return {
    eligible: !!data,
    grant_amount: data?.grant_amount || 0,
    required_documents: data?.required_documents || [],
    criteria: data,
  };
};

// BACKEND INTEGRATION POINT: /api/grievances
export const submitGrievance = async (grievance: Omit<Grievance, "id" | "reference_id" | "created_at" | "updated_at">) => {
  const reference_id = `GRV-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

  const { data, error } = await supabase
    .from("grievances")
    .insert([{ ...grievance, reference_id, status: "pending" }])
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Fetch user's grievance history
export const fetchUserGrievances = async (email: string) => {
  const { data, error } = await supabase
    .from("grievances")
    .select("*")
    .eq("email", email)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as Grievance[];
};

// BACKEND INTEGRATION POINT: /api/proposals
export const submitProposal = async (proposal: Omit<Proposal, "id" | "proposal_number" | "created_at">) => {
  const proposal_number = `PRO-${new Date().getFullYear()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

  const { data, error } = await supabase
    .from("proposals")
    .insert([{ ...proposal, proposal_number, status: "submitted", submitted_at: new Date().toISOString() }])
    .select()
    .single();

  if (error) throw error;
  return data;
};

// BACKEND INTEGRATION POINT: /api/agency?state=&agency=&component=
export const fetchAgencyData = async (filters: {
  state?: string;
  district?: string;
  agency?: string;
  component?: string;
}) => {
  let fundsQuery = supabase.from("funds_allocation").select("*");
  let beneficiariesQuery = supabase.from("scheme_beneficiaries").select("*");

  if (filters.state) {
    fundsQuery = fundsQuery.eq("state", filters.state);
    beneficiariesQuery = beneficiariesQuery.eq("state", filters.state);
  }
  if (filters.district) {
    fundsQuery = fundsQuery.eq("district", filters.district);
    beneficiariesQuery = beneficiariesQuery.eq("district", filters.district);
  }
  if (filters.agency) {
    fundsQuery = fundsQuery.eq("agency", filters.agency);
    beneficiariesQuery = beneficiariesQuery.eq("agency", filters.agency);
  }
  if (filters.component) {
    fundsQuery = fundsQuery.eq("component", filters.component);
    beneficiariesQuery = beneficiariesQuery.eq("scheme_component", filters.component);
  }

  const [fundsResult, beneficiariesResult] = await Promise.all([
    fundsQuery,
    beneficiariesQuery,
  ]);

  if (fundsResult.error) throw fundsResult.error;
  if (beneficiariesResult.error) throw beneficiariesResult.error;

  return {
    funds: fundsResult.data as FundsData[],
    beneficiaries: beneficiariesResult.data as BeneficiaryData[],
  };
};

// Fetch all agencies
export const fetchAgencies = async () => {
  const { data, error } = await supabase
    .from("agencies")
    .select("*")
    .order("name");

  if (error) throw error;
  return data;
};

// BACKEND INTEGRATION POINT: /api/admin/proposals
export const fetchAllProposals = async (status?: string) => {
  let query = supabase.from("proposals").select("*").order("created_at", { ascending: false });

  if (status) query = query.eq("status", status);

  const { data, error } = await query;
  if (error) throw error;
  return data as Proposal[];
};

// Update proposal status (admin)
export const updateProposalStatus = async (
  id: string,
  status: string,
  reviewNotes?: string,
  reviewedBy?: string
) => {
  const { data, error } = await supabase
    .from("proposals")
    .update({
      status,
      review_notes: reviewNotes,
      reviewed_by: reviewedBy,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// BACKEND INTEGRATION POINT: /api/admin/grievances
export const fetchAllGrievances = async (status?: string) => {
  let query = supabase.from("grievances").select("*").order("created_at", { ascending: false });

  if (status) query = query.eq("status", status);

  const { data, error } = await query;
  if (error) throw error;
  return data as Grievance[];
};

// Update grievance status (admin)
export const updateGrievanceStatus = async (
  id: string,
  updates: Partial<Grievance>
) => {
  const { data, error } = await supabase
    .from("grievances")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Get unique filter values for dropdowns
export const getUniqueStates = async () => {
  const { data, error } = await supabase
    .from("funds_allocation")
    .select("state")
    .order("state");

  if (error) throw error;
  return [...new Set(data.map((item) => item.state))];
};

export const getUniqueYears = async () => {
  const { data, error } = await supabase
    .from("funds_allocation")
    .select("year")
    .order("year", { ascending: false });

  if (error) throw error;
  return [...new Set(data.map((item) => item.year))];
};

export const getUniqueAgencies = async () => {
  const { data, error } = await supabase
    .from("funds_allocation")
    .select("agency")
    .order("agency");

  if (error) throw error;
  return [...new Set(data.map((item) => item.agency))];
};

export const getUniqueComponents = async () => {
  const { data, error } = await supabase
    .from("funds_allocation")
    .select("component")
    .order("component");

  if (error) throw error;
  return [...new Set(data.map((item) => item.component))];
};
