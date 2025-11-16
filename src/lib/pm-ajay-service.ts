import { supabase } from "@/integrations/supabase/client";

export interface SyncMetadata {
  id: string;
  dataset_name: string;
  resource_id: string;
  last_sync_at: string | null;
  last_sync_status: string;
  last_sync_error: string | null;
  total_records: number;
  created_at: string;
  updated_at: string;
}

export interface DatasetRecord {
  id: string;
  record_id: string;
  data: any;
  record_hash: string;
  synced_at: string;
  created_at: string;
}

export const pmAjayService = {
  async getSyncMetadata(): Promise<SyncMetadata[]> {
    const { data, error } = await supabase
      .from("pm_ajay_sync_metadata")
      .select("*")
      .order("dataset_name");

    if (error) throw error;
    return data || [];
  },

  async getDataset(datasetNumber: number, limit = 100, offset = 0): Promise<DatasetRecord[]> {
    if (datasetNumber < 1 || datasetNumber > 15) {
      throw new Error("Dataset number must be between 1 and 15");
    }

    const tableName = `pm_ajay_dataset_${datasetNumber}`;

    const { data, error } = await supabase
      .from(tableName)
      .select("*")
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return data || [];
  },

  async getDatasetCount(datasetNumber: number): Promise<number> {
    if (datasetNumber < 1 || datasetNumber > 15) {
      throw new Error("Dataset number must be between 1 and 15");
    }

    const tableName = `pm_ajay_dataset_${datasetNumber}`;

    const { count, error } = await supabase
      .from(tableName)
      .select("*", { count: "exact", head: true });

    if (error) throw error;
    return count || 0;
  },

  async triggerSync(datasetNumber?: number): Promise<any> {
    const url = datasetNumber
      ? `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/sync-pm-ajay-data?dataset=${datasetNumber}`
      : `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/sync-pm-ajay-data`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Sync failed: ${response.statusText}`);
    }

    return await response.json();
  },

  async searchDataset(datasetNumber: number, searchTerm: string): Promise<DatasetRecord[]> {
    if (datasetNumber < 1 || datasetNumber > 15) {
      throw new Error("Dataset number must be between 1 and 15");
    }

    const tableName = `pm_ajay_dataset_${datasetNumber}`;

    const { data, error } = await supabase
      .from(tableName)
      .select("*")
      .textSearch("data", searchTerm)
      .limit(50);

    if (error) throw error;
    return data || [];
  },

  async getAllDatasets(): Promise<{ [key: number]: DatasetRecord[] }> {
    const results: { [key: number]: DatasetRecord[] } = {};

    for (let i = 1; i <= 15; i++) {
      try {
        const data = await this.getDataset(i, 10);
        results[i] = data;
      } catch (error) {
        console.error(`Error fetching dataset ${i}:`, error);
        results[i] = [];
      }
    }

    return results;
  },
};
