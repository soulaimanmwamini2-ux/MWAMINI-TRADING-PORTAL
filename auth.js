document.addEventListener("DOMContentLoaded", async () => {
    // UI Elements
    const gatekeeperStep = document.getElementById("gatekeeper-step"); // Popup Screen Verification
    const loginForm = document.getElementById("login-form");          // Admin Verification Dashboard
    const errorMsg = document.getElementById("error-msg");
    const verifyKeyBtn = document.getElementById("verify-key-btn");
    const accessKeyInput = document.getElementById("access-key");

    /**
     * SYSTEM OVERSEER: Global Security Sanitization
     * Ensures no "ghost" sessions remain in the browser memory.
     */
    const performSystemPurge = async () => {
        if (window.supabase) {
            await window.supabase.auth.signOut();
            sessionStorage.clear();
            localStorage.clear();
        }
    };

    // Initialize: Purge on any entry to the secure login environment
    if (window.location.pathname.includes("login.html")) {
        await performSystemPurge();
    }

    /**
     * SCREEN 1: Popup Screen Verification
     * The first "Gateway" for Mwamini Portal access.
     */
    if (verifyKeyBtn) {
        verifyKeyBtn.addEventListener("click", () => {
            const key = accessKeyInput.value.trim();
            if (key === "Password@654321") {
                // Transition to Admin Verification Dashboard
                gatekeeperStep.style.display = "none";
                loginForm.style.display = "block";
                accessKeyInput.value = ""; 
                if (errorMsg) errorMsg.innerText = "";
            } else {
                errorMsg.innerText = "Access Denied: Security Key Mismatch.";
                errorMsg.style.color = "#ef4444";
            }
        });
    }

    /**
     * SCREEN 2: Admin Verification Dashboard
     * Official authentication via Supabase.
     */
    if (loginForm) {
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            errorMsg.innerText = "Authenticating credentials...";
            errorMsg.style.color = "#2563eb";

            const email = loginForm.querySelector("input[type='email']").value.trim();
            const password = loginForm.querySelector("input[type='password']").value;

            try {
                const { data, error } = await window.supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
                
                errorMsg.innerText = "Access verified. Initializing System Overseer...";
                errorMsg.style.color = "#10b981";
                
                setTimeout(() => window.location.replace("admin.html"), 1000);
            } catch (err) {
                errorMsg.innerText = `Auth Failed: ${err.message}`;
                errorMsg.style.color = "#ef4444";
            }
        });
    }

    /**
     * DASHBOARD 3 & 4: Admin System Overseer
     * Validates session for the high-privilege dashboard.
     */
    if (window.location.pathname.includes("admin.html")) {
        const validateSession = async () => {
            if (!window.supabase) return;
            const { data: { session } } = await window.supabase.auth.getSession();
            if (!session) window.location.replace("login.html");
        };
        validateSession();

        // Admin Logout: Full System Reset
        document.getElementById("logout-btn")?.addEventListener("click", async () => {
            await performSystemPurge();
            window.location.replace("login.html");
        });
    }
});
