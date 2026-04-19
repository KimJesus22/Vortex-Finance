import { createClient } from '@insforge/sdk';

const insforgeUrl = process.env.NEXT_PUBLIC_INSFORGE_URL || 'https://ea895pss.us-east.insforge.app';
const insforgeAnonKey = process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3OC0xMjM0LTU2NzgtOTBhYi1jZGVmMTIzNDU2NzgiLCJlbWFpbCI6ImFub25AaW5zZm9yZ2UuY29tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY2MjMxMjR9.N5-WfNVZK5GXHMifh7w68f7hn3vOtL7zzfKYJK_5qLU';

export const insforge = createClient({
  baseUrl: insforgeUrl,
  anonKey: insforgeAnonKey,
});
