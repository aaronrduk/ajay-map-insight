import { createClient } from 'npm:@supabase/supabase-js@2';
import { crypto } from 'https://deno.land/std@0.177.0/crypto/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

const BASE_URL = 'https://api.data.gov.in/resource';

const DATASETS = [
  { id: 1, resourceId: '5040b4a2-b2ae-41b9-878d-bf657460fc68', apiKey: '579b464db66ec23bdd000001cdd3946e44ce4aad7209ff7b23ac571b', table: 'pm_ajay_dataset_1' },
  { id: 2, resourceId: 'a915f63d-bc99-47d0-8471-018f6c5c39c2', apiKey: '579b464db66ec23bdd000001edf96157400e4c6d5c24201aa0319738', table: 'pm_ajay_dataset_2' },
  { id: 3, resourceId: '7cff7e60-3cfc-40e2-8ef8-3354ed86dfc0', apiKey: '579b464db66ec23bdd000001edf96157400e4c6d5c24201aa0319738', table: 'pm_ajay_dataset_3' },
  { id: 4, resourceId: 'e349b809-1722-4684-9981-fc8419abe17d', apiKey: '579b464db66ec23bdd000001edf96157400e4c6d5c24201aa0319738', table: 'pm_ajay_dataset_4' },
  { id: 5, resourceId: '3e4319fb-3fe6-4169-9ac5-e2f18b8645e1', apiKey: '579b464db66ec23bdd000001edf96157400e4c6d5c24201aa0319738', table: 'pm_ajay_dataset_5' },
  { id: 6, resourceId: 'f9f2ec91-c75f-4930-9c63-7bfed3c277e7', apiKey: '579b464db66ec23bdd000001edf96157400e4c6d5c24201aa0319738', table: 'pm_ajay_dataset_6' },
  { id: 7, resourceId: 'd1e960e8-4058-4c33-aff8-c37e2189aef0', apiKey: '579b464db66ec23bdd000001edf96157400e4c6d5c24201aa0319738', table: 'pm_ajay_dataset_7' },
  { id: 8, resourceId: '842f4e3f-bb32-450e-8387-45ebf5cda3f2', apiKey: '579b464db66ec23bdd000001edf96157400e4c6d5c24201aa0319738', table: 'pm_ajay_dataset_8' },
  { id: 9, resourceId: '9bdf6219-38a0-4335-8b2c-2385fdae47b3', apiKey: '579b464db66ec23bdd000001edf96157400e4c6d5c24201aa0319738', table: 'pm_ajay_dataset_9' },
  { id: 10, resourceId: 'ca6065cf-8f0c-49b1-bcc8-78faba03c0da', apiKey: '579b464db66ec23bdd000001edf96157400e4c6d5c24201aa0319738', table: 'pm_ajay_dataset_10' },
  { id: 11, resourceId: '8b075576-a48f-44a7-8efa-2399e787c699', apiKey: '579b464db66ec23bdd000001edf96157400e4c6d5c24201aa0319738', table: 'pm_ajay_dataset_11' },
  { id: 12, resourceId: 'd0063c23-5195-4377-9a5d-aa40e15cd486', apiKey: '579b464db66ec23bdd000001edf96157400e4c6d5c24201aa0319738', table: 'pm_ajay_dataset_12' },
  { id: 13, resourceId: 'ecf91f8d-36b1-460d-b856-cb2d42725f47', apiKey: '579b464db66ec23bdd000001edf96157400e4c6d5c24201aa0319738', table: 'pm_ajay_dataset_13' },
  { id: 14, resourceId: 'c4596021-dc87-43e7-84c5-1b6cf01fc9b3', apiKey: '579b464db66ec23bdd000001edf96157400e4c6d5c24201aa0319738', table: 'pm_ajay_dataset_14' },
  { id: 15, resourceId: '0f6c1999-44d0-4ed3-b09d-432f8ca4d79f', apiKey: '579b464db66ec23bdd000001edf96157400e4c6d5c24201aa0319738', table: 'pm_ajay_dataset_15' },
];

async function generateHash(data: any): Promise<string> {
  const encoder = new TextEncoder();
  const dataString = JSON.stringify(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(dataString));
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function fetchDatasetWithRetry(resourceId: string, apiKey: string, retries = 3): Promise<any> {
  for (let i = 0; i < retries; i++) {
    try {
      const url = `${BASE_URL}/${resourceId}?api-key=${apiKey}&format=json&limit=1000`;
      console.log(`Fetching: ${url}`);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`API returned ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Attempt ${i + 1} failed:`, error);
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
}

async function syncDataset(supabase: any, dataset: any) {
  console.log(`Starting sync for ${dataset.table}...`);
  
  try {
    const apiData = await fetchDatasetWithRetry(dataset.resourceId, dataset.apiKey);
    
    if (!apiData || !apiData.records || apiData.records.length === 0) {
      console.log(`No records found for ${dataset.table}`);
      
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

    console.log(`Found ${apiData.records.length} records for ${dataset.table}`);
    
    let insertedCount = 0;
    let skippedCount = 0;
    
    for (let i = 0; i < apiData.records.length; i++) {
      const record = apiData.records[i];
      const recordHash = await generateHash(record);
      
      const recordId = record._id || record.id || `${dataset.resourceId}-${i}`;
      
      const { error } = await supabase
        .from(dataset.table)
        .upsert({
          record_id: recordId,
          data: record,
          record_hash: recordHash,
          synced_at: new Date().toISOString()
        }, { 
          onConflict: 'record_hash',
          ignoreDuplicates: true 
        });

      if (error) {
        if (error.code === '23505') {
          skippedCount++;
        } else {
          console.error(`Error inserting record ${i}:`, error);
        }
      } else {
        insertedCount++;
      }
    }

    console.log(`${dataset.table}: Inserted ${insertedCount}, Skipped ${skippedCount}`);

    await supabase
      .from('pm_ajay_sync_metadata')
      .update({
        last_sync_at: new Date().toISOString(),
        last_sync_status: 'success',
        last_sync_error: null,
        total_records: insertedCount + skippedCount,
        updated_at: new Date().toISOString()
      })
      .eq('dataset_name', dataset.table);

    return { 
      success: true, 
      records: insertedCount + skippedCount,
      inserted: insertedCount,
      skipped: skippedCount
    };
  } catch (error) {
    console.error(`Error syncing ${dataset.table}:`, error);
    
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
      if (datasetNum < 1 || datasetNum > 15) {
        return new Response(
          JSON.stringify({ success: false, error: 'Invalid dataset number. Must be 1-15' }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }
      datasetsToSync = DATASETS.filter(d => d.id === datasetNum);
    }

    console.log(`Syncing ${datasetsToSync.length} dataset(s)...`);

    const results = [];
    for (const dataset of datasetsToSync) {
      const result = await syncDataset(supabase, dataset);
      results.push({
        dataset: dataset.table,
        datasetId: dataset.id,
        ...result
      });
    }

    const successCount = results.filter(r => r.success).length;
    const totalRecords = results.reduce((sum, r) => sum + (r.records || 0), 0);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Synced ${successCount}/${results.length} datasets successfully`,
        totalRecords,
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
    console.error('Sync error:', error);
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