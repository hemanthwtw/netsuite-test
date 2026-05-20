/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(["N/https", "N/url", "N/log", "N/redirect", "N/file", "N/email", "N/search", "N/record", "N/crypto"], function (
    https,
    url,
    log,
    redirect,
    file,
    email,
    search,
    record,
    crypto
) {
    function onRequest(context) {
        function safeParseJSON(str) {
            try {
                return str ? JSON.parse(str) : {};
            } catch (error) {
                log.error("JSON Parse Error", "Failed to parse response: " + str);
                return {};
            }
        }

        function parseBoolean(value) {
            return value === true || value === "true" || value === "TRUE" || value === "1";
        }

        function hasRoleValue(value, expectedRole) {
            if (Array.isArray(value)) {
                return value.indexOf(expectedRole) !== -1 || value.indexOf(Number(expectedRole)) !== -1;
            }
            return String(value || "") === String(expectedRole);
        }

        // ============================================================
        //  SHARED AUTH (LOGIN / VERIFY) — Split-screen modern design
        // ============================================================
        var authSharedCSS = `
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
            
            :root {
                --brand-primary: #0F2A47;
                --brand-primary-dark: #0A1E34;
                --brand-primary-soft: #1B3A60;
                --brand-accent: #C9A24B;
                --brand-accent-dark: #B08A36;
                --brand-bg: #F4F6FA;
                --brand-surface: #FFFFFF;
                --brand-text: #1F2A37;
                --brand-muted: #6B7280;
                --brand-border: #E5E9F0;
            }

            * {
                box-sizing: border-box;
                margin: 0;
                padding: 0;
            }

            html, body {
                margin: 0;
                padding: 0;
                -webkit-font-smoothing: antialiased;
            }

            body {
                font-family: 'Inter', system-ui, sans-serif;
                min-height: 100vh;
                background: #fff;
                color: var(--brand-text);
                overflow-x: hidden;
            }

            .login-root {
                min-height: 100vh;
                display: flex;
                align-items: stretch;
            }

            /* LEFT PANEL */
            .left-panel {
                flex: 1;
                min-width: 360px;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 4rem 3rem;
                background: linear-gradient(135deg, var(--brand-primary-dark) 0%, var(--brand-primary) 45%, var(--brand-primary-soft) 90%);
                color: #ffffff;
                position: relative;
                overflow: hidden;
            }

            .left-panel::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: radial-gradient(ellipse 650px 650px at 25% 25%, rgba(255,255,255,0.15) 0%, transparent 55%);
                pointer-events: none;
            }

            .left-content {
                position: relative;
                z-index: 2;
                display: flex;
                flex-direction: column;
                align-items: flex-start;
                justify-content: center;
                gap: 1rem;
                max-width: 420px;
                width: 100%;
            }

            .brand-welcome {
                font-size: 1rem;
                letter-spacing: 0.3em;
                text-transform: uppercase;
                color: rgba(255, 255, 255, 0.72);
                font-weight: 700;
                margin-bottom: 0.5rem;
            }

            .brand-title {
                font-size: clamp(3.8rem, 5vw, 5.5rem);
                line-height: 0.95;
                font-weight: 800;
                letter-spacing: -0.06em;
                margin: 0;
                color: #ffffff;
            }

            .brand-copy {
                display: flex;
                flex-direction: column;
                gap: 0.8rem;
            }

            .left-note {
                font-size: 1rem;
                color: rgba(255, 255, 255, 0.8);
                line-height: 1.7;
                max-width: 340px;
            }

            .shape-1,
            .shape-2,
            .shape-3 {
                position: absolute;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.12);
                pointer-events: none;
            }

            .shape-1 {
                width: 260px;
                height: 260px;
                top: 10%;
                right: 10%;
                filter: blur(1px);
                animation: moveShape1 10s ease-in-out infinite;
            }

            .shape-2 {
                width: 200px;
                height: 200px;
                bottom: 15%;
                left: 8%;
                opacity: 0.55;
                animation: moveShape2 12s ease-in-out infinite;
            }

            .shape-3 {
                width: 140px;
                height: 140px;
                top: 50%;
                right: 5%;
                opacity: 0.36;
                animation: moveShape3 14s ease-in-out infinite;
            }

            @keyframes moveShape1 {
                0%, 100% { transform: translate(0, 0) scale(1); }
                50% { transform: translate(-14px, 10px) scale(1.05); }
            }

            @keyframes moveShape2 {
                0%, 100% { transform: translate(0, 0) scale(1); }
                50% { transform: translate(18px, -14px) scale(0.96); }
            }

            @keyframes moveShape3 {
                0%, 100% { transform: translate(0, 0) scale(1); }
                50% { transform: translate(-12px, -16px) scale(1.04); }
            }

            /* RIGHT PANEL */
            .right-panel {
                flex: 1;
                min-width: 360px;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 3rem 2rem;
                background: #f4f7fb;
            }

            .card {
                width: 100%;
                max-width: 420px;
                background: #ffffff;
                border-radius: 28px;
                box-shadow: 0 34px 90px rgba(15, 23, 42, 0.12);
                overflow: hidden;
                border: 1px solid rgba(15, 23, 42, 0.06);
            }

            .card-header {
                padding: 1.6rem 1.8rem;
                background: linear-gradient(135deg, var(--brand-primary), var(--brand-primary-soft));
                color: #ffffff;
                font-size: 0.95rem;
                font-weight: 700;
                letter-spacing: 0.26em;
                text-transform: uppercase;
                text-align: center;
            }

            .card-body {
                padding: 2rem 2rem 2.5rem;
            }

            .form-title {
                font-size: 1.75rem;
                font-weight: 700;
                color: var(--brand-primary);
                margin-bottom: 0.6rem;
                text-align: center;
            }

            .divider {
                width: 52px;
                height: 4px;
                margin: 0 auto 1.8rem;
                border-radius: 999px;
                background: linear-gradient(135deg, var(--brand-accent-dark), var(--brand-accent));
            }

            .input-wrapper {
                position: relative;
            }

            .field-input {
                width: 100%;
                padding: 1rem 1.1rem 1rem 3.6rem;
                border: 2px solid var(--brand-border);
                border-radius: 14px;
                font-size: 1rem;
                color: var(--brand-text);
                background: #f8fafc;
                outline: none;
                transition: all 0.25s ease;
            }

            .input-icon {
                position: absolute;
                left: 1rem;
                top: 50%;
                transform: translateY(-50%);
                width: 20px;
                height: 20px;
                color: var(--brand-muted);
                display: flex;
                align-items: center;
                justify-content: center;
                pointer-events: none;
            }

            .right-panel::before {
                content: '';
                position: absolute;
                top: -2px;
                left: 0;
                right: 0;
                height: 200px;
                background: radial-gradient(ellipse 800px 200px at center top, rgba(25, 118, 210, 0.08) 0%, transparent 70%);
                pointer-events: none;
            }

            .form-container {
                width: 100%;
                max-width: 400px;
                position: relative;
                z-index: 1;
                display: none;
            }

            .form-container.is-active {
                display: block;
            }

            .fade-in {
                animation: fadeSlideIn 0.5s cubic-bezier(0.22, 1, 0.36, 1) both;
            }

            @keyframes fadeSlideIn {
                from {
                    opacity: 0;
                    transform: translateY(24px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }

            .form-header {
                text-align: center;
                margin-bottom: 2.2rem;
            }

            .form-subtitle {
                font-size: 0.95rem;
                color: var(--brand-muted);
                line-height: 1.6;
            }

            .form-subtitle strong {
                color: var(--brand-accent-dark);
                font-weight: 600;
            }

            /* FIELDS */
            .field-group {
                display: flex;
                flex-direction: column;
                gap: 0.6rem;
                margin-bottom: 1.8rem;
            }

            .field-label {
                font-size: 0.85rem;
                font-weight: 600;
                color: var(--brand-primary);
                letter-spacing: 0.02em;
                text-transform: uppercase;
                text-align: left;
            }

            .field-input {
                width: 100%;
                padding: 1rem 1.1rem;
                border: 2px solid var(--brand-border);
                border-radius: 14px;
                font-size: 0.96rem;
                color: var(--brand-text);
                background: rgba(255, 255, 255, 0.7);
                backdrop-filter: blur(8px);
                outline: none;
                transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);
                position: relative;
                z-index: 1;
            }

            .field-input::placeholder {
                color: #cbd5e1;
            }

            .field-input:focus {
                border-color: var(--brand-accent);
                background: rgba(255, 255, 255, 0.95);
                box-shadow: 0 0 0 5px rgba(201, 162, 75, 0.12);
                transform: translateY(-1px);
            }

            .field-input.field-input--error {
                border-color: #ef4444;
                box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.1);
            }

            .input-bg {
                position: absolute;
                inset: 0;
                border-radius: 14px;
                background: linear-gradient(135deg, rgba(201, 162, 75, 0.08), rgba(201, 162, 75, 0.04));
                pointer-events: none;
                opacity: 0;
                transition: opacity 0.3s ease;
            }

            .field-input:focus ~ .input-bg {
                opacity: 1;
            }

            .field-error {
                font-size: 0.8rem;
                color: #ef4444;
                font-weight: 600;
                margin-top: 0.2rem;
                animation: slideDown 0.3s cubic-bezier(0.22, 1, 0.36, 1);
                text-align: left;
            }

            @keyframes slideDown {
                from {
                    opacity: 0;
                    transform: translateY(-8px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }

            /* BUTTON */
            .btn-primary {
                width: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 0.65rem;
                padding: 1rem 1.4rem;
                background: linear-gradient(135deg, var(--brand-accent), var(--brand-accent-dark));
                border: 2px solid transparent;
                border-radius: 14px;
                color: #fff;
                font-size: 0.97rem;
                font-weight: 700;
                cursor: pointer;
                transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);
                position: relative;
                overflow: hidden;
            }

            .btn-primary::before {
                content: '';
                position: absolute;
                top: 0;
                left: -100%;
                width: 100%;
                height: 100%;
                background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
                transition: left 0.5s ease;
            }

            .btn-primary:hover:not(.loading) {
                transform: translateY(-3px);
                box-shadow: 0 12px 32px rgba(201, 162, 75, 0.32), 0 0 0 4px rgba(201, 162, 75, 0.12);
            }

            .btn-primary:hover:not(.loading)::before {
                left: 100%;
            }

            .btn-primary:active:not(.loading) {
                transform: translateY(-1px);
            }

            .btn-primary.loading {
                background: linear-gradient(135deg, var(--brand-accent-dark), var(--brand-accent));
                cursor: not-allowed;
            }

            .btn-icon {
                transition: transform 0.3s cubic-bezier(0.22, 1, 0.36, 1);
            }

            .btn-primary:hover:not(.loading) .btn-icon {
                transform: translateX(4px);
            }

            .spinner {
                display: inline-block;
                width: 16px;
                height: 16px;
                border: 2.5px solid rgba(255, 255, 255, 0.3);
                border-top-color: #fff;
                border-radius: 50%;
                animation: spin 0.8s linear infinite;
                margin-right: 0.5rem;
            }

            @keyframes spin {
                to { transform: rotate(360deg); }
            }

            /* OTP */
            .otp-icon {
                width: 56px;
                height: 56px;
                border-radius: 50%;
                background: linear-gradient(135deg, rgba(201, 162, 75, 0.15), rgba(201, 162, 75, 0.08));
                display: flex;
                align-items: center;
                justify-content: center;
                color: var(--brand-accent);
                margin: 0 auto 1.2rem;
                animation: scaleIn 0.5s cubic-bezier(0.22, 1, 0.36, 1);
            }

            @keyframes scaleIn {
                from {
                    opacity: 0;
                    transform: scale(0.5);
                }
                to {
                    opacity: 1;
                    transform: scale(1);
                }
            }

            .otp-group {
                display: flex;
                gap: 0.75rem;
                margin-bottom: 1.8rem;
                justify-content: center;
            }

            .otp-wrapper {
                position: relative;
            }

            .otp-input {
                width: 68px;
                height: 68px;
                text-align: center;
                font-size: 1.6rem;
                font-weight: 700;
                color: var(--brand-text);
                border: 2px solid var(--brand-border);
                border-radius: 14px;
                background: rgba(255, 255, 255, 0.8);
                backdrop-filter: blur(8px);
                outline: none;
                transition: all 0.25s cubic-bezier(0.22, 1, 0.36, 1);
                caret-color: var(--brand-accent);
            }

            .otp-input:focus {
                border-color: var(--brand-accent);
                background: #fff;
                box-shadow: 0 0 0 5px rgba(201, 162, 75, 0.12), 0 8px 20px rgba(201, 162, 75, 0.15);
                transform: scale(1.08) translateY(-2px);
            }

            .otp-input.otp-input--filled {
                border-color: var(--brand-accent);
                background: linear-gradient(135deg, #fffbf0 0%, #fdfbf7 100%);
                color: var(--brand-accent);
                font-weight: 800;
                animation: popIn 0.3s cubic-bezier(0.22, 1, 0.36, 1);
            }

            @keyframes popIn {
                0% {
                    opacity: 0;
                    transform: scale(0.7);
                }
                60% {
                    transform: scale(1.12);
                }
                100% {
                    opacity: 1;
                    transform: scale(1);
                }
            }

            .verifying-text {
                text-align: center;
                font-size: 0.85rem;
                color: var(--brand-accent);
                font-weight: 600;
                animation: fadeIn 0.3s ease;
                margin-bottom: 1rem;
            }

            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }

            /* RESEND */
            .resend-text {
                font-size: 0.88rem;
                color: var(--brand-muted);
                text-align: center;
                margin-top: 0.5rem;
            }

            .resend-btn {
                background: none;
                border: none;
                color: var(--brand-accent);
                font-size: 0.88rem;
                font-weight: 700;
                cursor: pointer;
                padding: 0;
                text-decoration: none;
                transition: all 0.2s ease;
                position: relative;
            }

            .resend-btn::after {
                content: '';
                position: absolute;
                bottom: -2px;
                left: 0;
                right: 0;
                height: 2px;
                background: var(--brand-accent);
                transform: scaleX(0);
                transition: transform 0.3s cubic-bezier(0.22, 1, 0.36, 1);
            }

            .resend-btn:hover::after {
                transform: scaleX(1);
            }

            /* BACK BUTTON */
            .back-btn {
                background: none;
                border: none;
                color: var(--brand-muted);
                font-size: 0.87rem;
                font-weight: 600;
                cursor: pointer;
                padding: 0.6rem 0;
                margin-bottom: 1.5rem;
                transition: all 0.2s ease;
                display: inline-flex;
                align-items: center;
            }

            .back-btn:hover {
                color: var(--brand-accent);
                transform: translateX(-2px);
            }

            /* VERIFIED */
            .verified-container {
                text-align: center;
            }

            .success-icon {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                width: 80px;
                height: 80px;
                border-radius: 50%;
                background: linear-gradient(135deg, #d1fae5 0%, #c7f0d8 100%);
                color: #059669;
                margin-bottom: 1.5rem;
                animation: celebrateScale 0.6s cubic-bezier(0.22, 1, 0.36, 1);
            }

            @keyframes celebrateScale {
                0% {
                    opacity: 0;
                    transform: scale(0.3) rotate(-30deg);
                }
                60% {
                    transform: scale(1.15) rotate(5deg);
                }
                100% {
                    opacity: 1;
                    transform: scale(1) rotate(0deg);
                }
            }

            .success-title {
                color: #059669;
                margin-bottom: 0.5rem;
            }

            .success-sub {
                color: var(--brand-muted);
                margin-bottom: 1.5rem;
            }

            .progress-bar {
                width: 100%;
                height: 3px;
                background: var(--brand-border);
                border-radius: 2px;
                overflow: hidden;
            }

            .progress-fill {
                height: 100%;
                background: linear-gradient(90deg, var(--brand-accent), var(--brand-accent-dark));
                animation: progressFill 2s cubic-bezier(0.22, 1, 0.36, 1);
            }

            @keyframes progressFill {
                from { width: 0; }
                to { width: 100%; }
            }

            .footer-text {
                font-size: 0.8rem;
                color: #94a3b8;
                text-align: center;
                margin-top: 1.5rem;
                letter-spacing: 0.02em;
            }

            /* ERROR MODAL */
            .error-modal-backdrop {
                position: fixed; inset: 0;
                background: rgba(15,42,71,0.55);
                z-index: 9999; display: flex; align-items: center; justify-content: center;
            }
            .error-modal {
                background: #fff; border-radius: 14px; overflow: hidden;
                width: 92%; max-width: 380px;
                box-shadow: 0 30px 60px -20px rgba(15,42,71,0.35);
            }
            .error-modal .em-head {
                background: linear-gradient(135deg, var(--brand-primary), var(--brand-primary-soft));
                color: #fff; padding: 14px 20px; font-weight: 600; letter-spacing: 0.4px;
            }
            .error-modal .em-body {
                padding: 22px; text-align: center;
            }
            .error-modal .em-body .em-icon {
                color: #DC3545; font-size: 40px; margin-bottom: 10px;
            }
            .error-modal .em-body p {
                margin: 6px 0 0; color: var(--brand-text); font-weight: 500;
            }
            .error-modal .em-foot {
                display: flex; justify-content: center; padding: 0 22px 22px;
            }
            .error-modal .em-foot button {
                background: linear-gradient(135deg, var(--brand-primary), var(--brand-primary-soft));
                color: #fff; border: none; border-radius: 999px;
                padding: 9px 22px; font-weight: 600; cursor: pointer;
            }

            /* RESPONSIVE */
            @media (max-width: 1024px) {
                .left-panel { padding: 2rem; }
                .right-panel { width: 460px; }
            }

            @media (max-width: 768px) {
                .login-root { flex-direction: column; }
                .left-panel {
                    width: 100%;
                    padding: 2rem;
                    min-height: 200px;
                }
                .right-panel {
                    width: 100%;
                    padding: 2.5rem 1.5rem;
                    min-height: 500px;
                }
                .brand-title { font-size: clamp(2rem, 4vw, 3rem); }
                .shape-1 { width: 200px; height: 200px; }
                .shape-2 { width: 130px; height: 130px; }
                .shape-3 { width: 100px; height: 100px; }
                .form-title { font-size: 1.5rem; }
            }
        `;

        var loginPage = () => {
            return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>TRACKnow — Sign in</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>${authSharedCSS}</style>
</head>
<body>
    <div class="login-root">
        <div class="left-panel">
            <div class="left-content">
                <div class="brand-copy">
                    <span class="brand-welcome">Welcome to</span>
                    <h1 class="brand-title">TRACKNOW</h1>
                </div>
                <p class="left-note">Secure access for SMTR Supervisors with streamlined OTP authentication.</p>
                <div class="shape shape-1"></div>
                <div class="shape shape-2"></div>
                <div class="shape shape-3"></div>
            </div>
        </div>

        <div class="right-panel">
            <div class="card">
                <div class="card-header">TRACKNOW</div>
                <div class="card-body">
                    <form id="login-form" method="POST" novalidate>
                        <div class="form-container fade-in is-active" id="step-email">
                            <div class="form-header">
                                <h1 class="form-title">SMTR Supervisor</h1>
                                <div class="divider"></div>
                                <p class="form-subtitle">Enter your email to receive your one-time passcode.</p>
                            </div>

                            <div class="field-group">
                                <label for="vendorEmail" class="field-label">Email</label>
                                <div class="input-wrapper">
                                    <span class="input-icon" aria-hidden="true">
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                            <path d="M4 4h16v16H4z"></path>
                                            <polyline points="22,6 12,13 2,6"></polyline>
                                        </svg>
                                    </span>
                                    <input
                                        id="vendorEmail"
                                        name="vendorEmail"
                                        type="email"
                                        class="field-input"
                                        placeholder="Enter your email"
                                        autocomplete="email"
                                        autofocus
                                        required
                                    />
                                </div>
                                <span class="field-error" id="email-error" style="display: none;"></span>
                            </div>

                            <button type="submit" class="btn-primary" name="get_otp" value="get_otp" id="btn-continue">
                                <span>Get OTP</span>
                                <svg class="btn-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                    <line x1="5" y1="12" x2="19" y2="12"></line>
                                    <polyline points="12 5 19 12 12 19"></polyline>
                                </svg>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
    <script>
        document.addEventListener("DOMContentLoaded", function() {
            const loginForm = document.querySelector("#login-form");
            loginForm.addEventListener("submit", function() {
                localStorage.setItem("tracknow_smtr_logged_in", "true");
            });
        });
    </script>
</body>
</html>`;
        };

        var verifyPage = (requestorId, email, smtrAccess, smtrSupervisorRoleAcess, errorMessage = "") => {
            var modalHtml = errorMessage
                ? `<div class="error-modal-backdrop" id="otpErrorModal">
                        <div class="error-modal">
                            <div class="em-head"><i class="bi bi-shield-exclamation"></i>&nbsp; Verification Failed</div>
                            <div class="em-body">
                                <div class="em-icon"><i class="bi bi-x-circle-fill"></i></div>
                                <p>${errorMessage}</p>
                            </div>
                            <div class="em-foot">
                                <button type="button" onclick="document.getElementById('otpErrorModal').remove()">OK</button>
                            </div>
                        </div>
                   </div>`
                : "";

            return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>TRACKnow — Verify OTP</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>${authSharedCSS}</style>
</head>
<body>
    ${modalHtml}
    <div class="login-root">
        <div class="left-panel">
            <div class="left-content">
                <div class="brand-copy">
                    <span class="brand-welcome">Welcome to</span>
                    <h1 class="brand-title">TRACKNOW</h1>
                </div>
                <p class="left-note">Secure access for SMTR Supervisors with streamlined OTP authentication.</p>
                <div class="shape shape-1"></div>
                <div class="shape shape-2"></div>
                <div class="shape shape-3"></div>
            </div>
        </div>

        <div class="right-panel">
            <div class="card">
                <div class="card-header">TRACKNOW</div>
                <div class="card-body">
                    <form id="verify-form" method="POST" novalidate>
                       
                        
                        <div class="form-container fade-in is-active" id="step-otp">
                            <div class="form-header">
                                <div class="otp-icon">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                                    </svg>
                                </div>
                                <h1 class="form-title">SMTR Supervisor</h1>
                                <div class="divider"></div>
                                <p class="form-subtitle">Enter the 4-digit code sent to<br /><strong id="otp-email-display">${email || 'your email'}</strong></p>
                            </div>

                            <input type="hidden" name="employeeInternalId" value="${requestorId}"/>
                            <input type="hidden" name="vendorEmail" value="${email}"/>
                            <input type="hidden" name="smtrSupervisorRoleAcess" value="${smtrSupervisorRoleAcess}"/>
                            <input type="hidden" name="smtrAccess" value="${smtrAccess}"/>

                            <div class="otp-group" id="otp-group-element">
                                <div class="otp-wrapper">
                                    <input class="otp-input" id="otp-1" type="text" inputmode="numeric" maxlength="1" pattern="[0-9]" autocomplete="one-time-code" />
                                </div>
                                <div class="otp-wrapper">
                                    <input class="otp-input" id="otp-2" type="text" inputmode="numeric" maxlength="1" pattern="[0-9]" />
                                </div>
                                <div class="otp-wrapper">
                                    <input class="otp-input" id="otp-3" type="text" inputmode="numeric" maxlength="1" pattern="[0-9]" />
                                </div>
                                <div class="otp-wrapper">
                                    <input class="otp-input" id="otp-4" type="text" inputmode="numeric" maxlength="1" pattern="[0-9]" />
                                </div>
                            </div>

                            <div class="verifying-text" id="verifying-indicator" style="display: none;">Verifying...</div>

                            <button type="submit" class="btn-primary" id="btn-verify" name="verify_otp" value="verify_otp">
                                <span>Verify OTP</span>
                                <svg class="btn-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                    <polyline points="20 6 9 17 4 12"></polyline>
                                </svg>
                            </button>

                            <p class="resend-text">
                                Didn't receive the code?
                                <button type="button" class="resend-btn" id="btn-resend">Resend</button>
                            </p>
                        </div>

                        <div class="form-container fade-in verified-container" id="step-verified">
                            <div class="success-icon">
                                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                                    <polyline points="20 6 9 17 4 12"></polyline>
                                </svg>
                            </div>
                            <h1 class="form-title success-title">Authentication successful</h1>
                            <p class="form-subtitle success-sub">Welcome to TRACKnow. Redirecting you now...</p>
                            <div class="progress-bar">
                                <div class="progress-fill"></div>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>

    <script>
        document.addEventListener("DOMContentLoaded", function() {
            const form = document.querySelector("#verify-form");
            const otpInputs = document.querySelectorAll('.otp-input');
            const authenticatedInput = document.createElement('input');
            authenticatedInput.type = 'hidden';
            authenticatedInput.name = 'authenticated';
            form.appendChild(authenticatedInput);

            // Handle OTP input navigation
            otpInputs.forEach((input, index) => {
                input.addEventListener('input', function() {
                    if (this.value && index < otpInputs.length - 1) {
                        otpInputs[index + 1].focus();
                    }
                    
                    if (this.value) {
                        this.classList.add('otp-input--filled');
                    } else {
                        this.classList.remove('otp-input--filled');
                    }
                    
                    const otp = Array.from(otpInputs).map(input => input.value).join('');
                    authenticatedInput.value = otp;
                });

                input.addEventListener('keydown', function(e) {
                    if (e.key === 'Backspace' && !this.value && index > 0) {
                        otpInputs[index - 1].focus();
                    }
                });
            });

           form.addEventListener('submit', function(e) {
                e.preventDefault();
                const otp = Array.from(otpInputs).map(input => input.value).join('');
                if (otp.length === 4) {
                    localStorage.setItem("tracknow_smtr_logged_in", "true");
                    
                    // Add loading state to the button instead of hiding the form
                    const verifyBtn = document.getElementById('btn-verify');
                    verifyBtn.classList.add('loading');
                    verifyBtn.innerHTML = '<span class="spinner"></span><span>Verifying...</span>';
                    verifyBtn.style.pointerEvents = 'none'; // Prevent double-clicks
                    
                    // Add verify_otp parameter before submission
                    const verifyOtpInput = document.createElement('input');
                    verifyOtpInput.type = 'hidden';
                    verifyOtpInput.name = 'verify_otp';
                    verifyOtpInput.value = 'verify_otp';
                    form.appendChild(verifyOtpInput);
                    
                    form.submit();
                }
            });

            const backBtn = document.querySelector("#btn-back");
            if (backBtn) {
                backBtn.addEventListener('click', function(e) {
                    e.preventDefault();
                    const empId = document.querySelector('input[name="employeeInternalId"]').value;
                    const form = document.createElement('form');
                    form.method = 'POST';
                    form.innerHTML = '<input type="hidden" name="logout" value="true" /><input type="hidden" name="employeeInternalId" value="' + empId + '" />';
                    document.body.appendChild(form);
                    form.submit();
                });
            }

            const resendBtn = document.querySelector("#btn-resend");
            if (resendBtn) {
                resendBtn.addEventListener('click', function(e) {
                    e.preventDefault();
                    const empId = document.querySelector('input[name="employeeInternalId"]').value;
                    const vendorEmail = document.querySelector('input[name="vendorEmail"]').value;
                    const form = document.createElement('form');
                    form.method = 'POST';
                    form.innerHTML = '<input type="hidden" name="get_otp" value="get_otp" /><input type="hidden" name="vendorEmail" value="' + vendorEmail + '" /><input type="hidden" name="employeeInternalId" value="' + empId + '" />';
                    document.body.appendChild(form);
                    form.submit();
                });
            }
        });
    </script>
</body>
</html>`;
        };

        if (context.request.method === "GET") {
            context.response.write(loginPage());
        } else {
            var isUserVerified,
                authentication = false;

            if (context.request.parameters.logout === true || context.request.parameters.logout === "true") {
                log.debug("Logout Request Received", context.request.parameters);
                try {
                    var employeeRecord = record.load({
                        type: record.Type.EMPLOYEE,
                        id: +context.request.parameters.employeeInternalId,
                        isDynamic: true
                    });
                    employeeRecord.setValue({ fieldId: "custentityotp", value: "", ignoreFieldChange: true });
                    employeeRecord.save();
                } catch (logoutErr) {
                    log.debug("Logout OTP clear error", logoutErr);
                }
                context.response.write(loginPage());
                return;
            }

            if (context.request.parameters.authenticated) {
                var options = {
                    recordType: record.Type.EMPLOYEE,
                    recordId: +context.request.parameters.employeeInternalId,
                    fieldId: "custentityotp",
                    value: context.request.parameters.authenticated
                };
                authentication = crypto.checkPasswordField(options);
            }

            log.debug("POST Request Received", context.request.parameters);

            // ─── GET OTP ────────────────────────────────────────────────────────────────
            if (context.request.parameters.get_otp) {
                var employeeRecord, requestorId, requestorEmail;
                var employeeSearchObj = search.create({
                    type: "employee",
                    filters: [["email", "is", context.request.parameters.vendorEmail]],
                    columns: [
                        search.createColumn({ name: "email", label: "Email" }),
                        search.createColumn({ name: "internalid", label: "Internal ID" })
                    ]
                });

                try {
                    var myResultSet = employeeSearchObj.run();
                    var resultRange = myResultSet.getRange({ start: 0, end: 50 });

                    for (var i = 0; i < resultRange.length; i++) {
                        requestorId = resultRange[i].getValue({ name: "internalid" });
                        requestorEmail = resultRange[i].getValue({ name: "email" });
                    }

                    function getRandomIntegerInclusive(min, max) {
                        min = Math.ceil(min);
                        max = Math.floor(max);
                        return Math.floor(Math.random() * (max - min + 1)) + min;
                    }

                    var randomInt = getRandomIntegerInclusive(1000, 9999);

                    employeeRecord = record.load({
                        type: record.Type.EMPLOYEE,
                        id: requestorId,
                        isDynamic: true
                    });

                    var smtrAccess = employeeRecord.getValue({ fieldId: "custentity_tm_tracknow_smtr_access" });
                    var smtrSupervisorRoleAcess = employeeRecord.getValue({ fieldId: "custentity_tm_tracknow_smtr_role" });

                    if (Array.isArray(smtrSupervisorRoleAcess)) {
                        smtrSupervisorRoleAcess = smtrSupervisorRoleAcess.includes("2");
                    } else {
                        smtrSupervisorRoleAcess = smtrSupervisorRoleAcess === "2";
                    }

                    var hasSMTRAccess = smtrAccess === true && smtrSupervisorRoleAcess === true;

                    if (hasSMTRAccess) {
                        employeeRecord.setValue({ fieldId: "custentityotp", value: randomInt, ignoreFieldChange: true });
                        log.debug("randomInt", randomInt);
                        employeeRecord.save();

                        email.send({
                            author: "4129",
                            recipients: requestorEmail,
                            subject: "TrackNow Supervisor Login OTP",
                            body: "Your TRACKnow Login OTP is: " + randomInt
                        });

                        context.response.write(
                            verifyPage(requestorId, context.request.parameters.vendorEmail, hasSMTRAccess, smtrSupervisorRoleAcess)
                        );
                    } else {
                        context.response.write(`<script>
                            alert("Access Denied. Please contact administrator.");
                            ${context.response.write(loginPage())};
                        </script>`);
                    }
                } catch (error) {
                    log.debug("Error in OTP Generation or Email Sending", error);
                    context.response.write(`<script>
                        alert("Invalid Email. Please enter a registered email to receive OTP.");
                        ${context.response.write(loginPage())};
                    </script>`);
                }
            }

            // ─── VERIFY OTP ─────────────────────────────────────────────────────────────
            if (
                (context.request.parameters.verify_otp &&
                    context.request.parameters.authenticated &&
                    context.request.parameters.employeeInternalId) ||
                authentication
            ) {
                if (!authentication && context.request.parameters.authenticated) {
                    var options = {
                        recordType: record.Type.EMPLOYEE,
                        recordId: +context.request.parameters.employeeInternalId,
                        fieldId: "custentityotp",
                        value: context.request.parameters.authenticated
                    };
                    authentication = crypto.checkPasswordField(options);
                    log.debug("OTP Verification Result", authentication);
                }

                if (crypto.checkPasswordField(options) === true || authentication === true) {
                    context.request.parameters.verified = true;
                    log.debug("OTP Verified Successfully");
                    isUserVerified = true;

                    if (authentication === true || isUserVerified === true) {
                        log.debug("OTP Verified Successfully");
                        log.debug("parameters", context.request.parameters);

                        var userDetailsResponse = {};
                        if (context.request.parameters.vendorEmail && !context.request.parameters.recordType) {
                            try {
                                var accessOptions = {
                                    urlParams: {
                                        userAction: "getEmployeeAccessDetails",
                                        vendorEmail: context.request.parameters.vendorEmail || ""
                                    },
                                    method: "GET",
                                    scriptId: "customscript_tm_rs_pr_po_getdata",
                                    deploymentId: "customdeploy_tm_rs_pr_po_getdata"
                                };
                                var accessResponseBody = https.requestRestlet(accessOptions).body;
                                userDetailsResponse = JSON.parse(accessResponseBody);
                            } catch (e) {
                                log.debug("Error fetching user access details", e);
                                userDetailsResponse = {};
                            }
                        }

                        var smtrAccess = false;
                        var smtrSupervisorRoleAccess = parseBoolean(context.request.parameters.smtrSupervisorRoleAcess);

                        if (!context.request.parameters.recordType) {
                            var accessResolvedFromEmployee = false;
                            var employeeInternalId = parseInt(context.request.parameters.employeeInternalId, 10);

                            if (employeeInternalId) {
                                try {
                                    var accessEmployeeRecord = record.load({
                                        type: record.Type.EMPLOYEE,
                                        id: employeeInternalId,
                                        isDynamic: false
                                    });

                                    var employeeSmtrAccess = accessEmployeeRecord.getValue({ fieldId: "custentity_tm_tracknow_smtr_access" });
                                    var employeeSmtrRole = accessEmployeeRecord.getValue({ fieldId: "custentity_tm_tracknow_smtr_role" });

                                    smtrSupervisorRoleAccess = hasRoleValue(employeeSmtrRole, "2");
                                    smtrAccess = parseBoolean(employeeSmtrAccess) && smtrSupervisorRoleAccess;
                                    accessResolvedFromEmployee = true;
                                } catch (accessLoadErr) {
                                    log.debug("Employee access fallback", accessLoadErr);
                                }
                            }

                            if (!accessResolvedFromEmployee) {
                                if (userDetailsResponse.roleDetails && parseBoolean(userDetailsResponse.roleDetails.smtrAccess)) {
                                    smtrAccess = true;
                                } else if (parseBoolean(context.request.parameters.smtrAccess)) {
                                    smtrAccess = true;
                                }
                                smtrAccess = smtrAccess && smtrSupervisorRoleAccess;
                            }
                        }

                        log.debug("smtrAccess", smtrAccess);
                        log.debug("smtrSupervisorRoleAccess", smtrSupervisorRoleAccess);

                        var smtrUserRole = context.request.parameters.smtrUserRole || "";
                        if (smtrUserRole === "undefined" || smtrUserRole === null) {
                            smtrUserRole = "";
                        }

                        if (
                            userDetailsResponse &&
                            userDetailsResponse.roleDetails &&
                            userDetailsResponse.roleDetails.smtrAssingedRoles
                        ) {
                            var roles = userDetailsResponse.roleDetails.smtrAssingedRoles;
                            for (var roleKey in roles) {
                                var roleValue = roles[roleKey];
                                if (roleValue === "2" || roleValue === "1" || roleValue === "3") {
                                    smtrUserRole = roleKey;
                                }
                            }
                        }

                        log.debug("smtrUserRole", smtrUserRole);

                        var activeDashboard;
                        if (context.request.parameters.dashboard === "Profile") {
                            activeDashboard = "Profile";
                        } else if (context.request.parameters.recordType) {
                            activeDashboard = null;
                        } else {
                            activeDashboard = context.request.parameters.dashboard || "SMTRList";
                        }
                        log.debug("activeDashboard", activeDashboard);

                        function parseJSON(str) {
                            try {
                                return str ? JSON.parse(str) : "";
                            } catch (error) {
                                log.debug("error", error);
                                return "";
                            }
                        }

                        var pageNumber = parseInt(context.request.parameters.pageNumber) || 1;

                        var smtrUserRoleParam =
                            context.request.parameters.smtrUserRole &&
                                context.request.parameters.smtrUserRole !== "undefined"
                                ? context.request.parameters.smtrUserRole
                                : smtrUserRole || "";

                        // ============================================================
                        //  DASHBOARD — Modern light theme with sidebar + stat cards
                        // ============================================================
                        var dashboardPage = `<!DOCTYPE html>
<html lang="en">
<head>
<script>
if (localStorage.getItem("tracknow_smtr_logged_in") !== "true") {
    window.location.replace("/smtr/supervisor");
}
<\/script>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TRACKnow SMTR Dashboard</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <style>
        :root {
            --brand-primary: #0F2A47;
            --brand-primary-dark: #0A1E34;
            --brand-primary-soft: #1B3A60;
            --brand-accent: #C9A24B;
            --brand-accent-dark: #B08A36;
            --brand-bg: #F4F6FA;
            --brand-surface: #FFFFFF;
            --brand-text: #1F2A37;
            --brand-muted: #6B7280;
            --brand-border: #E5E9F0;
            --sidebar-width: 248px;
            --topbar-height: 64px;

            --stat-blue: #0F2A47;
            --stat-amber: #C9A24B;
            --stat-green: #1F8A5F;
            --stat-teal: #1E6B8C;
        }
        * { box-sizing: border-box; }
        body {
            background-color: var(--brand-bg);
            font-family: 'Inter', 'Segoe UI', sans-serif;
            color: var(--brand-text);
            overflow-x: hidden;
            letter-spacing: 0.1px;
            margin: 0;
        }

        /* ============ SIDEBAR ============ */
        .app-sidebar {
            position: fixed; top: 0; bottom: 0; left: 0;
            width: var(--sidebar-width);
            background: linear-gradient(180deg, #0A1E34 0%, #0F2A47 100%);
            color: #fff;
            display: flex; flex-direction: column;
            z-index: 1030;
            border-right: 1px solid rgba(255,255,255,0.06);
            transition: transform 0.25s ease;
        }
        .app-sidebar::before {
            content: ""; position: absolute; top: 0; left: 0; right: 0; height: 3px;
            background: linear-gradient(90deg, var(--brand-accent), transparent);
        }
        .sidebar-brand {
            padding: 22px 22px 18px;
            border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        .sidebar-brand .b-title {
            font-family: 'Inter', sans-serif;
            font-weight: 800; letter-spacing: 6px; font-size: 18px;
            color: #fff;
        }
        .sidebar-brand .b-sub {
            display: block; margin-top: 4px;
            font-size: 10.5px; letter-spacing: 3px;
            color: var(--brand-accent); text-transform: uppercase;
            font-weight: 600;
        }
        .sidebar-nav {
            padding: 16px 12px; flex: 1; overflow-y: auto;
            list-style: none; margin: 0;
        }
        .sidebar-nav .nav-item { margin-bottom: 4px; }
        .sidebar-nav .nav-link {
            display: flex; align-items: center; gap: 12px;
            padding: 11px 14px;
            border-radius: 8px;
            color: rgba(255,255,255,0.72);
            font-weight: 500; font-size: 14px;
            text-decoration: none;
            transition: all 0.16s ease;
            border-left: 3px solid transparent;
        }
        .sidebar-nav .nav-link i { font-size: 16px; width: 20px; text-align: center; opacity: 0.9; }
        .sidebar-nav .nav-link:hover {
            background: rgba(255,255,255,0.05);
            color: #fff;
        }
        .sidebar-nav .nav-link.active {
            background: linear-gradient(135deg, rgba(201,162,75,0.20), rgba(201,162,75,0.06));
            color: #fff;
            border-left-color: var(--brand-accent);
            box-shadow: inset 0 0 0 1px rgba(201,162,75,0.18);
        }
        .sidebar-nav .nav-link.active i { color: var(--brand-accent); opacity: 1; }
        .sidebar-divider {
            height: 1px; background: rgba(255,255,255,0.08);
            margin: 8px 12px;
        }
        .sidebar-user {
            padding: 14px 14px 18px;
            border-top: 1px solid rgba(255,255,255,0.06);
            display: flex; align-items: center; gap: 10px;
        }
        .sidebar-user .avatar {
            width: 36px; height: 36px; border-radius: 8px;
            background: linear-gradient(135deg, var(--brand-accent), var(--brand-accent-dark));
            color: #0A1E34; font-weight: 700; font-size: 13px;
            display: inline-flex; align-items: center; justify-content: center;
            letter-spacing: 0.5px;
        }
        .sidebar-user .who { line-height: 1.2; }
        .sidebar-user .who .name { font-size: 13px; font-weight: 600; color: #fff; }
        .sidebar-user .who .role { font-size: 11px; color: rgba(255,255,255,0.55); text-transform: uppercase; letter-spacing: 1px; }

        /* ============ TOPBAR ============ */
        .app-topbar {
            position: fixed; top: 0; left: var(--sidebar-width); right: 0;
            height: var(--topbar-height);
            background: #fff;
            border-bottom: 1px solid var(--brand-border);
            display: flex; align-items: center; gap: 16px;
            padding: 0 22px;
            z-index: 1020;
        }
        .menu-toggle-btn {
            display: none; background: transparent; border: none;
            color: var(--brand-primary); font-size: 22px; cursor: pointer;
        }
        .topbar-search {
            flex: 1; max-width: 480px;
            position: relative;
        }
        .topbar-search i {
            position: absolute; left: 14px; top: 50%;
            transform: translateY(-50%); color: var(--brand-muted); font-size: 14px;
        }
        .topbar-search input {
            width: 100%; border: 1px solid var(--brand-border);
            background: #F7F9FC; border-radius: 10px;
            padding: 10px 14px 10px 40px;
            font-size: 14px; color: var(--brand-text);
            transition: border-color .15s ease, box-shadow .15s ease, background-color .15s ease;
        }
        .topbar-search input:focus {
            outline: none; background: #fff;
            border-color: var(--brand-primary);
            box-shadow: 0 0 0 4px rgba(15,42,71,0.08);
        }
        .topbar-right { margin-left: auto; display: flex; align-items: center; gap: 14px; }
        .topbar-user-chip {
            display: flex; align-items: center; gap: 10px;
            padding: 6px 14px 6px 6px;
            border: 1px solid var(--brand-border);
            border-radius: 999px; background: #fff;
        }
        .topbar-user-chip .av {
            width: 30px; height: 30px; border-radius: 50%;
            background: var(--brand-primary); color: #fff;
            display: inline-flex; align-items: center; justify-content: center;
            font-size: 12px; font-weight: 700; letter-spacing: 0.5px;
        }
        .topbar-user-chip .nm { font-size: 13px; font-weight: 600; color: var(--brand-text); }
        .topbar-user-chip .nm small { display: block; font-size: 10.5px; color: var(--brand-muted); font-weight: 500; letter-spacing: 0.3px; }

        /* ============ MAIN ============ */
        .app-main {
            margin-left: var(--sidebar-width);
            padding-top: calc(var(--topbar-height) + 22px);
            padding-right: 28px; padding-left: 28px; padding-bottom: 60px;
            min-height: 100vh;
            transition: margin-left 0.25s ease;
        }
        .page-title {
            font-size: 24px; font-weight: 700; color: var(--brand-primary);
            margin: 0 0 4px; letter-spacing: 0.2px;
            position: relative; padding-bottom: 8px;
            display: inline-block;
        }
        .page-title::after {
            content: ""; position: absolute; left: 0; bottom: 0;
            width: 48px; height: 3px; background: var(--brand-accent); border-radius: 2px;
        }
        .page-subtitle { color: var(--brand-muted); font-size: 13.5px; margin: 0 0 22px; }

        /* ============ STAT CARDS (4-col) ============ */
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(4, minmax(0, 1fr));
            gap: 16px;
            margin-bottom: 24px;
        }
        .stat-card {
            position: relative;
            background: #fff;
            border: 1px solid var(--brand-border);
            border-radius: 14px;
            padding: 18px 18px 16px;
            box-shadow: 0 2px 6px rgba(15,42,71,0.04);
            transition: transform .18s ease, box-shadow .18s ease;
            cursor: pointer;
            overflow: hidden;
        }
        .stat-card::before {
            content: ""; position: absolute; top: 0; left: 0; right: 0; height: 4px;
            background: var(--stat-accent, var(--brand-primary));
            border-radius: 14px 14px 0 0;
        }
        .stat-card:hover { transform: translateY(-2px); box-shadow: 0 14px 30px -16px rgba(15,42,71,0.22); }
        .stat-card .stat-head {
            display: flex; align-items: center; justify-content: space-between;
            margin-bottom: 12px;
        }
        .stat-card .stat-label {
            font-size: 11.5px; font-weight: 700; letter-spacing: 1.4px;
            color: var(--brand-muted); text-transform: uppercase;
        }
        .stat-card .stat-icon {
            width: 34px; height: 34px; border-radius: 9px;
            display: inline-flex; align-items: center; justify-content: center;
            background: color-mix(in srgb, var(--stat-accent) 12%, transparent);
            color: var(--stat-accent); font-size: 16px;
        }
        .stat-card .stat-value {
            font-size: 28px; font-weight: 700; color: var(--brand-primary);
            line-height: 1.1; margin-bottom: 4px;
        }
        .stat-card .stat-sub { font-size: 12.5px; color: var(--brand-muted); }

        .sc-blue  { --stat-accent: var(--stat-blue); }
        .sc-amber { --stat-accent: var(--stat-amber); }
        .sc-green { --stat-accent: var(--stat-green); }
        .sc-teal  { --stat-accent: var(--stat-teal); }

        /* ============ TABLE CARD ============ */
        .panel {
            background: #fff;
            border: 1px solid var(--brand-border);
            border-radius: 14px;
            box-shadow: 0 2px 6px rgba(15,42,71,0.04);
            overflow: hidden;
            margin-bottom: 28px;
        }
        .panel-header {
            display: flex; align-items: center; justify-content: space-between;
            gap: 12px; flex-wrap: wrap;
            padding: 18px 22px;
            border-bottom: 1px solid var(--brand-border);
            background: #fff;
        }
        .panel-header h5 {
            margin: 0; font-size: 16px; font-weight: 700;
            color: var(--brand-primary); letter-spacing: 0.2px;
        }
        .panel-filters { display: flex; gap: 10px; flex-wrap: wrap; align-items: center; }
        .panel-filters .form-select {
            border: 1px solid var(--brand-border) !important;
            background-color: #fff !important;
            color: var(--brand-text) !important;
            border-radius: 8px !important;
            font-size: 13px !important;
            padding: 7px 30px 7px 12px !important;
            height: auto !important;
            min-width: 160px;
        }
        .panel-filters .form-select:focus {
            border-color: var(--brand-primary) !important;
            box-shadow: 0 0 0 3px rgba(15,42,71,0.10) !important;
        }
        .table-responsive { overflow-x: auto; -webkit-overflow-scrolling: touch; }
        .table {
            width: 100%; margin: 0; border-collapse: collapse;
        }
        .table thead th {
            background: #F7F9FC;
            color: var(--brand-primary);
            font-weight: 700; font-size: 11.5px;
            text-transform: uppercase; letter-spacing: 1px;
            padding: 14px 22px;
            border-bottom: 1px solid var(--brand-border);
            white-space: nowrap;
        }
        .table tbody td {
            padding: 16px 22px;
            font-size: 13.5px; color: var(--brand-text);
            border-bottom: 1px solid #EEF1F6;
            vertical-align: middle; white-space: nowrap;
        }
        .table tbody tr:last-child td { border-bottom: none; }
        .table tbody tr { transition: background-color .12s ease; }
        .table tbody tr:hover { background-color: #F8FAFD; }

        .status-pill {
            display: inline-flex; align-items: center; gap: 6px;
            padding: 4px 10px; border-radius: 999px;
            font-size: 12px; font-weight: 600; letter-spacing: 0.2px;
            border: 1px solid transparent;
        }
        .status-pill::before { content: ""; width: 6px; height: 6px; border-radius: 50%; background: currentColor; }
        .status-pending  { color: #B7791F; background: #FFF6E1; border-color: #F3DFA2; }
        .status-approved { color: #1F8A5F; background: #E7F5EF; border-color: #BFE3D2; }
        .status-rejected { color: #C0392B; background: #FDECEA; border-color: #F4C2BC; }
        .status-fulfilled{ color: #1E6B8C; background: #E6F1F7; border-color: #BBDAE9; }
        .status-default  { color: #475569; background: #F1F5F9; border-color: #E2E8F0; }

        .urgency-pill {
            display: inline-flex; align-items: center; gap: 6px;
            font-size: 12.5px; font-weight: 600;
        }
        .urgency-pill::before { content: ""; width: 8px; height: 8px; border-radius: 50%; }
        .urgency-high::before   { background: #D14343; }
        .urgency-medium::before { background: #E0A106; }
        .urgency-low::before    { background: #1F8A5F; }
        .urgency-default::before{ background: #94A3B8; }

        .action-icon-btn {
            display: inline-flex; align-items: center; justify-content: center;
            width: 32px; height: 32px;
            border-radius: 999px;
            background: var(--brand-primary); color: #fff;
            font-size: 14px;
            border: none; cursor: pointer;
            transition: background-color .15s ease, transform .15s ease;
        }
        .action-icon-btn:hover { background: var(--brand-primary-soft); transform: translateX(2px); color: #fff; }

        /* ============ PAGINATION ============ */
        .pagination { display: inline-flex; padding: 0; margin: 0; list-style: none; gap: 4px; }
        .pagination .page-item .page-link {
            border: 1px solid var(--brand-border);
            color: var(--brand-primary);
            border-radius: 8px !important;
            font-size: 13px; font-weight: 600;
            padding: 6px 12px;
            background: #fff;
        }
        .pagination .page-item.active .page-link {
            background: var(--brand-primary); border-color: var(--brand-primary); color: #fff;
        }
        .pagination .page-link:hover { background: var(--brand-bg); color: var(--brand-primary-dark); }

        /* ============ DETAIL PAGE ============ */
        .detail-toolbar {
            display: flex; align-items: center; justify-content: space-between;
            gap: 16px; flex-wrap: wrap; margin-bottom: 20px;
        }
        .back-btn {
            display: inline-flex; align-items: center; justify-content: center;
            width: 36px; height: 36px; border-radius: 999px;
            background: var(--brand-accent); color: #fff;
            border: none; cursor: pointer; font-size: 15px;
            transition: filter .15s ease, transform .15s ease;
            box-shadow: 0 4px 12px -4px rgba(176,138,54,0.55);
        }
        .back-btn:hover { filter: brightness(1.05); transform: translateX(-2px); color: #fff; }

        .detail-card {
            background: #fff; border: 1px solid var(--brand-border);
            border-radius: 14px; padding: 26px 28px;
            box-shadow: 0 2px 6px rgba(15,42,71,0.04);
            margin-bottom: 20px;
        }
        .detail-grid {
            display: grid;
            grid-template-columns: repeat(4, minmax(0, 1fr));
            gap: 22px 28px;
        }
        .detail-field .d-label {
            display: block;
            font-size: 11px; font-weight: 700; letter-spacing: 1.4px;
            text-transform: uppercase; color: var(--brand-muted);
            margin-bottom: 6px;
        }
        .detail-field .d-value {
            color: var(--brand-accent-dark); font-weight: 600; font-size: 15px; margin: 0;
            word-break: break-word;
        }
        .detail-field .d-value.plain { color: var(--brand-text); font-weight: 500; }
        .detail-field .form-control,
        .detail-field .form-select {
            width: 100%;
            background: #FAFBFD;
            border: 1.5px solid var(--brand-border);
            color: var(--brand-text);
            border-radius: 8px;
            padding: 8px 12px;
            font-size: 14px;
        }
        .detail-field .form-control[readonly],
        .detail-field .form-select[readonly] { background: #FAFBFD; cursor: default; }
        .detail-field .form-control:focus,
        .detail-field .form-select:focus {
            outline: none; border-color: var(--brand-primary);
            background: #fff;
            box-shadow: 0 0 0 3px rgba(15,42,71,0.10);
        }

        .btn-approve, .btn-reject, .btn-edit, .btn-save, .btn-fulfill {
            display: inline-flex; align-items: center; gap: 8px;
            padding: 9px 18px;
            font-size: 13.5px; font-weight: 600;
            border-radius: 8px; cursor: pointer; border: none;
            letter-spacing: 0.3px;
            transition: filter .15s ease, transform .15s ease;
        }
        .btn-approve, .btn-fulfill {
            background: var(--brand-primary); color: #fff;
            box-shadow: 0 6px 16px -8px rgba(15,42,71,0.55);
        }
        .btn-reject, .btn-edit, .btn-save {
            background: var(--brand-accent); color: #fff;
            box-shadow: 0 6px 16px -8px rgba(176,138,54,0.55);
        }
        .btn-approve:hover, .btn-reject:hover, .btn-edit:hover, .btn-save:hover, .btn-fulfill:hover {
            filter: brightness(1.07); color: #fff;
        }

        .items-table-wrap { padding: 0; }

        /* ============ PROFILE ============ */
        .profile-card {
            background: #fff; border: 1px solid var(--brand-border);
            border-radius: 14px; padding: 36px 36px 32px;
            box-shadow: 0 2px 6px rgba(15,42,71,0.04);
        }
        .profile-grid {
            display: grid;
            grid-template-columns: 200px 1fr 1fr;
            gap: 32px; align-items: start;
        }
        .profile-avatar {
            width: 140px; height: 140px; border-radius: 50%;
            background: #E6F1F4;
            display: inline-flex; align-items: center; justify-content: center;
            color: #1E6B8C; font-size: 80px;
            margin: 0 auto;
        }
        .profile-field { margin-bottom: 18px; }
        .profile-field .pf-label {
            font-size: 13px; font-weight: 700; color: var(--brand-primary);
            margin: 0 0 4px;
        }
        .profile-field .pf-value {
            font-size: 14px; color: var(--brand-accent-dark); font-weight: 600;
            margin: 0; word-break: break-word;
        }

        /* ============ RESPONSIVE ============ */
        @media (max-width: 1199.98px) {
            .stats-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
            .detail-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        }
        @media (max-width: 991.98px) {
            .menu-toggle-btn { display: inline-flex; }
            .app-sidebar { transform: translateX(-100%); }
            .app-sidebar.show { transform: translateX(0); box-shadow: 8px 0 22px rgba(15,42,71,0.18); }
            .app-topbar { left: 0; }
            .app-main { margin-left: 0; }
            .profile-grid { grid-template-columns: 1fr; text-align: center; }
            .profile-avatar { margin: 0 auto 8px; }
        }
        @media (max-width: 600px) {
            .stats-grid { grid-template-columns: 1fr; }
            .detail-grid { grid-template-columns: 1fr; }
            .app-main { padding-left: 16px; padding-right: 16px; }
            .topbar-user-chip .nm { display: none; }
        }
    </style>
</head>
<body>
    <!-- ============ SIDEBAR ============ -->
    <aside class="app-sidebar" id="appSidebar">
        <div class="sidebar-brand">
            <div class="b-title">TRACKNOW</div>
            <span class="b-sub">Supervisor Workspace</span>
        </div>
        <ul class="sidebar-nav">
            <li class="nav-item">
                <a href="#" class="nav-link active" id="dashboardNavLink">
                    <i class="bi bi-grid-1x2-fill"></i> Dashboard
                </a>
            </li>
            <li class="nav-item">
                <a href="#" class="nav-link" id="profileNavLink">
                    <i class="bi bi-person-circle"></i> Profile
                </a>
            </li>
        </ul>
        <div class="sidebar-divider"></div>
        <form id="logoutForm" method="post" style="padding: 0 12px 8px;">
            <a href="#" id="logoutBtn" class="nav-link" style="color: rgba(255,255,255,0.75); display: flex; align-items: center; gap: 12px; padding: 11px 14px; border-radius: 8px; font-size: 14px; text-decoration: none;">
                <i class="bi bi-box-arrow-right" style="font-size: 16px; width: 20px; text-align: center;"></i> Logout
            </a>
            <input type="hidden" name="vendorEmail" value="${context.request.parameters.vendorEmail}"/>
            <input type="hidden" name="authenticated" value="${context.request.parameters.authenticated}"/>
            <input type="hidden" name="employeeInternalId" value="${context.request.parameters.employeeInternalId}"/>
            <input type="hidden" name="logout" value="true"/>
        </form>
        <div class="sidebar-user">
            <div class="avatar">SM</div>
            <div class="who">
                <div class="name">SMTR Supervisor</div>
                <div class="role">Supervisor</div>
            </div>
        </div>
    </aside>

    <!-- ============ TOPBAR ============ -->
    <header class="app-topbar">
        <button class="menu-toggle-btn" id="menuToggleBtn"><i class="bi bi-list"></i></button>
        <form class="topbar-search" method="post" id="topbarSearchForm">
            <i class="bi bi-search" style="cursor: pointer;" onclick="document.getElementById('topbarSearchForm').submit();"></i>
            <input name="search" value="${context.request.parameters.search || ""}" type="text" placeholder="Search anything..." onkeypress="if(event.keyCode === 13){ this.form.submit(); return false; }"/>
            <input type="hidden" name="vendorEmail" value="${context.request.parameters.vendorEmail || ""}"/>
            <input type="hidden" name="authenticated" value="${context.request.parameters.authenticated || ""}"/>
            <input type="hidden" name="employeeInternalId" value="${context.request.parameters.employeeInternalId || ""}"/>
            <input type="hidden" name="verify_otp" value="verify_otp"/>
            <input type="hidden" name="dashboard" value="${activeDashboard || "SMTRList"}"/>
            <input type="hidden" name="smtrAccess" value="${smtrAccess}"/>
            <input type="hidden" name="smtrUserRole" value="${smtrUserRoleParam}"/>
            <input type="hidden" name="smtrStatusFilter" value="${context.request.parameters.smtrStatusFilter || ""}"/>
            <input type="hidden" name="pageNumber" value="1"/>
        </form>
        <div class="topbar-right">
            <div class="topbar-user-chip">
                <div class="av">SM</div>
                <div class="nm">SMTR Supervisor<small>Supervisor</small></div>
            </div>
        </div>
    </header>

    <main class="app-main">
        <div id="dashboardSection">`;

                        // ─── SMTR LIST VIEW ──────────────────────────────────────────────────────────
                        if (activeDashboard === "SMTRList") {
                            // submit approve/reject/fulfill before fetching list (unchanged backend)
                            if (context.request.parameters.approvalStatus === "Approved") {
                                https.requestRestlet({
                                    body: JSON.stringify({
                                        userAction: "approveSMTRForm",
                                        vendorEmail: context.request.parameters.vendorEmail,
                                        vendorInternalId: context.request.parameters.vendorInternalId,
                                        smtrInternalId: context.request.parameters.smtrInternalId,
                                        approvedTransactionDetails: context.request.parameters.approvedTransactionDetails
                                    }),
                                    headers: { "Content-Type": "application/json" },
                                    method: "POST",
                                    scriptId: "customscript_tm_rs_pr_po_getdata",
                                    deploymentId: "customdeploy_tm_rs_pr_po_getdata"
                                });
                            } else if (context.request.parameters.approvalStatus === "Rejected") {
                                https.requestRestlet({
                                    body: JSON.stringify({
                                        userAction: "rejectSMTRForm",
                                        vendorEmail: context.request.parameters.vendorEmail,
                                        vendorInternalId: context.request.parameters.vendorInternalId,
                                        smtrInternalId: context.request.parameters.smtrInternalId,
                                        approvedTransactionDetails: ""
                                    }),
                                    headers: { "Content-Type": "application/json" },
                                    method: "POST",
                                    scriptId: "customscript_tm_rs_pr_po_getdata",
                                    deploymentId: "customdeploy_tm_rs_pr_po_getdata"
                                });
                            } else if (context.request.parameters.approvalStatus === "Fulfilled") {
                                https.requestRestlet({
                                    body: JSON.stringify({
                                        userAction: "fulfillSMTRForm",
                                        vendorEmail: context.request.parameters.vendorEmail,
                                        vendorInternalId: context.request.parameters.vendorInternalId,
                                        smtrInternalId: context.request.parameters.smtrInternalId,
                                        approvedTransactionDetails: context.request.parameters.approvedTransactionDetails,
                                        smtrDetails: parseJSON(context.request.parameters.smtrDetails) || {}
                                    }),
                                    headers: { "Content-Type": "application/json" },
                                    method: "POST",
                                    scriptId: "customscript_tm_rs_pr_po_getdata",
                                    deploymentId: "customdeploy_tm_rs_pr_po_getdata"
                                });
                            }

                            var smtrListOptions = {
                                urlParams: {
                                    vendorInternalId: context.request.parameters.vendorInternalId,
                                    userAction: "getSMTRRecords",
                                    pageNumber: pageNumber,
                                    vendorEmail: context.request.parameters.vendorEmail,
                                    smtrStatusFilter: context.request.parameters.smtrStatusFilter,
                                    urgencyLevelFilter: context.request.parameters.urgencyLevelFilter,
                                    smtrUserRole: smtrUserRoleParam,
                                    globalSearchValue: context.request.parameters.search || ""
                                },
                                method: "GET",
                                scriptId: "customscript_tm_rs_pr_po_getdata",
                                deploymentId: "customdeploy_tm_rs_pr_po_getdata"
                            };
                            var response = https.requestRestlet(smtrListOptions);
                            var myTransactionDataObj = JSON.parse(response.body || "{}");

                            if (
                                pageNumber > 1 &&
                                (!myTransactionDataObj.smtrRecordsData || myTransactionDataObj.smtrRecordsData.length === 0)
                            ) {
                                pageNumber = pageNumber - 1;
                                smtrListOptions.urlParams.pageNumber = pageNumber;
                                myTransactionDataObj = JSON.parse(https.requestRestlet(smtrListOptions).body || "{}");
                            }

                            var currentFilter = context.request.parameters.smtrStatusFilter || "";
                            var urgencyLevelFilter = context.request.parameters.urgencyLevelFilter || "";

                            var transactionDataArray = myTransactionDataObj && myTransactionDataObj.smtrRecordsData
                                ? myTransactionDataObj.smtrRecordsData : [];

                            // Derive stat counts from whatever the backend already returns (no new calls).
                            var totalSmtr = (myTransactionDataObj && (myTransactionDataObj.totalRecords || myTransactionDataObj.totalNumberOfRecords)) || transactionDataArray.length;
                            var pendingCount = 0, approvedCount = 0, fulfilledCount = 0;
                            for (var sIdx = 0; sIdx < transactionDataArray.length; sIdx++) {
                                var st = String(transactionDataArray[sIdx].status || "").toLowerCase();
                                if (st.indexOf("pending") !== -1) pendingCount++;
                                else if (st.indexOf("approved") !== -1) approvedCount++;
                                else if (st.indexOf("fulfilled") !== -1) fulfilledCount++;
                            }

                            dashboardPage += `<div>
                                <div style="display:flex; align-items:center; gap:14px; margin-bottom: 4px;">
                                    <h1 class="page-title m-0">SMTR Dashboard</h1>
                                </div>
                                <p class="page-subtitle">Overview of submitted material transfer requests and approvals</p>

                                <div class="stats-grid">
                                    <form class="stat-card sc-blue callingmethod" method="post">
                                        <div class="stat-head">
                                            <span class="stat-label">SMTR List</span>
                                            <span class="stat-icon"><i class="bi bi-file-earmark-text"></i></span>
                                        </div>
                                        <div class="stat-value">${totalSmtr}</div>
                                        <div class="stat-sub">Total requests</div>
                                        <input type="hidden" name="dashboard" value="SMTRList"/>
                                        <input type="hidden" name="smtrStatusFilter" value=""/>
                                        <input type="hidden" name="smtrAccess" value="${smtrAccess}"/>
                                        <input type="hidden" name="vendorEmail" value="${context.request.parameters.vendorEmail}"/>
                                        <input type="hidden" name="smtrUserRole" value="${smtrUserRoleParam}"/>
                                        <input type="hidden" name="verified" value="true"/>
                                        <input type="hidden" name="employeeInternalId" value="${context.request.parameters.employeeInternalId}"/>
                                        <input type="hidden" name="authenticated" value="${context.request.parameters.authenticated}"/>
                                    </form>
                                    <form class="stat-card sc-amber callingmethod" method="post">
                                        <div class="stat-head">
                                            <span class="stat-label">Pending Approval</span>
                                            <span class="stat-icon"><i class="bi bi-hourglass-split"></i></span>
                                        </div>
                                        <div class="stat-value">${pendingCount}</div>
                                        <div class="stat-sub">Requests awaiting approval</div>
                                        <input type="hidden" name="dashboard" value="SMTRList"/>
                                        <input type="hidden" name="smtrStatusFilter" value="1"/>
                                        <input type="hidden" name="smtrAccess" value="${smtrAccess}"/>
                                        <input type="hidden" name="vendorEmail" value="${context.request.parameters.vendorEmail}"/>
                                        <input type="hidden" name="smtrUserRole" value="${smtrUserRoleParam}"/>
                                        <input type="hidden" name="verified" value="true"/>
                                        <input type="hidden" name="employeeInternalId" value="${context.request.parameters.employeeInternalId}"/>
                                        <input type="hidden" name="authenticated" value="${context.request.parameters.authenticated}"/>
                                    </form>
                                    <form class="stat-card sc-green callingmethod" method="post">
                                        <div class="stat-head">
                                            <span class="stat-label">Approved</span>
                                            <span class="stat-icon"><i class="bi bi-check2-circle"></i></span>
                                        </div>
                                        <div class="stat-value">${approvedCount}</div>
                                        <div class="stat-sub">Requests approved</div>
                                        <input type="hidden" name="dashboard" value="SMTRList"/>
                                        <input type="hidden" name="smtrStatusFilter" value="2"/>
                                        <input type="hidden" name="smtrAccess" value="${smtrAccess}"/>
                                        <input type="hidden" name="vendorEmail" value="${context.request.parameters.vendorEmail}"/>
                                        <input type="hidden" name="smtrUserRole" value="${smtrUserRoleParam}"/>
                                        <input type="hidden" name="verified" value="true"/>
                                        <input type="hidden" name="employeeInternalId" value="${context.request.parameters.employeeInternalId}"/>
                                        <input type="hidden" name="authenticated" value="${context.request.parameters.authenticated}"/>
                                    </form>
                                    <form class="stat-card sc-teal callingmethod" method="post">
                                        <div class="stat-head">
                                            <span class="stat-label">Fulfilled</span>
                                            <span class="stat-icon"><i class="bi bi-truck"></i></span>
                                        </div>
                                        <div class="stat-value">${fulfilledCount}</div>
                                        <div class="stat-sub">Requests fulfilled</div>
                                        <input type="hidden" name="dashboard" value="SMTRList"/>
                                        <input type="hidden" name="smtrStatusFilter" value="5"/>
                                        <input type="hidden" name="smtrAccess" value="${smtrAccess}"/>
                                        <input type="hidden" name="vendorEmail" value="${context.request.parameters.vendorEmail}"/>
                                        <input type="hidden" name="smtrUserRole" value="${smtrUserRoleParam}"/>
                                        <input type="hidden" name="verified" value="true"/>
                                        <input type="hidden" name="employeeInternalId" value="${context.request.parameters.employeeInternalId}"/>
                                        <input type="hidden" name="authenticated" value="${context.request.parameters.authenticated}"/>
                                    </form>
                                </div>

                                <div class="panel">
                                    <div class="panel-header">
                                        <h5>Recent SMTR Records</h5>
                                        <form class="selectingfilter panel-filters" method="post">
                                            <select class="form-select" name="urgencyLevelFilter">
                                                <option value="" ${urgencyLevelFilter === "" ? "selected" : ""}>Urgency Level</option>
                                                <option value="1" ${urgencyLevelFilter === "1" ? "selected" : ""}>Low</option>
                                                <option value="2" ${urgencyLevelFilter === "2" ? "selected" : ""}>Medium</option>
                                                <option value="3" ${urgencyLevelFilter === "3" ? "selected" : ""}>High</option>
                                            </select>
                                            <select class="form-select" name="smtrStatusFilter">
                                                <option value="" ${currentFilter === "" ? "selected" : ""}>All Status</option>
                                                <option value="1" ${currentFilter === "1" ? "selected" : ""}>Pending for Approval</option>
                                                <option value="2" ${currentFilter === "2" ? "selected" : ""}>Approved</option>
                                                <option value="3" ${currentFilter === "3" ? "selected" : ""}>Rejected</option>
                                                <option value="5" ${currentFilter === "5" ? "selected" : ""}>Fulfilled</option>
                                            </select>
                                            <input type="hidden" name="smtrAccess" value="${smtrAccess}"/>
                                            <input type="hidden" name="vendorEmail" value="${context.request.parameters.vendorEmail}"/>
                                            <input type="hidden" name="dashboard" value="SMTRList"/>
                                            <input type="hidden" name="smtrUserRole" value="${smtrUserRoleParam}"/>
                                            <input type="hidden" name="verified" value="true"/>
                                            <input type="hidden" name="employeeInternalId" value="${context.request.parameters.employeeInternalId}"/>
                                            <input type="hidden" name="authenticated" value="${context.request.parameters.authenticated}"/>
                                        </form>
                                    </div>
                                    <div class="table-responsive">
                                        <table class="table dashboard-list-table">
                                            <thead>
                                                <tr>
                                                    <th>Document Number</th>
                                                    <th>Purpose</th>
                                                    <th>Location</th>
                                                    <th>Req. Date</th>
                                                    <th>Need By Date</th>
                                                    <th>Urgency Level</th>
                                                    <th>Status</th>
                                                    <th>Info</th>
                                                </tr>
                                            </thead>
                                            <tbody>`;

                            for (var index = 0; index < transactionDataArray.length; index++) {
                                var row = transactionDataArray[index];
                                var urg = String(row.urgencyLevel || "").toLowerCase();
                                var urgClass = "urgency-default";
                                if (urg.indexOf("high") !== -1) urgClass = "urgency-high";
                                else if (urg.indexOf("medium") !== -1) urgClass = "urgency-medium";
                                else if (urg.indexOf("low") !== -1) urgClass = "urgency-low";

                                var st = String(row.status || "").toLowerCase();
                                var stClass = "status-default";
                                if (st.indexOf("pending") !== -1) stClass = "status-pending";
                                else if (st.indexOf("approved") !== -1) stClass = "status-approved";
                                else if (st.indexOf("rejected") !== -1) stClass = "status-rejected";
                                else if (st.indexOf("fulfilled") !== -1) stClass = "status-fulfilled";

                                dashboardPage += `<tr>
                                    <td><strong style="color: var(--brand-primary);">${row.documentNumber}</strong></td>
                                    <td>${row.purchasePurpose}</td>
                                    <td>${row.smtrTerritory}</td>
                                    <td>${row.RequestedArrivalDate}</td>
                                    <td>${row.DateNeededtoArrive}</td>
                                    <td><span class="urgency-pill ${urgClass}">${row.urgencyLevel}</span></td>
                                    <td><span class="status-pill ${stClass}">${row.status}</span></td>
                                    <td>
                                        <form class="callingmethod m-0" method="post">
                                            <button type="button" class="action-icon-btn" aria-label="View"><i class="bi bi-arrow-right"></i></button>
                                            <input type="hidden" name="smtrAccess" value="${smtrAccess}"/>
                                            <input type="hidden" name="vendorEmail" value="${context.request.parameters.vendorEmail}"/>
                                            <input type="hidden" name="smtrInternalId" value="${row.internalId}"/>
                                            <input type="hidden" name="recordType" value="SMTRRecord"/>
                                            <input type="hidden" name="smtrUserRole" value="${smtrUserRoleParam}"/>
                                            <input type="hidden" name="verified" value="true"/>
                                            <input type="hidden" name="employeeInternalId" value="${context.request.parameters.employeeInternalId}"/>
                                            <input type="hidden" name="authenticated" value="${context.request.parameters.authenticated}"/>
                                            <input type="hidden" name="search" value="${context.request.parameters.search || ""}"/>
                                        </form>
                                    </td>
                                </tr>`;
                            }

                            if (transactionDataArray.length === 0) {
                                dashboardPage += `<tr><td colspan="8" style="text-align:center; color: var(--brand-muted); padding: 36px;">No records found</td></tr>`;
                            }

                            dashboardPage += `</tbody></table></div></div>`;

                            if (myTransactionDataObj && myTransactionDataObj.totalNumberOfPages > 1) {
                                var currentPageValue = parseInt(context.request.parameters.pageNumber, 10) || 1;
                                var totalPages = parseInt(myTransactionDataObj.totalNumberOfPages, 10) || 1;
                                dashboardPage += `<nav aria-label="Page navigation" style="display:flex; justify-content:center; padding: 8px 0 24px;">
                                    <form method="post" id="paginationForm">
                                    <ul class="pagination">
                                        <li class="page-item ${currentPageValue <= 1 ? "disabled" : ""}" role="button" id="previousPage">
                                            <a class="page-link" style="${currentPageValue <= 1 ? "pointer-events: none; opacity: 0.5;" : ""}">Previous</a>
                                        </li>
                                        <li class="page-item active" role="button" id="page1"><a class="page-link">${currentPageValue}</a></li>
                                        <li class="page-item ${currentPageValue + 1 > totalPages ? "disabled" : ""}" role="button" id="page2"><a class="page-link" style="${currentPageValue + 1 > totalPages ? "pointer-events: none; opacity: 0.5;" : ""}">${currentPageValue + 1}</a></li>
                                        <li class="page-item ${currentPageValue + 2 > totalPages ? "disabled" : ""}" role="button" id="page3"><a class="page-link" style="${currentPageValue + 2 > totalPages ? "pointer-events: none; opacity: 0.5;" : ""}">${currentPageValue + 2}</a></li>
                                        <li class="page-item ${currentPageValue + 3 > totalPages ? "disabled" : ""}" role="button" id="nextPage">
                                            <a class="page-link" style="${currentPageValue + 3 > totalPages ? "pointer-events: none; opacity: 0.5;" : ""}">Next</a>
                                        </li>
                                        <input type="hidden" name="smtrAccess" value="${smtrAccess}"/>
                                        <input type="hidden" name="vendorEmail" value="${context.request.parameters.vendorEmail}"/>
                                        <input type="hidden" name="dashboard" value="SMTRList"/>
                                        <input type="hidden" name="smtrUserRole" value="${smtrUserRoleParam}"/>
                                        <input type="hidden" name="pageNumber" id="pageNumber" value="${currentPageValue}"/>
                                        <input type="hidden" name="smtrStatusFilter" value="${context.request.parameters.smtrStatusFilter || ""}"/>
                                        <input type="hidden" name="urgencyLevelFilter" value="${context.request.parameters.urgencyLevelFilter || ""}"/>
                                        <input type="hidden" name="verified" value="true"/>
                                        <input type="hidden" name="employeeInternalId" value="${context.request.parameters.employeeInternalId || ""}"/>
                                        <input type="hidden" name="vendorInternalId" value="${context.request.parameters.vendorInternalId || context.request.parameters.employeeInternalId || ""}"/>
                                        <input type="hidden" name="authenticated" value="${context.request.parameters.authenticated}"/>
                                    </ul>
                                    </form>
                                    </nav>
                                    <script>
                                        var currentPage = parseInt(document.getElementById("pageNumber").value, 10);
                                        var totalPages = ${totalPages};
                                        function isPaginationDisabled(id) { return document.getElementById(id).classList.contains("disabled"); }
                                        document.getElementById("previousPage").addEventListener("click", function() {
                                            if (!isPaginationDisabled("previousPage") && currentPage > 1) {
                                                document.getElementById("pageNumber").value = currentPage - 1;
                                                document.getElementById("paginationForm").submit();
                                            }
                                        });
                                        document.getElementById("nextPage").addEventListener("click", function() {
                                            if (!isPaginationDisabled("nextPage") && currentPage + 3 <= totalPages) {
                                                document.getElementById("pageNumber").value = currentPage + 3;
                                                document.getElementById("paginationForm").submit();
                                            }
                                        });
                                        document.getElementById("page1").addEventListener("click", function() {
                                            document.getElementById("pageNumber").value = currentPage;
                                            document.getElementById("paginationForm").submit();
                                        });
                                        document.getElementById("page2").addEventListener("click", function() {
                                            if (!isPaginationDisabled("page2") && currentPage + 1 <= totalPages) {
                                                document.getElementById("pageNumber").value = currentPage + 1;
                                                document.getElementById("paginationForm").submit();
                                            }
                                        });
                                        document.getElementById("page3").addEventListener("click", function() {
                                            if (!isPaginationDisabled("page3") && currentPage + 2 <= totalPages) {
                                                document.getElementById("pageNumber").value = currentPage + 2;
                                                document.getElementById("paginationForm").submit();
                                            }
                                        });
                                    <\/script>`;
                            }

                            dashboardPage += `</div>`; // close wrapper
                        }

                        // ─── SMTR RECORD DETAIL VIEW ─────────────────────────────────────────────────
                        else if (context.request.parameters.recordType === "SMTRRecord") {
                            var options = {
                                urlParams: {
                                    vendorInternalId: context.request.parameters.vendorInternalId,
                                    userAction: "getSmtrTransactionData",
                                    smtrInternalId: context.request.parameters.smtrInternalId,
                                    pageNumber: 1,
                                    vendorEmail: context.request.parameters.vendorEmail,
                                    globalSearchValue: context.request.parameters.search || ""
                                },
                                method: "GET",
                                scriptId: "customscript_tm_rs_pr_po_getdata",
                                deploymentId: "customdeploy_tm_rs_pr_po_getdata"
                            };
                            var transactionDataObj = JSON.parse(https.requestRestlet(options).body);
                            var transactionData = transactionDataObj.smtrTransactionData;

                            dashboardPage += `<div class="detail-page">
                                <div class="detail-toolbar">
                                    <div style="display:flex; align-items:center; gap:14px;">
                                        <form class="callingmethod m-0" method="post" style="display:inline;">
                                            <button type="button" class="back-btn" aria-label="Back"><i class="bi bi-arrow-left"></i></button>
                                            <input type="hidden" name="smtrAccess" value="${smtrAccess}"/>
                                            <input type="hidden" name="vendorEmail" value="${context.request.parameters.vendorEmail}"/>
                                            <input type="hidden" name="dashboard" value="SMTRList"/>
                                            <input type="hidden" name="smtrUserRole" value="${smtrUserRoleParam}"/>
                                            <input type="hidden" name="verified" value="true"/>
                                            <input type="hidden" name="employeeInternalId" value="${context.request.parameters.employeeInternalId}"/>
                                            <input type="hidden" name="authenticated" value="${context.request.parameters.authenticated}"/>
                                        </form>
                                        <h1 class="page-title m-0">SMTR Details</h1>
                                    </div>
                                    <div class="detail-actions">
                                        <form method="post" style="display:flex; gap:8px; align-items:center; flex-wrap:wrap;">
                                            <input type="hidden" name="approvedTransactionDetails" />
                                            <input type="hidden" name="smtrAccess" value="${smtrAccess}"/>
                                            <input type="hidden" name="vendorEmail" value="${context.request.parameters.vendorEmail}"/>
                                            <input type="hidden" name="smtrUserRole" value="${smtrUserRoleParam}"/>
                                            <input type="hidden" name="verified" value="true"/>
                                            <input type="hidden" name="employeeInternalId" value="${context.request.parameters.employeeInternalId}"/>
                                            <input type="hidden" name="vendorInternalId" value="${context.request.parameters.vendorInternalId || context.request.parameters.employeeInternalId || ""}"/>
                                            <input type="hidden" name="authenticated" value="${context.request.parameters.authenticated}"/>
                                            <input type="hidden" name="dashboard" value="SMTRList"/>
                                            <input type="hidden" name="smtrInternalId" value="${transactionData.internalid}"/>`;

                            if (smtrUserRoleParam === "SMTR Supervisor" || smtrUserRoleParam === "" || !smtrUserRoleParam) {
                                if (transactionData.status === "Pending Approval") {
                                    dashboardPage += `<button type="button" class="btn-approve" id="approveButton" name="approvalStatus" value="Approved">Approve</button>
                                                      <button type="submit" class="btn-reject" name="approvalStatus" value="Rejected">Reject</button>`;
                                }
                            }
                            if (smtrUserRoleParam === "Shipping Clerk") {
                                if (transactionData.status === "Approved") {
                                    dashboardPage += `<button type="button" class="btn-edit" onclick="editSTMR()" id="editButton">Edit</button>
                                                <button type="button" class="btn-save" style="display:none;" onclick="saveSTMR()" id="saveButton">Save</button>
                                                <button type="button" class="btn-fulfill" id="fulfillButton" name="approvalStatus" value="Fulfilled">Mark as Fulfilled</button>
                                                <input type="hidden" name="smtrDetails" id="smtrDetails" value=""/>`;
                                } else {
                                    if (transactionData.invadjReference) {
                                        const fullStr = transactionData.invadjReference || "";
                                        const docNum = fullStr.substring(fullStr.indexOf("#"));
                                        dashboardPage += `<div style="color: var(--brand-primary); font-weight:600;">Inventory Adjustment: <span style="color: var(--brand-accent-dark);">${docNum || "-"}</span></div>`;
                                    }
                                }
                            }

                            dashboardPage += `<script>
                                function editSTMR() {
                                    document.getElementById("editButton").style.display = "none";
                                    document.getElementById("saveButton").style.display = "inline-flex";
                                    document.getElementById("customerName").readOnly = false;
                                    document.getElementById("location").readOnly = false;
                                    document.getElementById("department").readOnly = false;
                                    document.getElementById("purchasePurpose").readOnly = false;
                                    document.getElementById("shipTo").readOnly = false;
                                    document.getElementById("memo").readOnly = false;
                                    document.getElementById("trackingNumber").readOnly = false;
                                }
                                function saveSTMR() {
                                    document.getElementById("editButton").style.display = "inline-flex";
                                    document.getElementById("saveButton").style.display = "none";
                                    document.getElementById("customerName").readOnly = true;
                                    document.getElementById("location").readOnly = true;
                                    document.getElementById("department").readOnly = true;
                                    document.getElementById("purchasePurpose").readOnly = true;
                                    document.getElementById("shipTo").readOnly = true;
                                    document.getElementById("memo").readOnly = true;
                                    document.getElementById("trackingNumber").readOnly = true;
                                }
                                document.getElementById("fulfillButton") && document.getElementById("fulfillButton").addEventListener("click", function() {
                                    var smtrDetails = {
                                        purchasePurpose: document.getElementById("purchasePurpose").value,
                                        shipTo: document.getElementById("shipTo").value,
                                        memo: document.getElementById("memo").value,
                                        trackingNumber: document.getElementById("trackingNumber").value
                                    };
                                    document.getElementById("smtrDetails").value = JSON.stringify(smtrDetails);
                                });
                            <\/script>
                                        </form>
                                    </div>
                                </div>

                                <div class="detail-card">
                                    <div class="detail-grid">
                                        <div class="detail-field"><span class="d-label">Document Number</span><p class="d-value">${transactionData.name || "-"}</p></div>
                                        <div class="detail-field"><span class="d-label">Customer</span>
                                            <select id="customerName" name="customerName" class="form-select" readonly>
                                                <option value="${transactionData.customerName || ""}">${transactionData.customerName || "-"}</option>
                                            </select>
                                        </div>
                                        <div class="detail-field"><span class="d-label">SMTR Type</span><p class="d-value">${transactionData.smtrType || "-"}</p></div>
                                        <div class="detail-field"><span class="d-label">Requested Arrival Date</span><p class="d-value">${transactionData.requestedArrivalDate || "-"}</p></div>

                                        <div class="detail-field"><span class="d-label">Date Needed to Arrive</span><p class="d-value">${transactionData.dateNeededToArrive || "-"}</p></div>
                                        <div class="detail-field"><span class="d-label">Department</span>
                                            <select id="department" name="department" class="form-select" readonly>
                                                <option value="${transactionData.department || ""}">${transactionData.department || "-"}</option>
                                            </select>
                                        </div>
                                        <div class="detail-field"><span class="d-label">Location</span>
                                            <select id="location" name="location" class="form-select" readonly>
                                                <option value="${transactionData.location || ""}">${transactionData.location || "-"}</option>
                                            </select>
                                        </div>
                                        <div class="detail-field"><span class="d-label">Total</span><p class="d-value">${transactionData.totalAmount || "-"}</p></div>

                                        <div class="detail-field"><span class="d-label">Status</span><p class="d-value">${transactionData.status || "-"}</p></div>
                                        <div class="detail-field"><span class="d-label">Purchase Purpose</span><input type="text" id="purchasePurpose" name="purchasePurpose" class="form-control" value="${transactionData.purchasePurpose || ""}" readonly/></div>
                                        <div class="detail-field"><span class="d-label">Tracking Number</span><input type="text" id="trackingNumber" name="trackingNumber" class="form-control" value="${transactionData.trackingNumber || ""}" readonly/></div>
                                        <div class="detail-field"><span class="d-label">Memo</span><textarea id="memo" name="memo" class="form-control" rows="3" readonly>${transactionData.memo || ""}</textarea></div>

                                        <div class="detail-field"><span class="d-label">Next Approver</span><p class="d-value">${transactionData.nextApprover || "-"}</p></div>
                                        <div class="detail-field"><span class="d-label">Ship To</span><textarea id="shipTo" name="shipTo" class="form-control" rows="3" readonly>${transactionData.shipTo || ""}</textarea></div>
                                        <div class="detail-field"><span class="d-label">Currency</span><p class="d-value">${transactionData.currency || "-"}</p></div>
                                    </div>
                                </div>`;

                            var attachments = transactionData.transactionInvoiceAttachment || [];
                            if (attachments.length > 0) {
                                dashboardPage += `<div class="detail-card">
                                    <span class="d-label" style="display:block; margin-bottom: 10px;">Attachments</span>
                                    <div style="display:flex; flex-wrap:wrap; gap: 10px;">`;
                                for (var aIdx = 0; aIdx < attachments.length; aIdx++) {
                                    try {
                                        var transactionAttachment = file.load({ id: attachments[aIdx] });
                                        var transactionAttachmentUrl = transactionAttachment.url;
                                        var host = url.resolveDomain({ hostType: url.HostType.APPLICATION });
                                        var fullUrl = "https://" + host + transactionAttachmentUrl;
                                        dashboardPage += `<a href="${fullUrl}" target="_blank" style="display:inline-flex; align-items:center; gap:8px; padding: 8px 14px; border:1px solid var(--brand-border); border-radius:8px; color: var(--brand-primary); text-decoration:none; font-size: 13.5px; background:#FAFBFD;"><i class="bi bi-paperclip"></i> ${transactionAttachment.name}</a>`;
                                    } catch (e) {
                                        log.error("Attachment Load Error", e);
                                    }
                                }
                                dashboardPage += `</div></div>`;
                            }

                            dashboardPage += `<div class="panel">
                                    <div class="panel-header"><h5>Items</h5></div>
                                    <div class="table-responsive">
                                        <table class="table detail-items-table">
                                            <thead>
                                                <tr>
                                                    <th>Item</th><th>Description</th><th>Quantity</th>
                                                    <th>Rate</th><th>Amount</th>
                                                </tr>
                                            </thead>
                                            <tbody id="itemsTableBodyId">`;

                            if (transactionData.lines && transactionData.lines.length > 0) {
                                for (var i = 0; i < transactionData.lines.length; i++) {
                                    var item = transactionData.lines[i];
                                    dashboardPage += `<tr>
                                        <td>${item.item || "N/A"}</td>
                                        <td>${item.description || "N/A"}</td>
                                        <td>${item.quantity || "N/A"}</td>
                                        <td>${item.unitCost || "N/A"}</td>
                                        <td>${item.amount || "N/A"}</td>
                                    </tr>`;
                                }
                            } else {
                                dashboardPage += `<tr><td colspan="5" style="text-align:center; color: var(--brand-muted); padding: 30px;">No items found</td></tr>`;
                            }

                            dashboardPage += `</tbody></table></div></div></div>`;
                        }

                        dashboardPage += `</div>`; // close #dashboardSection

                        // ─── PROFILE SECTION ─────────────────────────────────────────────────────────
                        if (!Object.keys(userDetailsResponse).length && context.request.parameters.vendorEmail) {
                            try {
                                var profileOptions = {
                                    urlParams: {
                                        userAction: "getEmployeeAccessDetails",
                                        vendorEmail: context.request.parameters.vendorEmail || ""
                                    },
                                    method: "GET",
                                    scriptId: "customscript_tm_rs_pr_po_getdata",
                                    deploymentId: "customdeploy_tm_rs_pr_po_getdata"
                                };
                                userDetailsResponse = JSON.parse(https.requestRestlet(profileOptions).body);
                            } catch (e) {
                                log.debug("Profile fallback fetch error", e);
                            }
                        }

                        var employeeEmail = userDetailsResponse?.roleDetails?.email || context.request.parameters.vendorEmail || "N/A";
                        var employeeName = userDetailsResponse?.roleDetails?.employeeName || userDetailsResponse?.vendorName || "N/A";
                        var roleName = userDetailsResponse?.roleDetails?.smtrRoleName || "N/A";
                        var location = userDetailsResponse?.roleDetails?.location || userDetailsResponse?.roleDetails?.locationName || "N/A";
                        var subsidiary = userDetailsResponse?.roleDetails?.transactionSubsidiary || userDetailsResponse?.roleDetails?.subsidiaryName || "N/A";

                        dashboardPage += `<div id="profileSection" style="display:none;">
                            <h1 class="page-title">My Profile</h1>
                            <p class="page-subtitle">Your account and role details</p>
                            <div class="profile-card">
                                <div class="profile-grid">
                                    <div style="text-align:center;">
                                        <div class="profile-avatar"><i class="bi bi-person-circle"></i></div>
                                    </div>
                                    <div>
                                        <div class="profile-field"><div class="pf-label">Name</div><p class="pf-value">${employeeName || "N/A"}</p></div>
                                        <div class="profile-field"><div class="pf-label">Subsidiary</div><p class="pf-value">${subsidiary || "N/A"}</p></div>
                                        <div class="profile-field"><div class="pf-label">Role</div><p class="pf-value">${roleName || "N/A"}</p></div>
                                    </div>
                                    <div>
                                        <div class="profile-field"><div class="pf-label">Email</div><p class="pf-value">${employeeEmail || "N/A"}</p></div>
                                        <div class="profile-field"><div class="pf-label">Location</div><p class="pf-value">${location || "N/A"}</p></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </main>`;

                        // ─── SCRIPTS ─────────────────────────────────────────────────────────────────
                        dashboardPage += `<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
                            <script>
                                document.addEventListener("DOMContentLoaded", function() {
                                    var sidebar = document.getElementById("appSidebar");
                                    var dashboardSection = document.getElementById("dashboardSection");
                                    var profileSection = document.getElementById("profileSection");
                                    var dashboardNavLink = document.getElementById("dashboardNavLink");
                                    var profileNavLink = document.getElementById("profileNavLink");
                                    var menuToggleBtn = document.getElementById("menuToggleBtn");

                                    var logoutBtn = document.getElementById("logoutBtn");
                                    if (logoutBtn) {
                                        logoutBtn.addEventListener("click", function(e) {
                                            e.preventDefault();
                                            localStorage.setItem("tracknow_smtr_logged_in", "false");
                                            document.getElementById("logoutForm").submit();
                                        });
                                    }

                                    function showSection(sectionToShow) {
                                        if (!dashboardSection || !profileSection) return;
                                        var showingProfile = sectionToShow === "profile";
                                        dashboardSection.style.display = showingProfile ? "none" : "";
                                        profileSection.style.display = showingProfile ? "" : "none";
                                        if (dashboardNavLink) dashboardNavLink.classList.toggle("active", !showingProfile);
                                        if (profileNavLink) profileNavLink.classList.toggle("active", showingProfile);
                                    }

                                    if (dashboardNavLink) dashboardNavLink.addEventListener("click", function(e) { e.preventDefault(); showSection("dashboard"); });
                                    if (profileNavLink) profileNavLink.addEventListener("click", function(e) { e.preventDefault(); showSection("profile"); });

                                    if (menuToggleBtn) menuToggleBtn.addEventListener("click", function(e) { e.preventDefault(); sidebar.classList.toggle("show"); });

                                    var initialActiveDashboard = "${activeDashboard || ""}";
                                    if (initialActiveDashboard === "Profile") showSection("profile");

                                    document.querySelectorAll(".callingmethod").forEach(function(form) {
                                        form.addEventListener('click', function(event) {
                                            if (!['BUTTON','INPUT','SELECT','A','LABEL','TEXTAREA','OPTION'].includes(event.target.tagName)) this.submit();
                                        });
                                    });

                                    document.querySelectorAll(".callingmethod button").forEach(function(btn) {
                                        btn.addEventListener('click', function(event) {
                                            event.preventDefault();
                                            btn.closest('form').submit();
                                        });
                                    });

                                    document.querySelectorAll(".selectingfilter").forEach(function(form) {
                                        form.addEventListener('change', function() { this.submit(); });
                                    });
                                });
                            <\/script>
                            <script>
                            document.addEventListener("DOMContentLoaded", function () {
                                var approveBtn = document.getElementById("approveButton");
                                if (approveBtn) {
                                    approveBtn.addEventListener("click", function (e) {
                                        e.preventDefault();
                                        var statusInput = document.createElement("input");
                                        statusInput.type = "hidden"; statusInput.name = "approvalStatus"; statusInput.value = "Approved";
                                        approveBtn.closest("form").appendChild(statusInput);
                                        approveBtn.closest("form").submit();
                                    });
                                }

                                var fulfillBtn = document.getElementById("fulfillButton");
                                if (fulfillBtn) {
                                    fulfillBtn.addEventListener("click", function (e) {
                                        e.preventDefault();
                                        var smtrDetails = {
                                            purchasePurpose: document.getElementById("purchasePurpose").value,
                                            shipTo: document.getElementById("shipTo").value,
                                            memo: document.getElementById("memo").value,
                                            trackingNumber: document.getElementById("trackingNumber").value
                                        };
                                        document.getElementById("smtrDetails").value = JSON.stringify(smtrDetails);
                                        var statusInput = document.createElement("input");
                                        statusInput.type = "hidden"; statusInput.name = "approvalStatus"; statusInput.value = "Fulfilled";
                                        fulfillBtn.closest("form").appendChild(statusInput);
                                        fulfillBtn.closest("form").submit();
                                    });
                                }
                            });
                            <\/script></body></html>`;

                        context.response.write(dashboardPage);
                    }
                } else {
                    log.debug("OTP Verification Error");
                    context.request.parameters.verified = false;
                    context.response.write(
                        verifyPage(
                            context.request.parameters.employeeInternalId,
                            context.request.parameters.vendorEmail,
                            parseBoolean(context.request.parameters.smtrAccess),
                            parseBoolean(context.request.parameters.smtrSupervisorRoleAcess),
                            "Invalid OTP entered. Please try again."
                        )
                    );
                }
            } else {
                log.debug("OTP Verification Not Attempted");
                if (authentication === false && !context.request.parameters.get_otp && !context.request.parameters.logout) {
                    context.request.parameters.verified = false;
                    context.response.write(
                        "<script>alert('Another Login Request Detected. Due to security reasons, your session has been terminated.');<\/script>" +
                        loginPage()
                    );
                }
            }
        }
    }

    return {
        onRequest: onRequest
    };
});
