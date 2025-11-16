import { createClient } from 'npm:@supabase/supabase-js@2';
import { crypto } from 'https://deno.land/std@0.177.0/crypto/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

const COURSES_API_URL = 'https://api.data.gov.in/resource/a915f63d-bc99-47d0-8471-018f6c5c39c2';
const COLLEGES_API_URL = 'https://api.data.gov.in/resource/7cff7e60-3cfc-40e2-8ef8-3354ed86dfc0';
const API_KEY = '579b464db66ec23bdd000001edf96157400e4c6d5c24201aa0319738';

async function generateHash(data: any): Promise<string> {
  const encoder = new TextEncoder();
  const dataString = JSON.stringify(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(dataString));
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function fetchWithRetry(url: string, retries = 3): Promise<any> {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error(`Attempt ${i + 1} failed:`, error);
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
}

async function syncCourses(supabase: any) {
  console.log('Syncing courses...');
  const url = `${COURSES_API_URL}?api-key=${API_KEY}&format=json&limit=1000`;
  const data = await fetchWithRetry(url);
  
  if (!data?.records || data.records.length === 0) {
    return { success: true, count: 0, message: 'No courses found' };
  }

  let inserted = 0;
  let skipped = 0;

  for (const record of data.records) {
    const hash = await generateHash(record);
    const courseId = record.course_id || record.id || `course-${hash.substring(0, 8)}`;
    
    const { error } = await supabase
      .from('courses')
      .upsert({
        course_id: courseId,
        course_name: record.course_name || record.name || 'Unknown Course',
        component: record.component || 'General',
        description: record.description || null,
        duration: record.duration || null,
        eligibility: record.eligibility || null,
        source_data: record,
        record_hash: hash,
        last_synced_at: new Date().toISOString()
      }, { 
        onConflict: 'course_id',
        ignoreDuplicates: false 
      });

    if (error) {
      console.error('Error upserting course:', error);
      skipped++;
    } else {
      inserted++;
    }
  }

  await supabase
    .from('sync_metadata')
    .upsert({
      resource_id: 'courses',
      last_synced_at: new Date().toISOString(),
      row_count: inserted,
      status: 'success',
      error_message: null
    }, { onConflict: 'resource_id' });

  return { success: true, count: inserted, skipped };
}

async function syncColleges(supabase: any) {
  console.log('Syncing colleges...');
  const url = `${COLLEGES_API_URL}?api-key=${API_KEY}&format=json&limit=1000`;
  const data = await fetchWithRetry(url);
  
  if (!data?.records || data.records.length === 0) {
    return { success: true, count: 0, message: 'No colleges found' };
  }

  let inserted = 0;
  let skipped = 0;

  for (const record of data.records) {
    const hash = await generateHash(record);
    const collegeId = record.college_id || record.id || `college-${hash.substring(0, 8)}`;
    
    const { error } = await supabase
      .from('colleges')
      .upsert({
        college_id: collegeId,
        name: record.name || record.college_name || 'Unknown College',
        state: record.state || 'Unknown',
        district: record.district || 'Unknown',
        type: record.type || 'General',
        address: record.address || null,
        contact: record.contact || null,
        source_data: record,
        record_hash: hash,
        last_synced_at: new Date().toISOString()
      }, { 
        onConflict: 'college_id',
        ignoreDuplicates: false 
      });

    if (error) {
      console.error('Error upserting college:', error);
      skipped++;
    } else {
      inserted++;
    }
  }

  await supabase
    .from('sync_metadata')
    .upsert({
      resource_id: 'colleges',
      last_synced_at: new Date().toISOString(),
      row_count: inserted,
      status: 'success',
      error_message: null
    }, { onConflict: 'resource_id' });

  return { success: true, count: inserted, skipped };
}

async function syncCourseCollegeMapping(supabase: any) {
  console.log('Syncing course-college mappings...');
  
  const { data: courses } = await supabase.from('courses').select('id, course_id');
  const { data: colleges } = await supabase.from('colleges').select('id, college_id, source_data');
  
  if (!courses || !colleges) {
    return { success: true, count: 0, message: 'No data to map' };
  }

  let inserted = 0;

  for (const college of colleges) {
    const sourceData = college.source_data || {};
    const offeredCourses = sourceData.courses || sourceData.offered_courses || [];
    
    if (Array.isArray(offeredCourses)) {
      for (const courseName of offeredCourses) {
        const course = courses.find(c => 
          c.course_id.includes(courseName) || 
          (c.source_data?.course_name || '').includes(courseName)
        );
        
        if (course) {
          const { error } = await supabase
            .from('college_courses')
            .upsert({
              college_id: college.id,
              course_id: course.id,
              available: true
            }, { 
              onConflict: 'college_id,course_id',
              ignoreDuplicates: true 
            });

          if (!error) inserted++;
        }
      }
    }
  }

  return { success: true, count: inserted };
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const coursesResult = await syncCourses(supabase);
    const collegesResult = await syncColleges(supabase);
    const mappingResult = await syncCourseCollegeMapping(supabase);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Sync completed successfully',
        results: {
          courses: coursesResult,
          colleges: collegesResult,
          mappings: mappingResult
        },
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