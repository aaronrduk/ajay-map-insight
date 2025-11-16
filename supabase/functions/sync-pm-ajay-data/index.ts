import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

const API_KEY = '579b464db66ec23bdd000001edf96157400e4c6d5c24201aa0319738';
const BASE_URL = 'https://api.data.gov.in/resource';

const DATASETS = [
  { id: 1, resourceId: '9bdf6219-38a0-4335-8b2c-2385fdae47b3', table: 'pm_ajay_dataset_1' },
  { id: 2, resourceId: 'ca6065cf-8f0c-49b1-bcc8-78faba03c0da', table: 'pm_ajay_dataset_2' },
  { id: 3, resourceId: '8b075576-a48f-44a7-8efa-2399e787c699', table: 'pm_ajay_dataset_3' },
  { id: 4, resourceId: 'd0063c23-5195-4377-9a5d-aa40e15cd486', table: 'pm_ajay_dataset_4' },
  { id: 5, resourceId: 'ecf91f8d-36b1-460d-b856-cb2d42725f47', table: 'pm_ajay_dataset_5' },
  { id: 6, resourceId: 'c4596021-dc87-43e7-84c5-1b6cf01fc9b3', table: 'pm_ajay_dataset_6' },
  { id: 7, resourceId: '0f6c1999-44d0-4ed3-b09d-432f8ca4d79f', table: 'pm_ajay_dataset_7' },
];

async function fetchDatasetWithRetry(resourceId: string, retries = 3): Promise<any> {
  for (let i = 0; i < retries; i++) {
    try {
      const url = `${BASE_URL}/${resourceId}?api-key=${API_KEY}&format=json&limit=1000`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
}

async function syncDataset(supabase: any, dataset: any) {
  try {
    const apiData = await fetchDatasetWithRetry(dataset.resourceId);
    
    if (!apiData || !apiData.records || apiData.records.length === 0) {
      await supabase
        .from('pm_ajay_sync_metadata')
        .update({
          last_sync_at: new Date().toISOString(),
          last_sync_status: 'success',
          last_sync_error: 'No records found',
          total_records: 0,
          updated_at: new Date().toISOString()
        })
        .eq('dataset_name', dataset.table);
      
      return { success: true, records: 0, message: 'No records found' };
    }

    const records = apiData.records.map((record: any, index: number) => ({
      record_id: record._id || `${dataset.resourceId}-${index}`,
      data: record,
      synced_at: new Date().toISOString()
    }));

    for (const record of records) {
      await supabase
        .from(dataset.table)
        .upsert(record, { onConflict: 'record_id' });
    }

    await supabase
      .from('pm_ajay_sync_metadata')
      .update({
        last_sync_at: new Date().toISOString(),
        last_sync_status: 'success',
        last_sync_error: null,
        total_records: records.length,
        updated_at: new Date().toISOString()
      })
      .eq('dataset_name', dataset.table);

    return { success: true, records: records.length };
  } catch (error) {
    await supabase
      .from('pm_ajay_sync_metadata')
      .update({
        last_sync_at: new Date().toISOString(),
        last_sync_status: 'error',
        last_sync_error: error.message,
        updated_at: new Date().toISOString()
      })
      .eq('dataset_name', dataset.table);

    return { success: false, error: error.message };
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const url = new URL(req.url);
    const datasetParam = url.searchParams.get('dataset');

    let datasetsToSync = DATASETS;
    if (datasetParam) {
      const datasetNum = parseInt(datasetParam);
      datasetsToSync = DATASETS.filter(d => d.id === datasetNum);
    }

    const results = [];
    for (const dataset of datasetsToSync) {
      const result = await syncDataset(supabase, dataset);
      results.push({
        dataset: dataset.table,
        ...result
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        results,
        timestamp: new Date().toISOString()
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});