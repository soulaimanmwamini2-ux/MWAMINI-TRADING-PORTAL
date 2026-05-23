// Ensure there are absolutely NO hidden spaces or line breaks inside these strings
const SUPABASE_URL = "https://zwqpjedsbapflejitehi.supabase.co"; 

// Double check that your long public token doesn't have accidental spaces at the start or end
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp3cXBqZWRzYmFwZmxlaml0ZWhpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkzNzE0NTcsImV4cCI6MjA5NDk0NzQ1N30.QRvwHzBjgzho9ckk-hlk3xwmeNp1CH4BEBOA-mQt3so"; 

try {
    const configOptions = {
        auth: {
            // UPGRADED: Set to false to disable session persistence.
            // This forces the user to log in every time they open the page.
            persistSession: false, 
            autoRefreshToken: true,
            detectSessionInUrl: true,
            // Added storage protection to prevent browser cache leaks
            storage: typeof window !== 'undefined' ? window.sessionStorage : null
        }
    };

    if (typeof supabase !== 'undefined' && supabase.createClient) {
        window.supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, configOptions);
    } else if (typeof window.supabaseJS !== 'undefined') {
        window.supabase = window.supabaseJS.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, configOptions);
    }
} catch (e) {
    console.error("Initialization exception:", e);
}
