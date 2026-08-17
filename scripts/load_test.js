import http from 'k6/http';
import { check, sleep } from 'k6';

// Test configuration
export const options = {
  // Define stages for ramping up and down Virtual Users (VUs)
  stages: [
    { duration: '30s', target: 20 },  // Ramp-up to 20 users over 30 seconds
    { duration: '1m', target: 20 },   // Stay at 20 users for 1 minute
    { duration: '30s', target: 50 },  // Spike to 50 users over 30 seconds
    { duration: '1m', target: 50 },   // Stay at 50 users for 1 minute
    { duration: '30s', target: 0 },   // Ramp-down to 0 users over 30 seconds
  ],
  
  // Define thresholds to ensure performance goals are met
  thresholds: {
    // 95% of requests must complete below 500ms
    http_req_duration: ['p(95)<500'],
    // 99% of requests must complete below 1000ms
    'http_req_duration{staticAsset:yes}': ['p(99)<1000'],
    // Error rate must be less than 1%
    http_req_failed: ['rate<0.01'],
  },
};

// Base URL of your backend. Replace this with your actual Supabase project URL.
const BASE_URL = 'https://YOUR_SUPABASE_PROJECT_REF.supabase.co';
// Replace with your anon or service role key if testing authenticated endpoints
const SUPABASE_KEY = 'YOUR_SUPABASE_ANON_KEY';

export default function () {
  // Example 1: Testing a Supabase Edge Function
  const edgeFunctionRes = http.post(
    `${BASE_URL}/functions/v1/symptom-chat`, 
    JSON.stringify({ query: 'headache' }),
    {
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_KEY}`
      },
    }
  );

  // Validate the response
  check(edgeFunctionRes, {
    'Edge function status is 200': (r) => r.status === 200,
    'Edge function responded quickly (< 800ms)': (r) => r.timings.duration < 800,
  });

  // Optional: Simulate user wait time between requests (think time)
  sleep(1);

  // Example 2: Testing a Supabase REST API endpoint (Database Table query)
  // Assuming you have a 'profiles' or 'scheme_checks' table
  const dbQueryRes = http.get(`${BASE_URL}/rest/v1/scheme_checks?select=*&limit=10`, {
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`
    }
  });

  check(dbQueryRes, {
    'DB query status is 200': (r) => r.status === 200,
    'DB query responded quickly (< 300ms)': (r) => r.timings.duration < 300,
  });

  sleep(1);
}
