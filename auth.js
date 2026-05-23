document.addEventListener("DOMContentLoaded", async () => {
    // --- HIGH-SECURITY GATEKEEPER LOGIC ---
    const gatekeeperStep = document.getElementById("gatekeeper-step");
    const loginForm = document.getElementById("login-form") || document.querySelector("form");
    const errorMsg = document.getElementById("error-msg");
    const verifyKeyBtn = document.getElementById("verify-key-btn");
    const accessKeyInput = document.getElementById("access-key");

    // FORCE CLEANUP: Ensure no stale session exists on page load
    if (window.supabase) {
        await window.supabase.auth.signOut();
        localStorage.clear();
        sessionStorage.clear();
    }

    if (verifyKeyBtn) {
        verifyKeyBtn.addEventListener("click", () => {
            const key = accessKeyInput.value.trim();
            if (key === "Password@654321") {
                gatekeeperStep.style.display = "none";
                loginForm.style.display = "block";
                accessKeyInput.value = ""; // Scrub key from memory
                if (errorMsg) errorMsg.innerText = "";
            } else {
                if (errorMsg) {
                    errorMsg.style.color = "#ef4444";
                    errorMsg.innerText = "Security violation: Invalid access key.";
                }
            }
        });
    }

    // --- ENHANCED AUTH LOGIC ---
    if (loginForm) {
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            
            if (errorMsg) {
                errorMsg.style.color = "#2563eb";
                errorMsg.innerText = "Establishing secure handshake...";
            }

            if (!window.supabase || typeof window.supabase.auth === 'undefined') {
                if (errorMsg) {
                    errorMsg.style.color = "#ef4444";
                    errorMsg.innerText = "System Error: Authentication client unreachable.";
                }
                return;
            }

            const emailInput = loginForm.querySelector("input[type='email']");
            const passwordInput = loginForm.querySelector("input[type='password']");

            const email = emailInput.value.trim();
            const password = passwordInput.value;

            try {
                const { data, error } = await window.supabase.auth.signInWithPassword({
                    email: email,
                    password: password
                });

                if (error) {
                    if (errorMsg) {
                        errorMsg.style.color = "#ef4444";
                        errorMsg.innerText = `Auth Fail: ${error.message}`;
                    }
                } else if (data?.user) {
                    if (errorMsg) {
                        errorMsg.style.color = "#10b981";
                        errorMsg.innerText = "Credentials verified. Initializing session...";
                    }
                    setTimeout(() => {
                        window.location.replace("admin.html");
                    }, 800);
                }
            } catch (err) {
                if (errorMsg) {
                    errorMsg.style.color = "#ef4444";
                    errorMsg.innerText = "Secure connection failed.";
                }
            }
        });
    }

    // --- SECURE SESSION VERIFICATION ---
    if (window.location.pathname.includes("admin.html")) {
        const verifySession = async () => {
            if (!window.supabase) return;
            const { data: { session } } = await window.supabase.auth.getSession();
            if (!session) {
                window.location.replace("login.html");
            }
        };
        verifySession();

        document.getElementById("logout-btn")?.addEventListener("click", async () => {
            if (window.supabase) {
                await window.supabase.auth.signOut();
                localStorage.clear();
                sessionStorage.clear();
                window.location.replace("login.html");
            }
        });
    }
});
