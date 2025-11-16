// PM-AJAY Data Fetching Module for Data.gov.in APIs
// This module fetches real data from government open data portal

const BASE_URL = "https://api.data.gov.in/resource";

// API Configuration with resource IDs and API keys
export const API_ENDPOINTS = {
  dataset1: {
    resourceId: "5040b4a2-b2ae-41b9-878d-bf657460fc68",
    apiKey: "579b464db66ec23bdd000001cdd3946e44ce4aad7209ff7b23ac571b",
    name: "PM-AJAY Fund Allocation Data",
    description: "Comprehensive fund allocation details across states"
  },
  dataset2: {
    resourceId: "a915f63d-bc99-47d0-8471-018f6c5c39c2",
    apiKey: "579b464db66ec23bdd000001edf96157400e4c6d5c24201aa0319738",
    name: "PM-AJAY Fund Utilization Data",
    description: "Fund utilization metrics by state and district"
  },
  dataset3: {
    resourceId: "7cff7e60-3cfc-40e2-8ef8-3354ed86dfc0",
    apiKey: "579b464db66ec23bdd000001edf96157400e4c6d5c24201aa0319738",
    name: "Village-wise Implementation Data",
    description: "PM-AJAY implementation at village level"
  },
  dataset4: {
    resourceId: "e349b809-1722-4684-9981-fc8419abe17d",
    apiKey: "579b464db66ec23bdd000001edf96157400e4c6d5c24201aa0319738",
    name: "District-wise Summary Data",
    description: "District level aggregated data"
  },
  dataset5: {
    resourceId: "3e4319fb-3fe6-4169-9ac5-e2f18b8645e1",
    apiKey: "579b464db66ec23bdd000001edf96157400e4c6d5c24201aa0319738",
    name: "Agency Performance Data",
    description: "Performance metrics of implementing agencies"
  },
  dataset6: {
    resourceId: "f9f2ec91-c75f-4930-9c63-7bfed3c277e7",
    apiKey: "579b464db66ec23bdd000001edf96157400e4c6d5c24201aa0319738",
    name: "Beneficiary Statistics",
    description: "Beneficiary count and demographic data"
  },
  dataset7: {
    resourceId: "d1e960e8-4058-4c33-aff8-c37e2189aef0",
    apiKey: "579b464db66ec23bdd000001edf96157400e4c6d5c24201aa0319738",
    name: "Scheme Component Details",
    description: "Component-wise scheme implementation data"
  },
  dataset8: {
    resourceId: "842f4e3f-bb32-450e-8387-45ebf5cda3f2",
    apiKey: "579b464db66ec23bdd000001edf96157400e4c6d5c24201aa0319738",
    name: "Project Timeline Data",
    description: "Timeline and milestone tracking data"
  }
};

interface DataGovResponse {
  records: any[];
  total: number;
  count: number;
  limit: number;
  offset: number;
}

interface FetchResult {
  success: boolean;
  data: any[];
  metadata: {
    name: string;
    description: string;
    recordCount: number;
    fetchedAt: string;
  };
  error?: string;
}

// Fetch single dataset from Data.gov.in API
export const fetchDataset = async (
  datasetKey: keyof typeof API_ENDPOINTS,
  limit = 10000
): Promise<FetchResult> => {
  const config = API_ENDPOINTS[datasetKey];
  const url = `${BASE_URL}/${config.resourceId}?api-key=${config.apiKey}&format=json&limit=${limit}`;

  try {
    console.log(`Fetching ${config.name}...`);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: DataGovResponse = await response.json();

    return {
      success: true,
      data: result.records || [],
      metadata: {
        name: config.name,
        description: config.description,
        recordCount: result.records?.length || 0,
        fetchedAt: new Date().toISOString(),
      },
    };
  } catch (error) {
    console.error(`Error fetching ${config.name}:`, error);
    return {
      success: false,
      data: [],
      metadata: {
        name: config.name,
        description: config.description,
        recordCount: 0,
        fetchedAt: new Date().toISOString(),
      },
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

// Fetch all PM-AJAY datasets in parallel
export const fetchAllPMajayData = async () => {
  console.log('Starting to fetch all PM-AJAY datasets...');

  const datasetKeys = Object.keys(API_ENDPOINTS) as Array<keyof typeof API_ENDPOINTS>;

  try {
    const results = await Promise.all(
      datasetKeys.map(key => fetchDataset(key))
    );

    const structuredData: Record<string, FetchResult> = {};

    datasetKeys.forEach((key, index) => {
      structuredData[key] = results[index];
    });

    const successCount = results.filter(r => r.success).length;
    const totalRecords = results.reduce((sum, r) => sum + r.metadata.recordCount, 0);

    console.log(`Fetch complete: ${successCount}/${results.length} datasets successful, ${totalRecords} total records`);

    return {
      datasets: structuredData,
      summary: {
        totalDatasets: results.length,
        successfulFetches: successCount,
        failedFetches: results.length - successCount,
        totalRecords,
        fetchedAt: new Date().toISOString(),
      },
    };
  } catch (error) {
    console.error('Error fetching all datasets:', error);
    throw error;
  }
};

// Get dataset by key
export const getDataset = (
  allData: Awaited<ReturnType<typeof fetchAllPMajayData>>,
  datasetKey: keyof typeof API_ENDPOINTS
) => {
  return allData.datasets[datasetKey];
};

// Export data to CSV format
export const exportToCSV = (data: any[], filename: string) => {
  if (!data || data.length === 0) {
    console.warn('No data to export');
    return;
  }

  // Get all unique keys from all records
  const keys = Array.from(
    new Set(data.flatMap(record => Object.keys(record)))
  );

  // Create CSV header
  const csvHeader = keys.join(',');

  // Create CSV rows
  const csvRows = data.map(record => {
    return keys.map(key => {
      const value = record[key];
      // Handle values that contain commas or quotes
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value ?? '';
    }).join(',');
  });

  // Combine header and rows
  const csvContent = [csvHeader, ...csvRows].join('\n');

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Format currency values
export const formatCurrency = (value: number | string): string => {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return '₹0';

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(num);
};

// Format large numbers with commas
export const formatNumber = (value: number | string): string => {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return '0';

  return new Intl.NumberFormat('en-IN').format(num);
};

// Search through dataset
export const searchDataset = (data: any[], searchTerm: string): any[] => {
  if (!searchTerm || searchTerm.trim() === '') return data;

  const lowerSearchTerm = searchTerm.toLowerCase();

  return data.filter(record => {
    return Object.values(record).some(value => {
      if (value === null || value === undefined) return false;
      return String(value).toLowerCase().includes(lowerSearchTerm);
    });
  });
};

// Get aggregated statistics from dataset
export const getDatasetStatistics = (data: any[]) => {
  if (!data || data.length === 0) {
    return {
      totalRecords: 0,
      fields: [],
      numericFields: [],
    };
  }

  const allKeys = Array.from(
    new Set(data.flatMap(record => Object.keys(record)))
  );

  const numericFields = allKeys.filter(key => {
    const sample = data.find(r => r[key] !== null && r[key] !== undefined);
    if (!sample) return false;
    const value = sample[key];
    return typeof value === 'number' || !isNaN(parseFloat(value));
  });

  return {
    totalRecords: data.length,
    fields: allKeys,
    numericFields,
  };
};
