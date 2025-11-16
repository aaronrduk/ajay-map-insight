import { useQuery } from "@tanstack/react-query";
import { fetchAllPMajayData, fetchDataset, API_ENDPOINTS } from "@/lib/data-gov-api";

// Hook to fetch all PM-AJAY datasets
export const useAllPMajayData = () => {
  return useQuery({
    queryKey: ["pmajay-all-data"],
    queryFn: fetchAllPMajayData,
    staleTime: 30 * 60 * 1000, // 30 minutes
    retry: 2,
  });
};

// Hook to fetch a single dataset
export const usePMajayDataset = (datasetKey: keyof typeof API_ENDPOINTS) => {
  return useQuery({
    queryKey: ["pmajay-dataset", datasetKey],
    queryFn: () => fetchDataset(datasetKey),
    staleTime: 30 * 60 * 1000, // 30 minutes
    retry: 2,
  });
};
