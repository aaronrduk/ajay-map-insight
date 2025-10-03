export interface AgencyMapping {
  id: string;
  component: string;
  state: string;
  district: string;
  village: string;
  agencies: string[];
  status: "Approved" | "Ongoing" | "Completed";
  fundsAllocated: number;
  fundsUtilized: number;
}

export const agencyMappings: AgencyMapping[] = [
  {
    id: "1",
    component: "Adarsh Gram",
    state: "Kerala",
    district: "Kollam",
    village: "Village A",
    agencies: ["District Collector", "Panchayat", "PWD"],
    status: "Ongoing",
    fundsAllocated: 5000000,
    fundsUtilized: 3200000,
  },
  {
    id: "2",
    component: "Hostels for SC Students",
    state: "Tamil Nadu",
    district: "Chennai",
    village: "City Block 1",
    agencies: ["Social Welfare Dept", "MoSJ&E"],
    status: "Approved",
    fundsAllocated: 20000000,
    fundsUtilized: 14000000,
  },
  {
    id: "3",
    component: "NGO Project",
    state: "Uttar Pradesh",
    district: "Lucknow",
    village: "Sector 5",
    agencies: ["Local NGO", "Collector"],
    status: "Completed",
    fundsAllocated: 2500000,
    fundsUtilized: 2500000,
  },
  {
    id: "4",
    component: "Skill Development",
    state: "Maharashtra",
    district: "Pune",
    village: "Village B",
    agencies: ["MSDE", "District Collector", "Local ITI"],
    status: "Ongoing",
    fundsAllocated: 8000000,
    fundsUtilized: 6000000,
  },
  {
    id: "5",
    component: "Infrastructure Development",
    state: "Karnataka",
    district: "Bangalore Rural",
    village: "Village C",
    agencies: ["PWD", "Zilla Panchayat", "MoSJ&E"],
    status: "Approved",
    fundsAllocated: 12000000,
    fundsUtilized: 2000000,
  },
  {
    id: "6",
    component: "Adarsh Gram",
    state: "Rajasthan",
    district: "Jaipur",
    village: "Village D",
    agencies: ["District Collector", "Gram Panchayat"],
    status: "Ongoing",
    fundsAllocated: 4500000,
    fundsUtilized: 3000000,
  },
  {
    id: "7",
    component: "NGO Project",
    state: "Gujarat",
    district: "Ahmedabad",
    village: "Village E",
    agencies: ["Local NGO", "Social Welfare"],
    status: "Completed",
    fundsAllocated: 3000000,
    fundsUtilized: 3000000,
  },
  {
    id: "8",
    component: "Hostels for SC Students",
    state: "West Bengal",
    district: "Kolkata",
    village: "Ward 12",
    agencies: ["Education Dept", "MoSJ&E", "Municipal Corp"],
    status: "Ongoing",
    fundsAllocated: 15000000,
    fundsUtilized: 10000000,
  },
];

export const components = [
  "Adarsh Gram",
  "Hostels for SC Students",
  "NGO Project",
  "Skill Development",
  "Infrastructure Development",
];

export const states = [
  "Kerala",
  "Tamil Nadu",
  "Uttar Pradesh",
  "Maharashtra",
  "Karnataka",
  "Rajasthan",
  "Gujarat",
  "West Bengal",
];

export interface DistrictData {
  district: string;
  state: string;
  villages: string[];
  agencies: string[];
  projects: number;
  fundsAllocated: number;
  fundsUtilized: number;
  scPopulation: number;
}

export const districtData: DistrictData[] = [
  {
    district: "Kollam",
    state: "Kerala",
    villages: ["Village A", "Village F"],
    agencies: ["District Collector", "Panchayat", "PWD"],
    projects: 2,
    fundsAllocated: 7000000,
    fundsUtilized: 4500000,
    scPopulation: 25000,
  },
  {
    district: "Chennai",
    state: "Tamil Nadu",
    villages: ["City Block 1", "City Block 2"],
    agencies: ["Social Welfare Dept", "MoSJ&E"],
    projects: 3,
    fundsAllocated: 25000000,
    fundsUtilized: 18000000,
    scPopulation: 45000,
  },
  {
    district: "Lucknow",
    state: "Uttar Pradesh",
    villages: ["Sector 5", "Sector 8"],
    agencies: ["Local NGO", "Collector"],
    projects: 2,
    fundsAllocated: 5000000,
    fundsUtilized: 4000000,
    scPopulation: 35000,
  },
  {
    district: "Pune",
    state: "Maharashtra",
    villages: ["Village B", "Village G"],
    agencies: ["MSDE", "District Collector", "Local ITI"],
    projects: 3,
    fundsAllocated: 12000000,
    fundsUtilized: 9000000,
    scPopulation: 38000,
  },
  {
    district: "Bangalore Rural",
    state: "Karnataka",
    villages: ["Village C", "Village H"],
    agencies: ["PWD", "Zilla Panchayat", "MoSJ&E"],
    projects: 2,
    fundsAllocated: 15000000,
    fundsUtilized: 5000000,
    scPopulation: 28000,
  },
];
