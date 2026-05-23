// Ensure there are absolutely NO hidden spaces or line breaks inside these strings
const SUPABASE_URL = "https://zwqpjedsbapflejitehi.supabase.co"; 

// Double check that your long public token doesn't have accidental spaces at the start or end
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp3cXBqZWRzYmFwZmxlaml0ZWhpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkzNzE0NTcsImV4cCI6MjA5NDk0NzQ1N30.QRvwHzBjgzho9ckk-hlk3xwmeNp1CH4BEBOA-mQt3so"; 

try {
    const configOptions = {
        auth: {
            persistSession: false, // Forces re-authentication
            autoRefreshToken: true,
            detectSessionInUrl: true,
            // Hard-locking storage to memory (sessionStorage)
            storage: typeof window !== 'undefined' ? window.sessionStorage : null
        },
        // Optional: Ensure the client is read-only for certain configurations
        global: {
            headers: { 'x-application-name': 'Mwamini-Secure-Terminal' }
        }
    };

    if (typeof supabase !== 'undefined' && supabase.createClient) {
        window.supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, configOptions);
        
        // SECURITY UPGRADE: Freeze the client object to prevent runtime tampering
        Object.freeze(window.supabase);
    } else if (typeof window.supabaseJS !== 'undefined') {
        window.supabase = window.supabaseJS.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, configOptions);
        Object.freeze(window.supabase);
    }
} catch (e) {
    console.error("Initialization exception:", e);
}
