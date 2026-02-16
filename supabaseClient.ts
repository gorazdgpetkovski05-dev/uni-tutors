
import { createClient } from '@supabase/supabase-js';

// Credentials provided by the user
const supabaseUrl = 'https://ahdlaicprbojzoteccyb.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFoZGxhaWNwcmJvanpvdGVjY3liIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzExNTU0NTYsImV4cCI6MjA4NjczMTQ1Nn0.rXTMQq3hLlJRSeCXOr0ff9lkiQlqmA8qPDDgLc66388';

// Export the client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper to check if we are in real mode
export const isSupabaseConfigured = () => true;
