// API utility functions with placeholder endpoints for backend integration
// Replace these with actual API calls when backend is ready

export interface FundData {
  state: string;
  year: string;
  agency: string;
  component: string;
  allocated: number;
  utilized: number;
}

export interface SchemeData {
  component: string;
  state: string;
  beneficiaries: number;
  agencies: string[];
  yearWiseData: { year: string; count: number }[];
}

export interface Course {
  id: string;
  name: string;
  component: string;
  state: string;
  colleges: {
    name: string;
    location: string;
    website: string;
  }[];
}

export interface GrantEligibility {
  eligible: boolean;
  amount: number;
  documents: string[];
  agencies: string[];
}

export interface Grievance {
  id: string;
  name: string;
  contact: string;
  state: string;
  agency: string;
  component: string;
  description: string;
  status: 'pending' | 'in-progress' | 'resolved';
  submittedAt: string;
}

export interface Proposal {
  id: string;
  agencyName: string;
  state: string;
  title: string;
  description: string;
  expectedImpact: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
}

export interface AgencyData {
  name: string;
  state: string;
  allocated: number;
  utilized: number;
  beneficiaries: number;
  schemes: {
    component: string;
    count: number;
  }[];
  yearWiseData: { year: string; allocated: number; utilized: number }[];
}

// Placeholder API functions - backend integration points

export const fetchFundData = async (filters: Partial<FundData>): Promise<FundData[]> => {
  // TODO: Replace with actual API call: fetch('/api/funds?state=&year=&agency=&component=')
  await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
  
  // Dummy data
  return [
    { state: "Maharashtra", year: "2023", agency: "NSFDC", component: "Adarsh Gram", allocated: 50000000, utilized: 42000000 },
    { state: "Maharashtra", year: "2024", agency: "NSFDC", component: "Adarsh Gram", allocated: 60000000, utilized: 48000000 },
    { state: "Karnataka", year: "2023", agency: "NSKFDC", component: "Hostels", allocated: 35000000, utilized: 30000000 },
  ];
};

export const fetchSchemeData = async (component: string, state: string): Promise<SchemeData> => {
  // TODO: Replace with actual API call: fetch('/api/schemes?component=&state=')
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return {
    component,
    state,
    beneficiaries: 12450,
    agencies: ["NSFDC", "NSKFDC", "NBCFDC"],
    yearWiseData: [
      { year: "2021", count: 2500 },
      { year: "2022", count: 4200 },
      { year: "2023", count: 5750 },
    ],
  };
};

export const fetchCourses = async (component: string, state: string): Promise<Course[]> => {
  // TODO: Replace with actual API call: fetch('/api/courses?component=&state=')
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return [
    {
      id: "1",
      name: "Computer Science & Engineering",
      component,
      state,
      colleges: [
        { name: "IIT Delhi", location: "Delhi", website: "https://iitd.ac.in" },
        { name: "NIT Trichy", location: "Tamil Nadu", website: "https://nitt.edu" },
      ],
    },
    {
      id: "2",
      name: "Mechanical Engineering",
      component,
      state,
      colleges: [
        { name: "IIT Bombay", location: "Maharashtra", website: "https://iitb.ac.in" },
      ],
    },
  ];
};

export const checkGrantEligibility = async (data: {
  age: number;
  state: string;
  category: string;
  income: number;
  component: string;
}): Promise<GrantEligibility> => {
  // TODO: Replace with actual API call: fetch('/api/grants/eligibility', { method: 'POST', body: JSON.stringify(data) })
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const eligible = data.income < 300000 && data.age >= 18 && data.age <= 45;
  
  return {
    eligible,
    amount: eligible ? 50000 : 0,
    documents: eligible ? ["Aadhar Card", "Income Certificate", "Caste Certificate", "Bank Passbook"] : [],
    agencies: eligible ? ["NSFDC", "NSKFDC"] : [],
  };
};

export const submitGrievance = async (data: Omit<Grievance, 'id' | 'status' | 'submittedAt'>): Promise<{ id: string }> => {
  // TODO: Replace with actual API call: fetch('/api/grievances', { method: 'POST', body: JSON.stringify(data) })
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return { id: `GRV${Date.now()}` };
};

export const fetchUserGrievances = async (email: string): Promise<Grievance[]> => {
  // TODO: Replace with actual API call: fetch('/api/grievances/user?email=')
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return [
    {
      id: "GRV123456",
      name: "John Doe",
      contact: "john@example.com",
      state: "Maharashtra",
      agency: "NSFDC",
      component: "Adarsh Gram",
      description: "Delay in project implementation",
      status: "in-progress",
      submittedAt: "2024-01-15",
    },
  ];
};

export const submitProposal = async (data: Omit<Proposal, 'id' | 'status' | 'submittedAt'>): Promise<{ id: string }> => {
  // TODO: Replace with actual API call: fetch('/api/proposals', { method: 'POST', body: JSON.stringify(data) })
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return { id: `PROP${Date.now()}` };
};

export const fetchAgencyData = async (agency: string, state?: string): Promise<AgencyData> => {
  // TODO: Replace with actual API call: fetch('/api/agency?name=&state=')
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return {
    name: agency,
    state: state || "All States",
    allocated: 150000000,
    utilized: 120000000,
    beneficiaries: 25430,
    schemes: [
      { component: "Adarsh Gram", count: 8500 },
      { component: "Hostels", count: 12200 },
      { component: "Skill Development", count: 4730 },
    ],
    yearWiseData: [
      { year: "2021", allocated: 40000000, utilized: 32000000 },
      { year: "2022", allocated: 50000000, utilized: 42000000 },
      { year: "2023", allocated: 60000000, utilized: 46000000 },
    ],
  };
};

export const registerForCourse = async (data: {
  name: string;
  email: string;
  phone: string;
  state: string;
  course: string;
  component: string;
  documents?: File[];
}): Promise<{ success: boolean; registrationId: string }> => {
  // TODO: Replace with actual API call: fetch('/api/register', { method: 'POST', body: formData })
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return {
    success: true,
    registrationId: `REG${Date.now()}`,
  };
};

// Admin API functions
export const fetchAllProposals = async (): Promise<Proposal[]> => {
  // TODO: Replace with actual API call: fetch('/api/admin/proposals')
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return [
    {
      id: "PROP123",
      agencyName: "NSFDC",
      state: "Maharashtra",
      title: "Village Development Project",
      description: "Infrastructure development in rural areas",
      expectedImpact: "5000 beneficiaries",
      status: "pending",
      submittedAt: "2024-02-01",
    },
    {
      id: "PROP124",
      agencyName: "NSKFDC",
      state: "Karnataka",
      title: "Skill Training Center",
      description: "Vocational training for SC youth",
      expectedImpact: "2000 beneficiaries",
      status: "approved",
      submittedAt: "2024-01-28",
    },
  ];
};

export const updateProposalStatus = async (id: string, status: 'approved' | 'rejected'): Promise<void> => {
  // TODO: Replace with actual API call: fetch('/api/admin/proposals/${id}', { method: 'PATCH', body: JSON.stringify({ status }) })
  await new Promise(resolve => setTimeout(resolve, 500));
};

export const fetchAllGrievances = async (): Promise<Grievance[]> => {
  // TODO: Replace with actual API call: fetch('/api/admin/grievances')
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return [
    {
      id: "GRV123",
      name: "Citizen A",
      contact: "citizen@example.com",
      state: "Maharashtra",
      agency: "NSFDC",
      component: "Adarsh Gram",
      description: "Project delay issue",
      status: "pending",
      submittedAt: "2024-02-05",
    },
  ];
};

export const updateGrievanceStatus = async (id: string, status: 'in-progress' | 'resolved'): Promise<void> => {
  // TODO: Replace with actual API call: fetch('/api/admin/grievances/${id}', { method: 'PATCH', body: JSON.stringify({ status }) })
  await new Promise(resolve => setTimeout(resolve, 500));
};
