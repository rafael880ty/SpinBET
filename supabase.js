// js/supabase.js
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const SUPABASE_URL = "https://zsroeyriuwxqhgzupgdh.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpzcm9leXJpdXd4cWhnenVwZ2RoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA4Nzg5NjIsImV4cCI6MjA3NjQ1NDk2Mn0.wte4QkFCRusbxvKRwoOJBLWOUZ1fPb-JamlxTpIG5Ow";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
