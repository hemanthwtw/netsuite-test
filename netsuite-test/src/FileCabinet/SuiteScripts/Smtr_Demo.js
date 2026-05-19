/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
define(['N/log', 'N/file'],
    (log, file) => {
        const getLogoSrc = () => {
            return '';
        };

        const escapeHtml = (value) => {
            return String(value)
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#39;');
        };

        const writeHtmlResponse = (response, html) => {
            response.setHeader({ name: 'Content-Type', value: 'text/html; charset=utf-8' });
            response.write({ output: String(html) });
        };

        function onRequest(scriptContext) {
            const { request, response } = scriptContext;
            const method = request.method && request.method.toUpperCase
                ? request.method.toUpperCase()
                : 'GET';
            const params = request.parameters || {};

            try {
                if (method === 'POST') {
                    const email = (params.email || '').trim();
                    const otp = (params.otp || '').trim();
                    const otpValid = otp.length > 0;

                    if (email && otpValid) {
                        writeHtmlResponse(response, getDashboardHtml(email, otp));
                        return;
                    }

                    const message = 'Please enter your email and the one-time code.';
                    writeHtmlResponse(response, getPageHtml(message, email, otpValid ? 'otp' : 'email'));
                    return;
                }

                writeHtmlResponse(response, getPageHtml());
            } catch (error) {
                log.error({ title: 'SMTRRequestor error', details: error });
                try {
                    writeHtmlResponse(response, getPageHtml('An unexpected error occurred. Please try again later.'));
                } catch (writeError) {
                    log.error({ title: 'SMTRRequestor write fallback failed', details: writeError });
                }
            }
        }

        function getPageHtml(message, email, initialStep) {
            message = message || '';
            email = email || '';
            initialStep = initialStep === 'otp' ? 'otp' : 'email';
            const safeMessage = escapeHtml(message);
            const safeEmail = escapeHtml(email);
            const startOnOtp = initialStep === 'otp';
            const logoSrc = getLogoSrc();

            return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>TRACKnow — Sign in</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Source+Serif+Pro:wght@600;700&display=swap');

        :root {
            --c-bg: #f5f7fa;
            --c-surface: #ffffff;
            --c-ink: #0b1220;
            --c-ink-soft: #334155;
            --c-muted: #64748b;
            --c-line: #e6ebf2;
            --c-line-strong: #d4dbe5;
            --c-navy: #0b2545;
            --c-navy-2: #13315c;
            --c-navy-3: #1d4e89;
            --c-accent: #b08b3e;
            --c-accent-soft: #f3ead7;
            --c-success: #0f7a4a;
            --c-danger: #b91c1c;
            --shadow-sm: 0 1px 2px rgba(11, 18, 32, 0.04), 0 1px 1px rgba(11, 18, 32, 0.03);
            --shadow-md: 0 4px 12px rgba(11, 18, 32, 0.06), 0 1px 3px rgba(11, 18, 32, 0.04);
            --shadow-lg: 0 24px 48px -16px rgba(11, 18, 32, 0.18), 0 8px 16px -8px rgba(11, 18, 32, 0.08);
            --radius: 10px;
            --radius-lg: 14px;
        }

        * { box-sizing: border-box; margin: 0; padding: 0; }

        body {
            font-family: 'Inter', system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
            min-height: 100vh;
            background: var(--c-bg);
            color: var(--c-ink);
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
            overflow-x: hidden;
            font-feature-settings: "ss01","cv11";
        }

        .login-root {
            min-height: 100vh;
            display: flex;
            align-items: stretch;
        }

        /* ---- LEFT PANEL ---- */
        .left-panel {
            flex: 1.05;
            min-width: 360px;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 4.5rem 4rem;
            background:
                radial-gradient(1200px 600px at 85% 110%, rgba(176, 139, 62, 0.18), transparent 60%),
                radial-gradient(900px 500px at 10% 0%, rgba(29, 78, 137, 0.55), transparent 65%),
                linear-gradient(160deg, #07172c 0%, #0b2545 55%, #13315c 100%);
            color: #ffffff;
            position: relative;
            overflow: hidden;
            border-right: 1px solid rgba(255,255,255,0.04);
        }

        .left-panel::before {
            content: '';
            position: absolute;
            inset: 0;
            background-image:
                linear-gradient(rgba(255,255,255,0.045) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255,255,255,0.045) 1px, transparent 1px);
            background-size: 56px 56px;
            mask-image: radial-gradient(ellipse at 30% 40%, #000 30%, transparent 75%);
            -webkit-mask-image: radial-gradient(ellipse at 30% 40%, #000 30%, transparent 75%);
            pointer-events: none;
        }

        .left-panel::after {
            content: '';
            position: absolute;
            left: 4rem;
            top: 4.5rem;
            width: 56px;
            height: 2px;
            background: var(--c-accent);
        }

        .left-content {
            position: relative;
            z-index: 2;
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            justify-content: center;
            gap: 1.5rem;
            max-width: 480px;
            width: 100%;
        }

        .brand-welcome {
            font-size: 0.72rem;
            letter-spacing: 0.38em;
            text-transform: uppercase;
            color: var(--c-accent);
            font-weight: 700;
            margin-bottom: 0.25rem;
        }

        .brand-title {
            font-family: 'Source Serif Pro', Georgia, serif;
            font-size: clamp(3rem, 4.4vw, 4.6rem);
            line-height: 1;
            font-weight: 700;
            letter-spacing: -0.02em;
            margin: 0;
            color: #ffffff;
        }

        .brand-copy { display: flex; flex-direction: column; gap: 0.6rem; }

        .left-note {
            font-size: 1.02rem;
            color: rgba(255, 255, 255, 0.74);
            line-height: 1.7;
            max-width: 420px;
            font-weight: 400;
        }

        .left-content::after {
            content: 'Enterprise Procurement · Secure Workspace';
            position: absolute;
            bottom: -10rem;
            left: 0;
            font-size: 0.72rem;
            letter-spacing: 0.28em;
            text-transform: uppercase;
            color: rgba(255,255,255,0.4);
            font-weight: 600;
        }

        /* hide the playful shapes — keep DOM, suppress visually */
        .shape-1, .shape-2, .shape-3 { display: none; }

        /* ---- RIGHT PANEL ---- */
        .right-panel {
            flex: 1;
            min-width: 360px;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 3rem 2rem;
            background: var(--c-bg);
            position: relative;
        }

        .right-panel::before {
            content: '';
            position: absolute;
            inset: 0;
            background:
                radial-gradient(800px 280px at center 0%, rgba(29, 78, 137, 0.06), transparent 70%);
            pointer-events: none;
        }

        .card {
            width: 100%;
            max-width: 460px;
            background: var(--c-surface);
            border-radius: var(--radius-lg);
            box-shadow: var(--shadow-lg);
            overflow: hidden;
            border: 1px solid var(--c-line);
            position: relative;
            z-index: 1;
        }

        .card-header {
            padding: 1.1rem 1.8rem;
            background: var(--c-navy);
            color: #ffffff;
            font-size: 0.78rem;
            font-weight: 700;
            letter-spacing: 0.32em;
            text-transform: uppercase;
            text-align: center;
            border-bottom: 2px solid var(--c-accent);
        }

        .card-body { padding: 2.4rem 2.2rem 2.2rem; }

        .form-container {
            width: 100%;
            position: relative;
            display: none;
        }
        .form-container.is-active { display: block; }

        .fade-in { animation: fadeSlideIn 0.45s cubic-bezier(0.22, 1, 0.36, 1) both; }
        @keyframes fadeSlideIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }

        .form-header { text-align: center; margin-bottom: 1.8rem; }

        .form-title {
            font-family: 'Source Serif Pro', Georgia, serif;
            font-size: 1.7rem;
            font-weight: 700;
            color: var(--c-ink);
            letter-spacing: -0.01em;
            margin-bottom: 0.5rem;
        }

        .divider {
            width: 36px;
            height: 2px;
            margin: 0.6rem auto 1.1rem;
            border-radius: 2px;
            background: var(--c-accent);
        }

        .form-subtitle {
            font-size: 0.92rem;
            color: var(--c-muted);
            line-height: 1.6;
        }

        .form-subtitle strong {
            color: var(--c-ink);
            font-weight: 600;
        }

        /* ---- FIELDS ---- */
        .field-group {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
            margin-bottom: 1.4rem;
        }

        .field-label {
            font-size: 0.72rem;
            font-weight: 700;
            color: var(--c-ink-soft);
            letter-spacing: 0.12em;
            text-transform: uppercase;
            text-align: left;
        }

        .input-wrapper { position: relative; }

        .input-icon {
            position: absolute;
            left: 0.95rem;
            top: 50%;
            transform: translateY(-50%);
            width: 18px;
            height: 18px;
            color: var(--c-muted);
            display: flex;
            align-items: center;
            justify-content: center;
            pointer-events: none;
        }

        .field-input {
            width: 100%;
            padding: 0.95rem 1rem 0.95rem 2.85rem;
            border: 1px solid var(--c-line-strong);
            border-radius: var(--radius);
            font-size: 0.95rem;
            color: var(--c-ink);
            background: #fbfcfe;
            outline: none;
            transition: border-color 0.18s ease, box-shadow 0.18s ease, background 0.18s ease;
        }

        .field-input::placeholder { color: #94a3b8; }

        .field-input:focus {
            border-color: var(--c-navy-3);
            background: #ffffff;
            box-shadow: 0 0 0 4px rgba(29, 78, 137, 0.12);
        }

        .field-input.field-input--error {
            border-color: var(--c-danger);
            box-shadow: 0 0 0 4px rgba(185, 28, 28, 0.08);
        }

        .field-error {
            font-size: 0.78rem;
            color: var(--c-danger);
            font-weight: 600;
            margin-top: 0.15rem;
            text-align: left;
        }

        /* ---- BUTTON ---- */
        .btn-primary {
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.55rem;
            padding: 0.95rem 1.4rem;
            background: var(--c-navy);
            border: 1px solid var(--c-navy);
            border-radius: var(--radius);
            color: #fff;
            font-size: 0.9rem;
            font-weight: 600;
            letter-spacing: 0.04em;
            cursor: pointer;
            transition: background 0.18s ease, box-shadow 0.18s ease, transform 0.1s ease;
            position: relative;
            overflow: hidden;
        }

        .btn-primary:hover:not(.loading) {
            background: var(--c-navy-2);
            box-shadow: 0 10px 24px -10px rgba(11, 37, 69, 0.55);
        }

        .btn-primary:active:not(.loading) { transform: translateY(1px); }

        .btn-primary.loading {
            background: var(--c-navy-2);
            cursor: not-allowed;
        }

        .btn-icon { transition: transform 0.2s ease; }
        .btn-primary:hover:not(.loading) .btn-icon { transform: translateX(3px); }

        .spinner {
            display: inline-block;
            width: 14px;
            height: 14px;
            border: 2px solid rgba(255, 255, 255, 0.3);
            border-top-color: #fff;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
            margin-right: 0.5rem;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* ---- OTP ---- */
        .otp-icon {
            width: 52px;
            height: 52px;
            border-radius: 12px;
            background: var(--c-accent-soft);
            display: flex;
            align-items: center;
            justify-content: center;
            color: var(--c-accent);
            margin: 0 auto 1rem;
            border: 1px solid rgba(176, 139, 62, 0.25);
        }

        .otp-group {
            display: flex;
            gap: 0.65rem;
            margin-bottom: 1.6rem;
            justify-content: center;
        }

        .otp-wrapper { position: relative; }

        .otp-input {
            width: 62px;
            height: 64px;
            text-align: center;
            font-size: 1.5rem;
            font-weight: 600;
            color: var(--c-ink);
            border: 1px solid var(--c-line-strong);
            border-radius: var(--radius);
            background: #fbfcfe;
            outline: none;
            transition: border-color 0.18s ease, box-shadow 0.18s ease, background 0.18s ease;
            caret-color: var(--c-navy-3);
            font-variant-numeric: tabular-nums;
        }

        .otp-input:focus {
            border-color: var(--c-navy-3);
            background: #fff;
            box-shadow: 0 0 0 4px rgba(29, 78, 137, 0.12);
        }

        .otp-input.otp-input--filled {
            border-color: var(--c-navy-3);
            background: #fff;
            color: var(--c-navy);
        }

        .verifying-text {
            text-align: center;
            font-size: 0.82rem;
            color: var(--c-navy-3);
            font-weight: 600;
            letter-spacing: 0.08em;
            text-transform: uppercase;
            margin-bottom: 1rem;
        }

        /* ---- RESEND ---- */
        .resend-text {
            font-size: 0.86rem;
            color: var(--c-muted);
            text-align: center;
            margin-top: 0.4rem;
        }

        .resend-btn {
            background: none;
            border: none;
            color: var(--c-navy-3);
            font-size: 0.86rem;
            font-weight: 600;
            cursor: pointer;
            padding: 0 0 1px;
            border-bottom: 1px solid transparent;
            transition: border-color 0.18s ease, color 0.18s ease;
        }
        .resend-btn:hover { border-bottom-color: var(--c-navy-3); color: var(--c-navy); }

        /* ---- BACK BUTTON ---- */
        .back-btn {
            background: none;
            border: none;
            color: var(--c-muted);
            font-size: 0.82rem;
            font-weight: 600;
            cursor: pointer;
            padding: 0.4rem 0;
            margin-bottom: 1rem;
            transition: color 0.18s ease;
            display: inline-flex;
            align-items: center;
            letter-spacing: 0.04em;
        }
        .back-btn:hover { color: var(--c-navy); }

        /* ---- VERIFIED ---- */
        .verified-container { text-align: center; }

        .success-icon {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 64px;
            height: 64px;
            border-radius: 50%;
            background: #e8f4ee;
            color: var(--c-success);
            margin-bottom: 1.2rem;
            border: 1px solid rgba(15, 122, 74, 0.2);
        }

        .success-title { color: var(--c-success); margin-bottom: 0.4rem; }
        .success-sub { color: var(--c-muted); margin-bottom: 1.4rem; }

        .progress-bar {
            width: 100%;
            height: 3px;
            background: var(--c-line);
            border-radius: 2px;
            overflow: hidden;
        }

        .progress-fill {
            height: 100%;
            background: var(--c-navy);
            animation: progressFill 2s cubic-bezier(0.22, 1, 0.36, 1);
        }
        @keyframes progressFill { from { width: 0; } to { width: 100%; } }

        .footer-text {
            font-size: 0.74rem;
            color: #94a3b8;
            text-align: center;
            margin-top: 1.4rem;
            letter-spacing: 0.06em;
        }

        /* ---- RESPONSIVE ---- */
        @media (max-width: 1024px) {
            .left-panel { padding: 3rem 2.5rem; }
        }

        @media (max-width: 768px) {
            .login-root { flex-direction: column; }
            .left-panel {
                width: 100%;
                padding: 2.5rem 1.75rem;
                min-height: 220px;
            }
            .right-panel { width: 100%; padding: 2rem 1.25rem; }
            .card-body { padding: 1.8rem 1.5rem; }
            .form-title { font-size: 1.4rem; }
            .otp-input { width: 52px; height: 56px; font-size: 1.25rem; }
        }
    </style>
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
                        <input type="hidden" name="email" id="email-hidden" value="${safeEmail}" />
                        <input type="hidden" name="otp" id="otp-hidden" value="" />

                        <div class="form-container fade-in ${startOnOtp ? '' : 'is-active'}" id="step-email">
                            <div class="form-header">
                                <h1 class="form-title">SMTR Supervisor</h1>
                                <div class="divider"></div>
                                <p class="form-subtitle">Enter your email to receive your one-time passcode.</p>
                            </div>

                            ${safeMessage ? `<div style="text-align: center; margin-bottom: 1rem; color: #ef4444; font-weight: 500; font-size: 0.9rem;">${safeMessage}</div>` : ''}

                            <div class="field-group">
                                <label for="email" class="field-label">Email</label>
                                <div class="input-wrapper">
                                    <span class="input-icon" aria-hidden="true">
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                            <path d="M4 4h16v16H4z"></path>
                                            <polyline points="22,6 12,13 2,6"></polyline>
                                        </svg>
                                    </span>
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        class="field-input"
                                        placeholder="Enter your email"
                                        value="${safeEmail}"
                                        autocomplete="email"
                                        autofocus
                                    />
                                </div>
                                <span class="field-error" id="email-error" style="display: none;"></span>
                            </div>

                            <button type="button" class="btn-primary" id="btn-continue">
                                <span>Get OTP</span>
                                <svg class="btn-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                    <line x1="5" y1="12" x2="19" y2="12"></line>
                                    <polyline points="12 5 19 12 12 19"></polyline>
                                </svg>
                            </button>
                        </div>

                        <div class="form-container fade-in ${startOnOtp ? 'is-active' : ''}" id="step-otp">
                            <button type="button" class="back-btn" id="btn-back">
                                ← Back
                            </button>
                            <div class="form-header">
                                <div class="otp-icon">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                                    </svg>
                                </div>
                                <h1 class="form-title">SMTR Supervisor</h1>
                                <div class="divider"></div>
                                <p class="form-subtitle">Enter the 4-digit code sent to<br /><strong id="otp-email-display">${safeEmail || 'your email'}</strong></p>
                            </div>

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

                            <p class="resend-text">
                                Didn't receive the code?{' '}
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
        (function () {
            var form = document.getElementById('login-form');
            var stepEmail = document.getElementById('step-email');
            var stepOtp = document.getElementById('step-otp');
            var stepVerified = document.getElementById('step-verified');
            var emailInput = document.getElementById('email');
            var emailError = document.getElementById('email-error');
            var emailHidden = document.getElementById('email-hidden');
            var otpHidden = document.getElementById('otp-hidden');
            var otpDisplay = document.getElementById('otp-email-display');
            var btnContinue = document.getElementById('btn-continue');
            var btnBack = document.getElementById('btn-back');
            var btnResend = document.getElementById('btn-resend');
            var verifyingIndicator = document.getElementById('verifying-indicator');
            var otpInputs = [
                document.getElementById('otp-1'),
                document.getElementById('otp-2'),
                document.getElementById('otp-3'),
                document.getElementById('otp-4')
            ];

            function validateEmail(val) {
                return typeof val === 'string' && val.trim().length > 2 && val.indexOf('@') > 0;
            }

            function showStep(stepName) {
                stepEmail.classList.toggle('is-active', stepName === 'email');
                stepOtp.classList.toggle('is-active', stepName === 'otp');
                stepVerified.classList.toggle('is-active', stepName === 'verified');

                if (stepName === 'otp') {
                    setTimeout(function () { otpInputs[0].focus(); }, 500);
                } else if (stepName === 'email') {
                    setTimeout(function () { emailInput.focus(); }, 250);
                }
            }

            function syncOtpHidden() {
                otpHidden.value = otpInputs.map(function (el) { return el.value; }).join('');
                otpInputs.forEach(function (input) {
                    input.classList.toggle('otp-input--filled', !!input.value);
                });
            }

            btnContinue.addEventListener('click', function () {
                var val = emailInput.value.trim();
                if (!validateEmail(val)) {
                    emailError.textContent = 'Please enter a valid email address.';
                    emailError.style.display = 'block';
                    emailInput.classList.add('field-input--error');
                    return;
                }
                emailError.style.display = 'none';
                emailInput.classList.remove('field-input--error');

                btnContinue.classList.add('loading');
                btnContinue.disabled = true;
                btnContinue.innerHTML = '<span class="spinner"></span><span>Sending code...</span>';

                setTimeout(function () {
                    btnContinue.classList.remove('loading');
                    btnContinue.disabled = false;
                    btnContinue.innerHTML = '<span>Get OTP</span><svg class="btn-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>';
                   
                    emailHidden.value = val;
                    otpDisplay.textContent = val;
                    showStep('otp');
                }, 1200);
            });

            emailInput.addEventListener('input', function () {
                emailError.style.display = 'none';
                emailInput.classList.remove('field-input--error');
            });

            btnBack.addEventListener('click', function () {
                otpInputs.forEach(function (el) { el.value = ''; el.classList.remove('otp-input--filled'); });
                syncOtpHidden();
                showStep('email');
            });

            btnResend.addEventListener('click', function() {
                alert('Verification code resent to ' + emailHidden.value);
            });

            function handleOtpSubmit() {
                verifyingIndicator.style.display = 'block';
                setTimeout(function () {
                    verifyingIndicator.style.display = 'none';
                    showStep('verified');
                    setTimeout(function () {
                        form.submit();
                    }, 1800);
                }, 1000);
            }

            otpInputs.forEach(function (input, index) {
                input.addEventListener('input', function () {
                    input.value = input.value.replace(/\\D/g, '').slice(0, 1);
                    syncOtpHidden();
                    if (input.value && index < otpInputs.length - 1) {
                        otpInputs[index + 1].focus();
                    }
                    if (otpInputs.every(function (el) { return el.value !== ''; }) && index === 3) {
                        handleOtpSubmit();
                    }
                });

                input.addEventListener('keydown', function (event) {
                    if (event.key === 'Backspace' && !input.value && index > 0) {
                        otpInputs[index - 1].focus();
                    }
                });

                document.getElementById('otp-group-element').addEventListener('paste', function (event) {
                    event.preventDefault();
                    var pasted = (event.clipboardData || window.clipboardData).getData('text').replace(/\\D/g, '').slice(0, 4);
                    pasted.split('').forEach(function (ch, i) {
                        if (otpInputs[i]) {
                            otpInputs[i].value = ch;
                        }
                    });
                    syncOtpHidden();
                    if (pasted.length === 4) {
                        setTimeout(handleOtpSubmit, 300);
                    } else {
                        otpInputs[Math.min(pasted.length, otpInputs.length - 1)].focus();
                    }
                });
            });

            form.addEventListener('submit', function (event) {
                event.preventDefault();
                syncOtpHidden();
                if (otpHidden.value.length === 4) {
                    handleOtpSubmit();
                } else {
                    otpInputs[0].focus();
                }
            });

            if (${startOnOtp ? 'true' : 'false'}) {
                emailInput.value = emailHidden.value;
                otpDisplay.textContent = emailHidden.value || 'your email';
            }
        })();
    </script>
</body>
</html>`;
        }

        function getDashboardHtml(email, otp) {
            const safeEmail = escapeHtml(email || 'Supervisor');
            const safeOtp = escapeHtml(otp || '');
            return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>TRACKnow Requestor Dashboard</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Source+Serif+Pro:wght@600;700&display=swap');

        :root {
            --c-bg: #f5f7fa;
            --c-surface: #ffffff;
            --c-surface-2: #f9fafc;
            --c-ink: #0b1220;
            --c-ink-soft: #334155;
            --c-muted: #64748b;
            --c-muted-2: #94a3b8;
            --c-line: #e6ebf2;
            --c-line-strong: #d4dbe5;
            --c-navy: #0b2545;
            --c-navy-2: #13315c;
            --c-navy-3: #1d4e89;
            --c-accent: #b08b3e;
            --c-accent-soft: #f3ead7;
            --c-success: #0f7a4a;
            --c-success-soft: #e8f4ee;
            --c-warning: #b45309;
            --c-warning-soft: #fdf3e3;
            --c-danger: #b91c1c;
            --c-info: #1d4e89;
            --c-info-soft: #e8eff8;
            --shadow-sm: 0 1px 2px rgba(11, 18, 32, 0.04), 0 1px 1px rgba(11, 18, 32, 0.03);
            --shadow-md: 0 4px 12px rgba(11, 18, 32, 0.06), 0 1px 3px rgba(11, 18, 32, 0.04);
            --shadow-lg: 0 24px 48px -16px rgba(11, 18, 32, 0.18), 0 8px 16px -8px rgba(11, 18, 32, 0.08);
            --radius: 10px;
            --radius-lg: 14px;
        }

        * { box-sizing: border-box; margin: 0; padding: 0; }

        body {
            font-family: 'Inter', system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
            background-color: var(--c-bg);
            color: var(--c-ink-soft);
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            overflow-x: hidden;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
            font-feature-settings: "ss01","cv11";
        }

        button { font: inherit; border: none; background: none; cursor: pointer; }
        a { text-decoration: none; color: inherit; }

        .dashboard-root { display: flex; min-height: 100vh; }

        /* ---- SIDEBAR ---- */
        .sidebar {
            width: 248px;
            background: linear-gradient(180deg, #07172c 0%, #0b2545 100%);
            padding: 1.5rem 0.85rem 1rem;
            display: flex;
            flex-direction: column;
            gap: 1.25rem;
            flex-shrink: 0;
            border-right: 1px solid rgba(255, 255, 255, 0.04);
            position: relative;
        }

        .sidebar::before {
            content: '';
            position: absolute;
            top: 0; left: 0; right: 0;
            height: 3px;
            background: var(--c-accent);
        }

        .brand {
            color: #ffffff;
            font-family: 'Source Serif Pro', Georgia, serif;
            font-size: 1.1rem;
            font-weight: 700;
            letter-spacing: 0.26em;
            text-transform: uppercase;
            padding: 0.6rem 0.65rem 1rem;
            border-bottom: 1px solid rgba(255,255,255,0.06);
            margin-bottom: 0.25rem;
            position: relative;
        }

        .brand::after {
            content: 'Procurement Workspace';
            display: block;
            font-family: 'Inter', sans-serif;
            font-size: 0.62rem;
            font-weight: 600;
            color: var(--c-accent);
            letter-spacing: 0.22em;
            margin-top: 0.4rem;
            text-transform: uppercase;
        }

        .nav { display: flex; flex-direction: column; gap: 0.15rem; flex: 1; padding-top: 0.5rem; }

        .nav-item {
            display: flex;
            align-items: center;
            gap: 0.7rem;
            padding: 0.65rem 0.75rem;
            border-radius: 8px;
            color: rgba(255,255,255,0.65);
            cursor: pointer;
            transition: background-color 0.15s ease, color 0.15s ease;
            font-size: 0.84rem;
            font-weight: 500;
            position: relative;
        }

        .nav-item svg { width: 16px; height: 16px; flex-shrink: 0; stroke: currentColor; fill: none; stroke-width: 2; }

        .nav-item.active {
            background-color: rgba(255,255,255,0.06);
            color: #ffffff;
            font-weight: 600;
        }
        .nav-item.active::before {
            content: '';
            position: absolute;
            left: -0.85rem;
            top: 22%;
            bottom: 22%;
            width: 3px;
            background: var(--c-accent);
            border-radius: 0 3px 3px 0;
        }

        .nav-item:hover:not(.active) {
            background-color: rgba(255, 255, 255, 0.04);
            color: #ffffff;
        }

        .nav-divider { height: 1px; background-color: rgba(255, 255, 255, 0.06); margin: 0.6rem 0.25rem; }

        .sidebar-footer {
            margin-top: auto;
            display: flex;
            align-items: center;
            gap: 0.65rem;
            padding: 0.85rem 0.65rem;
            border-top: 1px solid rgba(255, 255, 255, 0.06);
            color: #ffffff;
        }

        .user-avatar {
            width: 34px;
            height: 34px;
            border-radius: 8px;
            background: var(--c-accent);
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            font-size: 0.78rem;
            color: #0b2545;
            flex-shrink: 0;
            letter-spacing: 0.04em;
        }

        .user-info { flex: 1; display: flex; flex-direction: column; overflow: hidden; }

        .user-name {
            font-size: 0.8rem;
            font-weight: 600;
            color: #ffffff;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .user-role { font-size: 0.68rem; color: rgba(255,255,255,0.55); letter-spacing: 0.04em; }
        .sidebar-chevron { color: rgba(255,255,255,0.5); width: 14px; height: 14px; flex-shrink: 0; }

        /* ---- MAIN CONTENT ---- */
        .main { flex: 1; display: flex; flex-direction: column; min-width: 0; }

        /* ---- TOPBAR ---- */
        .topbar {
            height: 60px;
            background-color: var(--c-surface);
            border-bottom: 1px solid var(--c-line);
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 1.75rem;
            flex-shrink: 0;
        }

        .topbar-left { display: flex; align-items: center; gap: 1.25rem; flex: 1; }

        .hamburger-btn { color: var(--c-muted); display: flex; align-items: center; transition: color 0.15s ease; }
        .hamburger-btn:hover { color: var(--c-ink); }
        .hamburger-btn svg { width: 18px; height: 18px; stroke-width: 2; }

        .search-bar {
            display: flex;
            align-items: center;
            gap: 0.55rem;
            background-color: var(--c-surface-2);
            border-radius: 8px;
            padding: 0.45rem 0.7rem;
            width: 320px;
            border: 1px solid var(--c-line);
            transition: border-color 0.15s ease, background 0.15s ease, box-shadow 0.15s ease;
        }

        .search-bar:focus-within {
            border-color: var(--c-navy-3);
            background-color: #ffffff;
            box-shadow: 0 0 0 4px rgba(29, 78, 137, 0.08);
        }

        .search-bar svg { width: 14px; height: 14px; color: var(--c-muted-2); stroke-width: 2.5; }
        .search-bar input {
            border: none; background: transparent; outline: none;
            font-size: 0.85rem; color: var(--c-ink-soft); width: 100%;
        }
        .search-bar input::placeholder { color: var(--c-muted-2); }

        .search-shortcut {
            font-size: 0.66rem;
            color: var(--c-muted);
            background-color: var(--c-surface);
            border: 1px solid var(--c-line);
            padding: 0.1rem 0.35rem;
            border-radius: 4px;
            font-weight: 600;
            letter-spacing: 0.04em;
        }

        .topbar-right { display: flex; align-items: center; gap: 1.5rem; }

        .notification-badge {
            position: relative;
            cursor: pointer;
            color: var(--c-ink-soft);
            display: flex;
            align-items: center;
            transition: color 0.15s ease;
            padding: 0.35rem;
            border-radius: 8px;
        }
        .notification-badge:hover { color: var(--c-ink); background: var(--c-surface-2); }
        .notification-badge svg { width: 18px; height: 18px; stroke-width: 2; }

        .notification-count {
            position: absolute;
            top: -2px; right: -2px;
            background-color: var(--c-accent);
            color: #0b2545;
            font-size: 0.62rem;
            font-weight: 800;
            min-width: 16px;
            height: 16px;
            padding: 0 4px;
            border-radius: 999px;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 2px solid #fff;
        }

        .top-profile-dropdown {
            display: flex;
            align-items: center;
            gap: 0.55rem;
            cursor: pointer;
            padding: 0.4rem 0.65rem 0.4rem 0.4rem;
            border-radius: 8px;
            transition: background-color 0.15s ease;
            border: 1px solid transparent;
        }
        .top-profile-dropdown:hover { background-color: var(--c-surface-2); border-color: var(--c-line); }

        .top-profile-dropdown::before {
            content: 'SM';
            width: 28px; height: 28px;
            border-radius: 6px;
            background: var(--c-navy);
            color: #fff;
            font-size: 0.72rem; font-weight: 700;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            letter-spacing: 0.04em;
        }

        .top-profile-name { font-size: 0.84rem; font-weight: 600; color: var(--c-ink); }
        .top-profile-chevron { width: 14px; height: 14px; color: var(--c-muted); stroke-width: 2.5; }

        /* ---- CONTAINER ---- */
        .container { padding: 1.75rem 1.75rem 2rem; display: flex; flex-direction: column; gap: 1.5rem; flex: 1; }

        /* ---- HEADER TITLE BLOCK ---- */
        .page-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding-bottom: 1rem;
            border-bottom: 1px solid var(--c-line);
        }

        .page-title {
            font-family: 'Source Serif Pro', Georgia, serif;
            font-size: 1.65rem;
            font-weight: 700;
            color: var(--c-ink);
            letter-spacing: -0.015em;
        }

        .page-title strong { font-weight: 700; color: var(--c-navy); }
        .page-subtitle { font-size: 0.82rem; color: var(--c-muted); margin-top: 0.2rem; }

        .btn-request-pr {
            display: inline-flex;
            align-items: center;
            gap: 0.45rem;
            background-color: var(--c-navy);
            color: #ffffff;
            padding: 0.6rem 1.1rem;
            border-radius: 8px;
            font-size: 0.82rem;
            font-weight: 600;
            letter-spacing: 0.02em;
            transition: background-color 0.15s ease, box-shadow 0.15s ease, transform 0.1s ease;
            border: 1px solid var(--c-navy);
            box-shadow: var(--shadow-sm);
        }
        .btn-request-pr:hover { background-color: var(--c-navy-2); box-shadow: 0 8px 18px -8px rgba(11,37,69,0.55); }
        .btn-request-pr:active { transform: translateY(1px); }
        .btn-request-pr svg { width: 14px; height: 14px; stroke-width: 2.5; }

        /* ---- METRICS GRID ---- */
        .cards-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; }

        .metric-card {
            background-color: var(--c-surface);
            border: 1px solid var(--c-line);
            border-radius: var(--radius-lg);
            padding: 1.1rem 1.15rem;
            position: relative;
            overflow: hidden;
            box-shadow: var(--shadow-sm);
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            min-height: 122px;
            transition: box-shadow 0.18s ease, transform 0.18s ease;
        }
        .metric-card:hover { box-shadow: var(--shadow-md); transform: translateY(-1px); }

        .metric-card::before {
            content: '';
            position: absolute;
            top: 0; left: 0; right: 0;
            height: 3px;
            background: var(--c-line);
        }
        .metric-card.primary::before { background: var(--c-accent); }
        .metric-card.orange::before  { background: var(--c-warning); }
        .metric-card.green::before   { background: var(--c-success); }
        .metric-card.blue::before    { background: var(--c-navy-3); }

        .metric-card.primary {
            background: linear-gradient(155deg, #0b2545 0%, #13315c 100%);
            color: #ffffff;
            border-color: transparent;
        }

        .card-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.4rem; }

        .metric-icon-badge {
            width: 30px; height: 30px;
            border-radius: 8px;
            display: flex; align-items: center; justify-content: center;
            flex-shrink: 0;
        }
        .metric-card.primary .metric-icon-badge { background-color: rgba(255, 255, 255, 0.1); color: #ffffff; }
        .metric-card.orange   .metric-icon-badge { background-color: var(--c-warning-soft); color: var(--c-warning); }
        .metric-card.green    .metric-icon-badge { background-color: var(--c-success-soft); color: var(--c-success); }
        .metric-card.blue     .metric-icon-badge { background-color: var(--c-info-soft); color: var(--c-info); }
        .metric-icon-badge svg { width: 14px; height: 14px; stroke-width: 2.2; }

        .card-watermark {
            position: absolute;
            bottom: -14px; right: -10px;
            opacity: 0.06;
            pointer-events: none;
            width: 88px; height: 88px;
            color: currentColor;
        }

        .metric-label {
            font-size: 0.68rem;
            font-weight: 700;
            color: var(--c-muted);
            text-transform: uppercase;
            letter-spacing: 0.1em;
        }
        .metric-card.primary .metric-label { color: rgba(255, 255, 255, 0.72); }

        .metric-value {
            font-family: 'Source Serif Pro', Georgia, serif;
            font-size: 1.75rem;
            font-weight: 700;
            color: var(--c-ink);
            line-height: 1.1;
            margin: 0.15rem 0 0.2rem;
            letter-spacing: -0.015em;
            font-variant-numeric: tabular-nums;
        }
        .metric-card.primary .metric-value { color: #ffffff; }

        .metric-note { font-size: 0.74rem; color: var(--c-muted); font-weight: 500; }
        .metric-card.primary .metric-note { color: rgba(255, 255, 255, 0.7); }

        /* ---- TABLE SECTION ---- */
        .table-card {
            background-color: var(--c-surface);
            border: 1px solid var(--c-line);
            border-radius: var(--radius-lg);
            overflow: hidden;
            box-shadow: var(--shadow-sm);
            display: flex;
            flex-direction: column;
        }

        /* ---- REQUEST PAGE VIEW ---- */
        .request-modal-overlay {
            display: none;
            width: 100%;
        }
        .request-modal-overlay.open { display: block; }

        .request-modal {
            width: 100%;
            background: var(--c-bg);
            border-radius: var(--radius-lg);
            padding: 1rem 0;
        }

        .request-modal-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 1rem;
            margin-bottom: 1.25rem;
        }

        .request-label {
            font-size: 0.72rem;
            font-weight: 700;
            letter-spacing: 0.18em;
            text-transform: uppercase;
            color: var(--c-muted);
            margin-bottom: 0.25rem;
        }

        .request-title {
            font-family: 'Source Serif Pro', Georgia, serif;
            font-size: 1.5rem;
            font-weight: 700;
            color: var(--c-ink);
            margin: 0;
            letter-spacing: -0.01em;
        }

        .modal-close {
            width: 38px; height: 38px;
            border-radius: 8px;
            background: var(--c-surface);
            color: var(--c-ink);
            font-size: 1.3rem;
            line-height: 1;
            display: flex; align-items: center; justify-content: center;
            border: 1px solid var(--c-line);
            cursor: pointer;
            transition: background 0.15s ease, color 0.15s ease;
        }
        .modal-close:hover { background: #f1f5f9; color: var(--c-danger); }

        .request-stepper {
            display: flex;
            gap: 0.5rem;
            margin-bottom: 1.5rem;
            background: var(--c-surface);
            border: 1px solid var(--c-line);
            border-radius: 999px;
            padding: 0.35rem;
            box-shadow: var(--shadow-sm);
        }

        .step {
            display: flex; align-items: center; gap: 0.55rem;
            padding: 0.5rem 0.95rem;
            border-radius: 999px;
            background: transparent;
            color: var(--c-muted);
        }
        .step.active { background: var(--c-navy); color: #ffffff; }

        .step span {
            display: inline-flex; align-items: center; justify-content: center;
            width: 22px; height: 22px;
            border-radius: 50%;
            background: var(--c-line);
            color: var(--c-ink-soft);
            font-size: 0.72rem;
            font-weight: 700;
        }
        .step.active span { background: var(--c-accent); color: #0b2545; }
        .step p { margin: 0; font-size: 0.78rem; font-weight: 600; letter-spacing: 0.02em; }

        .request-form { display: grid; grid-template-columns: 2fr 1fr; gap: 1.25rem; }

        .request-card {
            background: var(--c-surface);
            border: 1px solid var(--c-line);
            border-radius: var(--radius-lg);
            padding: 1.5rem;
            box-shadow: var(--shadow-sm);
        }

        .request-card-header { display: flex; align-items: center; gap: 0.85rem; margin-bottom: 1rem; }
        .request-card-header.simple { margin-bottom: 1rem; }

        .request-card-number {
            width: 32px; height: 32px;
            border-radius: 8px;
            background: var(--c-info-soft);
            color: var(--c-navy);
            display: inline-flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
        }

        .request-card-title {
            font-family: 'Source Serif Pro', Georgia, serif;
            font-size: 1.05rem;
            font-weight: 700;
            color: var(--c-ink);
            margin-bottom: 0.2rem;
        }
        .request-card-subtitle { margin: 0; font-size: 0.8rem; color: var(--c-muted); }

        .request-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1rem; margin-bottom: 1rem; }

        .request-field {
            display: flex;
            flex-direction: column;
            gap: 0.4rem;
            font-size: 0.74rem;
            color: var(--c-ink-soft);
        }
        .request-field span {
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            color: var(--c-muted);
        }

        .request-field input,
        .request-field select,
        .request-field textarea {
            width: 100%;
            min-height: 40px;
            padding: 0.7rem 0.85rem;
            border: 1px solid var(--c-line-strong);
            border-radius: 8px;
            background: #fbfcfe;
            color: var(--c-ink);
            font-size: 0.88rem;
            outline: none;
            transition: border-color 0.15s ease, box-shadow 0.15s ease, background 0.15s ease;
            font-family: inherit;
        }
        .request-field input:focus,
        .request-field select:focus,
        .request-field textarea:focus {
            border-color: var(--c-navy-3);
            background: #ffffff;
            box-shadow: 0 0 0 4px rgba(29, 78, 137, 0.1);
        }
        .request-field textarea { resize: vertical; min-height: 110px; line-height: 1.5; }

        .request-file input[type="file"] { padding: 0.55rem 0.7rem; border-radius: 8px; background: #ffffff; }
        .request-notes { grid-column: span 2; }
        .request-items-card { grid-column: span 2; }

        .item-table-wrapper {
            border: 1px solid var(--c-line);
            border-radius: var(--radius);
            overflow: hidden;
            background: #fff;
        }

        .item-table-header {
            display: grid;
            grid-template-columns: 2fr 1fr 1fr 1fr auto;
            gap: 0.75rem;
            background: var(--c-surface-2);
            padding: 0.9rem 1rem;
            font-size: 0.7rem;
            font-weight: 700;
            color: var(--c-muted);
            text-transform: uppercase;
            letter-spacing: 0.08em;
            border-bottom: 1px solid var(--c-line);
        }

        .item-row {
            display: grid;
            grid-template-columns: 2fr 1fr 1fr 1fr auto;
            gap: 0.75rem;
            align-items: center;
            padding: 0.85rem 1rem;
            background: #ffffff;
            border-bottom: 1px solid var(--c-line);
        }

        .item-row select,
        .item-row input {
            width: 100%;
            border-radius: 8px;
            border: 1px solid var(--c-line-strong);
            background: #fbfcfe;
            padding: 0.6rem 0.8rem;
            font-size: 0.85rem;
            font-family: inherit;
        }

        .row-remove {
            width: 32px; height: 32px;
            border-radius: 8px;
            background: #fff;
            color: var(--c-danger);
            font-size: 1rem;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            border: 1px solid #fecaca;
            transition: background 0.15s ease;
        }
        .row-remove:hover { background: #fef2f2; }

        .request-total-row {
            margin-top: 1rem;
            padding: 1rem 1rem 0;
            display: flex;
            align-items: center;
            justify-content: space-between;
            font-weight: 700;
            color: var(--c-ink);
            font-variant-numeric: tabular-nums;
        }

        .request-actions-row {
            margin-top: 1.25rem;
            display: flex;
            justify-content: flex-end;
            gap: 0.75rem;
        }

        .request-action {
            padding: 0.75rem 1.2rem;
            border-radius: 8px;
            font-weight: 600;
            min-width: 140px;
            font-size: 0.86rem;
            letter-spacing: 0.02em;
            transition: background 0.15s ease, box-shadow 0.15s ease, transform 0.1s ease;
        }
        .request-action.secondary {
            background: #ffffff;
            color: var(--c-ink);
            border: 1px solid var(--c-line-strong);
        }
        .request-action.secondary:hover { background: var(--c-surface-2); }
        .request-action.primary {
            background: var(--c-navy);
            color: #ffffff;
            border: 1px solid var(--c-navy);
        }
        .request-action.primary:hover { background: var(--c-navy-2); box-shadow: 0 8px 18px -8px rgba(11,37,69,0.55); }
        .request-actions-row .request-action {
            display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem;
        }
        .request-actions-row .request-action svg { width: 14px; height: 14px; stroke-width: 2.5; stroke: currentColor; }

        .request-modal { transform: translateY(20px); transition: transform 0.25s ease; }
        .request-modal-overlay.open .request-modal { transform: translateY(0); }

        @media (max-width: 900px) {
            .request-form { grid-template-columns: 1fr; }
            .request-grid { grid-template-columns: 1fr; }
        }

        @media (max-width: 600px) {
            .request-modal { padding: 1rem; }
            .request-modal-header,
            .request-stepper,
            .request-actions-row { flex-direction: column; align-items: stretch; }
        }

        /* ---- TABLE ---- */
        .table-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 1rem 1.5rem;
            border-bottom: 1px solid var(--c-line);
        }
        .table-header h2 {
            font-family: 'Source Serif Pro', Georgia, serif;
            font-size: 1.05rem;
            font-weight: 700;
            color: var(--c-ink);
            letter-spacing: -0.005em;
        }

        .table-actions { display: flex; align-items: center; gap: 0.5rem; }

        .pill-select {
            padding: 0.4rem 0.7rem;
            border-radius: 6px;
            border: 1px solid var(--c-line-strong);
            background-color: #ffffff;
            font-size: 0.78rem;
            font-weight: 500;
            color: var(--c-ink-soft);
            cursor: pointer;
            outline: none;
            height: 32px;
            font-family: inherit;
        }

        .pill-button {
            display: inline-flex;
            align-items: center;
            gap: 0.35rem;
            padding: 0.4rem 0.8rem;
            border-radius: 6px;
            border: 1px solid var(--c-line-strong);
            background-color: #ffffff;
            font-size: 0.78rem;
            font-weight: 600;
            color: var(--c-ink-soft);
            cursor: pointer;
            height: 32px;
            transition: border-color 0.15s ease, color 0.15s ease, background 0.15s ease;
        }
        .pill-button:hover { border-color: var(--c-navy-3); color: var(--c-navy); background: var(--c-info-soft); }
        .pill-button svg { width: 12px; height: 12px; stroke-width: 2.2; }

        .requests-table { width: 100%; border-collapse: collapse; text-align: left; }

        .requests-table th {
            padding: 0.75rem 1.25rem;
            font-size: 0.68rem;
            font-weight: 700;
            color: var(--c-muted);
            text-transform: uppercase;
            letter-spacing: 0.08em;
            border-bottom: 1px solid var(--c-line);
            background-color: var(--c-surface-2);
        }
        .requests-table th.sortable { cursor: pointer; transition: color 0.15s ease; }
        .requests-table th.sortable:hover { color: var(--c-ink); }

        .sort-icon { display: inline-flex; align-items: center; margin-left: 0.25rem; vertical-align: middle; }
        .sort-icon svg { width: 10px; height: 10px; stroke-width: 2.5; }

        .requests-table tbody tr {
            border-bottom: 1px solid var(--c-line);
            transition: background-color 0.1s ease;
        }
        .requests-table tbody tr:hover { background-color: var(--c-surface-2); }
        .requests-table tbody tr:last-child { border-bottom: none; }

        .requests-table td {
            padding: 0.95rem 1.25rem;
            font-size: 0.84rem;
            color: var(--c-ink-soft);
            vertical-align: middle;
            font-variant-numeric: tabular-nums;
        }
        .requests-table td:nth-child(2) { font-weight: 600; color: var(--c-navy); }

        .status-pill {
            display: inline-flex;
            align-items: center;
            gap: 0.4rem;
            padding: 0.25rem 0.6rem;
            border-radius: 999px;
            font-size: 0.72rem;
            font-weight: 600;
            border: 1px solid transparent;
            letter-spacing: 0.02em;
        }
        .status-pill.status-pending {
            background-color: var(--c-warning-soft);
            color: var(--c-warning);
            border-color: rgba(180, 83, 9, 0.18);
        }
        .status-pill.status-approved {
            background-color: var(--c-success-soft);
            color: var(--c-success);
            border-color: rgba(15, 122, 74, 0.18);
        }
        .status-dot { width: 6px; height: 6px; border-radius: 50%; display: inline-block; }
        .status-pill.status-pending .status-dot { background-color: var(--c-warning); }
        .status-pill.status-approved .status-dot { background-color: var(--c-success); }

        .info-btn {
            width: 28px; height: 28px;
            border-radius: 8px;
            background-color: var(--c-surface-2);
            display: inline-flex;
            align-items: center;
            justify-content: center;
            color: var(--c-muted);
            transition: background 0.15s ease, color 0.15s ease;
            border: 1px solid var(--c-line);
        }
        .info-btn:hover { background-color: var(--c-navy); color: #fff; border-color: var(--c-navy); }
        .info-btn svg { width: 12px; height: 12px; stroke-width: 2.5; }

        /* ---- RESPONSIVE ---- */
        @media (max-width: 1100px) {
            .cards-grid { grid-template-columns: repeat(2, 1fr); }
        }

        @media (max-width: 800px) {
            .dashboard-root { flex-direction: column; }
            .sidebar { width: 100%; height: auto; padding: 1rem; }
            .sidebar-footer { margin-top: 1rem; }
            .cards-grid { grid-template-columns: 1fr; }
            .search-bar { width: 100%; max-width: 220px; }
        }
    </style>
</head>
<body>
    <form id="navigation-form" method="POST" style="display: none;">
        <input type="hidden" name="email" value="${safeEmail}">
        <input type="hidden" name="otp" value="${safeOtp}">
    </form>
    <div class="dashboard-root">
        <!-- SIDEBAR -->
        <aside class="sidebar">
            <div class="brand">TRACKNOW</div>
            <nav class="nav">
                <div class="nav-item active" id="nav-pr-list" data-page="pr-list">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>
                    PR List
                </div>
                <div class="nav-item" id="nav-smtr-list" data-page="smtr-list">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="9"></rect><rect x="14" y="3" width="7" height="5"></rect><rect x="14" y="12" width="7" height="9"></rect><rect x="3" y="16" width="7" height="5"></rect></svg>
                    SMTR List
                </div>
                <div class="nav-item">
                    <svg viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                    Profile
                </div>
                <div class="nav-divider"></div>
                <div class="nav-item">
                    <svg viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                    Logout
                </div>
            </nav>
            <div class="sidebar-footer">
                <div class="user-avatar">SM</div>
                <div class="user-info">
                    <div class="user-name">SMTR Supervisor</div>
                    <div class="user-role">Supervisor</div>
                </div>
                <svg class="sidebar-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
            </div>
        </aside>

        <!-- MAIN LAYOUT -->
        <main class="main">
            <!-- TOPBAR -->
            <header class="topbar">
                <div class="topbar-left">
                    <button class="hamburger-btn" aria-label="Toggle Navigation">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
                    </button>
                    <div class="search-bar">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                        <input type="text" placeholder="Search anything..." aria-label="Search dashboard" />
                       
                    </div>
                </div>
                <div class="topbar-right">
                    <div class="notification-badge" aria-label="3 new notifications">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
                        <span class="notification-count">3</span>
                    </div>
                    <div class="top-profile-dropdown">
                        <span class="top-profile-name">SMTR Supervisor</span>
                        <svg class="top-profile-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                    </div>
                </div>
            </header>

            <!-- MAIN CONTAINER -->
            <div class="container">
                <div id="dashboard-view">
                <!-- PAGE HEADER -->
                <div class="page-header">
                    <div>
                        <h1 class="page-title"><strong>PR</strong> List</h1>
                        <p class="page-subtitle" style="font-size: 0.8rem; color: #64748b; margin-top: 0.1rem;">Overview of your purchase requests and approvals</p>
                    </div>
                    <button class="btn-request-pr" id="btn-open-request">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                        Request PR
                    </button>
                </div>

                <!-- CARDS GRID -->
                <section class="cards-grid" aria-label="Dashboard Metrics">
                    <!-- CARD 1: PURCHASE REQUESTS -->
                    <div class="metric-card primary">
                        <div class="card-top">
                            <span class="metric-label">Purchase Requests</span>
                            <div class="metric-icon-badge">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
                            </div>
                        </div>
                        <div class="metric-value">50</div>
                        <div class="metric-note">Total Requests</div>
                        <svg class="card-watermark" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
                    </div>

                    <!-- CARD 2: PENDING APPROVAL -->
                    <div class="metric-card orange">
                        <div class="card-top">
                            <span class="metric-label">Pending Approval</span>
                            <div class="metric-icon-badge">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                            </div>
                        </div>
                        <div class="metric-value">35</div>
                        <div class="metric-note">Requests awaiting approval</div>
                    </div>

                    <!-- CARD 3: APPROVED -->
                    <div class="metric-card green">
                        <div class="card-top">
                            <span class="metric-label">Approved</span>
                            <div class="metric-icon-badge">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                            </div>
                        </div>
                        <div class="metric-value">12</div>
                        <div class="metric-note">Requests approved</div>
                    </div>

                    <!-- CARD 4: TOTAL AMOUNT -->
                    <div class="metric-card blue">
                        <div class="card-top">
                            <span class="metric-label">Total Amount</span>
                            <div class="metric-icon-badge">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>
                            </div>
                        </div>
                        <div class="metric-value">$ 5,130.72</div>
                        <div class="metric-note">Across all requests</div>
                    </div>
                </section>

            <div class="request-modal-overlay" id="request-modal">
                <div class="request-modal">
                    <header class="request-modal-header" style="align-items: flex-start; margin-bottom: 2rem;">
                        <div style="flex: 1;">
                            <h2 class="request-title" style="font-size: 1.8rem;">SMTR Requestor Record View</h2>
                            <p class="request-subtitle" style="color: #64748b; font-size: 0.9rem; margin-top: 0.4rem;">Complete the sections below and submit for departmental approval.</p>
                        </div>
                        <div style="display: flex; align-items: center; gap: 1rem;">
                            <button class="modal-close" id="btn-close-request" aria-label="Close request form" style="margin: 0; background: #fff;">×</button>
                        </div>
                    </header>
                    <div class="request-stepper" style="display: inline-flex; align-items: center; gap: 0; background: transparent; padding: 0; margin-bottom: 2rem;">
                        <div class="step active" style="background: #0f172a; padding: 0.4rem 1.2rem; border-radius: 999px; position: relative; z-index: 2; border: 1px solid #0f172a;">
                            <span style="background: #f59e0b; color: #fff;">1</span><p style="color: #ffffff;">Fill Details</p>
                        </div>
                        <div style="width: 40px; height: 1px; background: #cbd5e1; z-index: 1;"></div>
                        <div class="step" style="background: #ffffff; border: 1px solid #e2e8f0; padding: 0.4rem 1.2rem; border-radius: 999px; position: relative; z-index: 2;">
                            <span style="background: #f1f5f9; color: #64748b;">2</span><p style="color: #64748b; margin: 0; font-size: 0.78rem; font-weight: 600;">Under Review</p>
                        </div>
                        <div style="width: 40px; height: 1px; background: #cbd5e1; z-index: 1;"></div>
                        <div class="step" style="background: #ffffff; border: 1px solid #e2e8f0; padding: 0.4rem 1.2rem; border-radius: 999px; position: relative; z-index: 2;">
                            <span style="background: #f1f5f9; color: #64748b;">3</span><p style="color: #64748b; margin: 0; font-size: 0.78rem; font-weight: 600;">Decision</p>
                        </div>
                    </div>
                   
                    <div style="display: flex; flex-direction: column; gap: 1.5rem;">
                        <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 1.5rem;">
                            <!-- SMTR Requestor Record View Details -->
                            <div class="request-card" style="border-top: 4px solid #f59e0b;">
                                <div class="request-grid" style="margin-bottom: 1rem; grid-template-columns: repeat(4, 1fr); gap: 1rem;">
                                    <label class="request-field">
                                        <span style="text-transform: uppercase; font-size: 0.7rem; font-weight: 700; color: #475569; letter-spacing: 0.05em;">Purpose of Request <span style="color: #ef4444;">*</span></span>
                                        <input type="text" style="margin-top: 0.45rem;" />
                                    </label>
                                    <label class="request-field">
                                        <span style="text-transform: uppercase; font-size: 0.7rem; font-weight: 700; color: #475569; letter-spacing: 0.05em;">Location <span style="color: #ef4444;">*</span></span>
                                        <input type="text" value="San Francisco" style="margin-top: 0.45rem;" />
                                    </label>
                                    <label class="request-field">
                                        <span style="text-transform: uppercase; font-size: 0.7rem; font-weight: 700; color: #475569; letter-spacing: 0.05em;">Department <span style="color: #ef4444;">*</span></span>
                                        <select style="margin-top: 0.45rem;"><option>Marketing</option></select>
                                    </label>
                                    <label class="request-field">
                                        <span style="text-transform: uppercase; font-size: 0.7rem; font-weight: 700; color: #475569; letter-spacing: 0.05em;">Urgency Level</span>
                                        <select style="margin-top: 0.45rem;"><option>Low</option></select>
                                    </label>
                                </div>

                                <div class="request-grid" style="margin-bottom: 1rem; grid-template-columns: repeat(4, 1fr); gap: 1rem;">
                                    <label class="request-field">
                                        <span style="text-transform: uppercase; font-size: 0.7rem; font-weight: 700; color: #475569; letter-spacing: 0.05em;">Date Needed to Arrive <span style="color: #ef4444;">*</span></span>
                                        <input type="date" value="19-05-2026" style="margin-top: 0.45rem;" />
                                    </label>
                                    <label class="request-field">
                                        <span style="text-transform: uppercase; font-size: 0.7rem; font-weight: 700; color: #475569; letter-spacing: 0.05em;">Requested Arrival Date <span style="color: #ef4444;">*</span></span>
                                        <input type="date" value="19-05-2026" style="margin-top: 0.45rem;" />
                                    </label>
                                    <label class="request-field">
                                        <span style="text-transform: uppercase; font-size: 0.7rem; font-weight: 700; color: #475569; letter-spacing: 0.05em;">GL Account</span>
                                        <select style="margin-top: 0.45rem;"><option>0102004 Bank Import Account</option></select>
                                    </label>
                                    <label class="request-field">
                                        <span style="text-transform: uppercase; font-size: 0.7rem; font-weight: 700; color: #475569; letter-spacing: 0.05em;">Customer</span>
                                        <select style="margin-top: 0.45rem;"><option>SilverLine Energy Systems</option></select>
                                    </label>
                                </div>

                                <div class="request-grid" style="grid-template-columns: repeat(2, 1fr); gap: 1rem;">
                                    <label class="request-field request-notes">
                                        <span style="text-transform: uppercase; font-size: 0.7rem; font-weight: 700; color: #475569; letter-spacing: 0.05em;">Ship To</span>
                                        <textarea placeholder="Address..." style="margin-top: 0.45rem; min-height: 80px;"></textarea>
                                    </label>
                                    <label class="request-field request-notes">
                                        <span style="text-transform: uppercase; font-size: 0.7rem; font-weight: 700; color: #475569; letter-spacing: 0.05em;">Memo</span>
                                        <textarea placeholder="Add notes here..." style="margin-top: 0.45rem; min-height: 80px;"></textarea>
                                    </label>
                                </div>
                            </div>

                            <!-- Tips Before Submitting -->
                            <div class="request-card" style="background: #fdfbf7; border: 1px solid #fde68a; border-radius: 12px; padding: 1.5rem;">
                                <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1.5rem;">
                                    <div style="width: 36px; height: 36px; border-radius: 8px; background: #fef3c7; color: #f59e0b; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 1.2rem; flex-shrink: 0;">!</div>
                                    <div>
                                        <p style="font-weight: 700; color: #0f172a; margin: 0; font-size: 0.95rem;">Premium PR Guidelines</p>
                                        <p style="font-size: 0.8rem; color: #f59e0b; margin: 0; font-weight: 500;">Ensure fast processing</p>
                                    </div>
                                </div>
                               
                                <div style="display: flex; flex-direction: column; gap: 1rem;">
                                    <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 1rem; display: flex; gap: 0.8rem;">
                                        <div style="color: #f59e0b; flex-shrink: 0;"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg></div>
                                        <div>
                                            <p style="font-size: 0.8rem; font-weight: 700; color: #0f172a; margin: 0 0 0.2rem 0;">Verify GL Accounts.</p>
                                            <p style="font-size: 0.75rem; color: #64748b; margin: 0; line-height: 1.4;">Correct accounting ensures budget alignment.</p>
                                        </div>
                                    </div>
                                    <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 1rem; display: flex; gap: 0.8rem;">
                                        <div style="color: #f59e0b; flex-shrink: 0;"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg></div>
                                        <div>
                                            <p style="font-size: 0.8rem; font-weight: 700; color: #0f172a; margin: 0 0 0.2rem 0;">Check item quantities.</p>
                                            <p style="font-size: 0.75rem; color: #64748b; margin: 0; line-height: 1.4;">Review on-hand vs requested amounts.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Line Items -->
                        <div class="request-card" style="background: #ffffff; border: 1px solid #e2e8f0; padding: 0;">
                            <div class="request-card-header simple" style="padding: 1.5rem 1.5rem 0.5rem 1.5rem;">
                                <div>
                                    <p class="request-card-title" style="font-size: 1.2rem; font-weight: 700;">Items</p>
                                </div>
                            </div>

                            <div style="padding: 1.5rem;">
                                <div class="item-table-wrapper" style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 0; overflow-x: auto;">
                                    <div class="item-table-header" style="background: #f8fafc; border-bottom: 1px solid #e2e8f0; display: grid; grid-template-columns: 1.5fr 2.5fr 1fr 1fr 1fr 1fr 1fr 50px; text-align: center; font-size: 0.7rem; padding: 0;">
                                        <div style="padding: 1rem 0.5rem; border-right: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: center;">ITEM *</div>
                                        <div style="padding: 1rem 0.5rem; border-right: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: center;">DESCRIPTION</div>
                                        <div style="padding: 1rem 0.5rem; border-right: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: center;">QUANTITY *</div>
                                        <div style="padding: 1rem 0.5rem; border-right: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: center;">AVAILABLE QTY</div>
                                        <div style="padding: 1rem 0.5rem; border-right: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: center;">ON HAND QTY</div>
                                        <div style="padding: 1rem 0.5rem; border-right: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: center;">PENDING ALLOCATION</div>
                                        <div style="padding: 1rem 0.5rem; border-right: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: center;">PENDING FULFILLMENT</div>
                                        <div style="padding: 1rem 0.5rem; display: flex; align-items: center; justify-content: center;"></div>
                                    </div>

                                    <div id="items-container">
                                        <div class="item-row new-item-row" style="display: grid; grid-template-columns: 1.5fr 2.5fr 1fr 1fr 1fr 1fr 1fr 50px; border-bottom: 1px solid #e2e8f0; align-items: stretch; padding: 0; background: #ffffff;">
                                            <div style="padding: 0.75rem; border-right: 1px solid #e2e8f0; display: flex; align-items: center;">
                                                <select style="width: 100%; border: 1px solid #cbd5e1; border-radius: 6px; padding: 0.5rem; font-size: 0.8rem; background: #fff;"><option>Select Item</option></select>
                                            </div>
                                            <div style="padding: 0.75rem; border-right: 1px solid #e2e8f0; display: flex; align-items: center;">
                                                <textarea style="width: 100%; border: 1px solid #cbd5e1; border-radius: 6px; padding: 0.5rem; font-size: 0.8rem; background: #fff; min-height: 40px; resize: vertical;"></textarea>
                                            </div>
                                            <div style="padding: 0.75rem; border-right: 1px solid #e2e8f0; display: flex; align-items: center;">
                                                <input type="number" style="width: 100%; border: 1px solid #cbd5e1; border-radius: 6px; padding: 0.5rem; font-size: 0.8rem; background: #fff; text-align: center;" />
                                            </div>
                                            <div style="padding: 0.75rem; border-right: 1px solid #e2e8f0; display: flex; align-items: center;">
                                                <input type="number" readonly style="width: 100%; border: 1px solid #e2e8f0; border-radius: 6px; padding: 0.5rem; font-size: 0.8rem; background: #f8fafc; text-align: center;" />
                                            </div>
                                            <div style="padding: 0.75rem; border-right: 1px solid #e2e8f0; display: flex; align-items: center;">
                                                <input type="number" readonly style="width: 100%; border: 1px solid #e2e8f0; border-radius: 6px; padding: 0.5rem; font-size: 0.8rem; background: #f8fafc; text-align: center;" />
                                            </div>
                                            <div style="padding: 0.75rem; border-right: 1px solid #e2e8f0; display: flex; align-items: center;">
                                                <input type="number" readonly style="width: 100%; border: 1px solid #e2e8f0; border-radius: 6px; padding: 0.5rem; font-size: 0.8rem; background: #f8fafc; text-align: center;" />
                                            </div>
                                            <div style="padding: 0.75rem; border-right: 1px solid #e2e8f0; display: flex; align-items: center;">
                                                <input type="number" readonly style="width: 100%; border: 1px solid #e2e8f0; border-radius: 6px; padding: 0.5rem; font-size: 0.8rem; background: #f8fafc; text-align: center;" />
                                            </div>
                                            <div style="padding: 0.75rem; display: flex; justify-content: center; align-items: center;">
                                                <button type="button" class="row-remove-btn" style="width: 24px; height: 24px; border-radius: 50%; border: 1px solid #ef4444; background: transparent; color: #ef4444; display: flex; align-items: center; justify-content: center; font-size: 1rem; cursor: pointer;">×</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 1.5rem;">
                                    <button type="button" id="btn-add-line" style="background: #f59e0b; color: #ffffff; border: none; padding: 0.6rem 1.2rem; border-radius: 6px; font-size: 0.85rem; font-weight: 600; display: inline-flex; align-items: center; gap: 0.4rem; cursor: pointer;">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>
                                        Add Line
                                    </button>

                                    <div style="display: flex; gap: 1rem;">
                                        <button type="button" id="btn-submit-request" style="background: #f59e0b; color: #ffffff; border: none; padding: 0.6rem 1.2rem; border-radius: 6px; font-size: 0.85rem; font-weight: 600; display: inline-flex; align-items: center; gap: 0.4rem; cursor: pointer;">
                                            Submit Request
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16" style="margin-left: 0.2rem;"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Submission Summary -->
                        <div class="request-card" style="border-top: 4px solid #f59e0b; background: #fdfbf7; border-bottom: 1px solid #e2e8f0; border-left: 1px solid #e2e8f0; border-right: 1px solid #e2e8f0; padding: 1.5rem;">
                            <div class="request-card-header" style="margin-bottom: 1.5rem;">
                                <div class="request-card-number" style="background: #fef3c7; color: #f59e0b;">i</div>
                                <div>
                                    <p class="request-card-title">Submission Summary</p>
                                    <p class="request-card-subtitle">Live status of this record</p>
                                </div>
                            </div>
                           
                            <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; display: flex; flex-direction: column;">
                                <div style="display: flex; justify-content: space-between; padding: 1rem 1.5rem; border-bottom: 1px solid #f1f5f9;">
                                    <span style="font-size: 0.85rem; color: #475569; font-weight: 500;">Record ID</span>
                                    <span style="font-size: 0.85rem; color: #0f172a; font-weight: 700;">— New —</span>
                                </div>
                                <div style="display: flex; justify-content: space-between; padding: 1rem 1.5rem; border-bottom: 1px solid #f1f5f9;">
                                    <span style="font-size: 0.85rem; color: #475569; font-weight: 500;">Status</span>
                                    <span style="font-size: 0.85rem; color: #0f172a; font-weight: 700;">Draft</span>
                                </div>
                                <div style="display: flex; justify-content: space-between; padding: 1rem 1.5rem; border-bottom: 1px solid #f1f5f9;">
                                    <span style="font-size: 0.85rem; color: #475569; font-weight: 500;">Submitted By</span>
                                    <span style="font-size: 0.85rem; color: #0f172a; font-weight: 700;">-System-</span>
                                </div>
                                <div style="display: flex; justify-content: space-between; padding: 1rem 1.5rem;">
                                    <span style="font-size: 0.85rem; color: #475569; font-weight: 500;">Approver</span>
                                    <span style="font-size: 0.85rem; color: #0f172a; font-weight: 700;">Team Members</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

                <!-- RECENT REQUESTS TABLE CARD -->
                <section class="table-card" aria-label="Recent Requests">
                    <div class="table-header">
                        <h2>Recent Purchase Requests</h2>
                        <div class="table-actions">
                            <select class="pill-select" aria-label="Filter by Status">
                                <option>All Status</option>
                            </select>
                            <button class="pill-button">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
                                Filter
                            </button>
                        </div>
                    </div>
                    <table class="requests-table">
                        <thead>
                            <tr>
                                <th class="sortable">
                                    Date
                                    <span class="sort-icon">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M7 15l5 5 5-5M7 9l5-5 5 5"/></svg>
                                    </span>
                                </th>
                                <th>Document Number</th>
                                <th>Location</th>
                                <th>Total Amount</th>
                                <th>Next Approver</th>
                                <th>Status</th>
                                <th>Info</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>May 20, 2026</td>
                                <td>PR000965</td>
                                <td>San Francisco</td>
                                <td>$4,000.00</td>
                                <td>Asha</td>
                                <td><span class="status-pill status-pending"><span class="status-dot"></span>Pending Approval</span></td>
                                <td>
                                    <button class="info-btn" aria-label="View Details">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                                    </button>
                                </td>
                            </tr>
                            <tr>
                                <td>May 22, 2026</td>
                                <td>PR000959</td>
                                <td>San Francisco</td>
                                <td>$1,092.72</td>
                                <td>Asha</td>
                                <td><span class="status-pill status-pending"><span class="status-dot"></span>Pending Approval</span></td>
                                <td>
                                    <button class="info-btn" aria-label="View Details">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                                    </button>
                                </td>
                            </tr>
                            <tr>
                                <td>May 8, 2026</td>
                                <td>PR000927</td>
                                <td>San Francisco</td>
                                <td>$90.00</td>
                                <td>-</td>
                                <td><span class="status-pill status-approved"><span class="status-dot"></span>Approved</span></td>
                                <td>
                                    <button class="info-btn" aria-label="View Details">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                                    </button>
                                </td>
                            </tr>
                            <tr>
                                <td>May 23, 2026</td>
                                <td>PR000926</td>
                                <td>San Francisco · Colorado</td>
                                <td>$36.00</td>
                                <td>-</td>
                                <td><span class="status-pill status-approved"><span class="status-dot"></span>Approved</span></td>
                                <td>
                                    <button class="info-btn" aria-label="View Details">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                                    </button>
                                </td>
                            </tr>
                            <tr>
                                <td>May 8, 2026</td>
                                <td>PR000925</td>
                                <td>San Francisco</td>
                                <td>$12.00</td>
                                <td>Asha</td>
                                <td><span class="status-pill status-pending"><span class="status-dot"></span>Pending Approval</span></td>
                                <td>
                                    <button class="info-btn" aria-label="View Details">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                                    </button>
                                </td>
                            </tr>
                            <tr>
                                <td>May 20, 2026</td>
                                <td>PR000924</td>
                                <td>San Francisco</td>
                                <td>$0.00</td>
                                <td>Asha</td>
                                <td><span class="status-pill status-pending"><span class="status-dot"></span>Pending Approval</span></td>
                                <td>
                                    <button class="info-btn" aria-label="View Details">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </section>
                </div>



                <!-- DETAILS VIEW -->
                <div id="details-view" style="display: none; padding-bottom: 2rem;">
                    <div style="display: flex; flex-direction: column; background: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); border: 1px solid #e2e8f0; margin-top: 1rem;">
                        <header style="align-items: center; justify-content: flex-start; gap: 1rem; margin: 0; padding: 1.5rem 2rem; border-bottom: 1px solid #e2e8f0; background: #f8fafc; border-radius: 16px 16px 0 0; display: flex;">
                            <button id="btn-close-details" aria-label="Back" style="cursor: pointer; margin: 0; background: #0ea5e9; color: #ffffff; border: none; font-size: 1.2rem; display: flex; align-items: center; justify-content: center; border-radius: 50%; width: 32px; height: 32px; transition: background-color 0.15s ease;">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="16" height="16"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                            </button>
                            <h2 style="font-size: 1.5rem; color: #334155; margin: 0; font-weight: 700;">Purchase Requestor Details</h2>
                        </header>
                       
                        <div style="padding: 2rem;">
                            <div class="request-card" style="margin-bottom: 2rem;">
                                <div class="request-grid" style="grid-template-columns: repeat(4, 1fr); gap: 1.5rem;">
                                    <!-- Row 1 -->
                                    <div class="detail-field" style="display: flex; flex-direction: column; gap: 0.3rem;">
                                        <span style="font-size: 0.75rem; font-weight: 600; color: #64748b;">Document Number</span>
                                        <span style="font-size: 0.95rem; font-weight: 700; color: #0ea5e9;">PR000729</span>
                                    </div>
                                    <div class="detail-field" style="display: flex; flex-direction: column; gap: 0.3rem;">
                                        <span style="font-size: 0.75rem; font-weight: 600; color: #64748b;">Date</span>
                                        <span style="font-size: 0.95rem; font-weight: 600; color: #334155;">1/28/2026</span>
                                    </div>
                                    <div class="detail-field" style="display: flex; flex-direction: column; gap: 0.3rem;">
                                        <span style="font-size: 0.75rem; font-weight: 600; color: #64748b;">Subsidiary</span>
                                        <span style="font-size: 0.95rem; font-weight: 600; color: #334155;">Parent Company</span>
                                    </div>
                                    <div class="detail-field" style="display: flex; flex-direction: column; gap: 0.3rem;">
                                        <span style="font-size: 0.75rem; font-weight: 600; color: #64748b;">Department</span>
                                        <span style="font-size: 0.95rem; font-weight: 600; color: #334155;">Engineering</span>
                                    </div>

                                    <!-- Row 2 -->
                                    <div class="detail-field" style="display: flex; flex-direction: column; gap: 0.3rem;">
                                        <span style="font-size: 0.75rem; font-weight: 600; color: #64748b;">Vendor</span>
                                        <span style="font-size: 0.95rem; font-weight: 600; color: #334155;">Charles Schwab</span>
                                    </div>
                                    <div class="detail-field" style="display: flex; flex-direction: column; gap: 0.3rem;">
                                        <span style="font-size: 0.75rem; font-weight: 600; color: #64748b;">Location</span>
                                        <span style="font-size: 0.95rem; font-weight: 600; color: #334155;">San Francisco</span>
                                    </div>
                                    <div class="detail-field" style="display: flex; flex-direction: column; gap: 0.3rem;">
                                        <span style="font-size: 0.75rem; font-weight: 600; color: #64748b;">Total Amount</span>
                                        <span style="font-size: 0.95rem; font-weight: 700; color: #10b981;">$ 2200.00</span>
                                    </div>
                                    <div class="detail-field" style="display: flex; flex-direction: column; gap: 0.3rem;">
                                        <span style="font-size: 0.75rem; font-weight: 600; color: #64748b;">Status</span>
                                        <span style="font-size: 0.95rem; font-weight: 700; color: #10b981;">Approved</span>
                                    </div>

                                    <!-- Row 3 -->
                                    <div class="detail-field" style="display: flex; flex-direction: column; gap: 0.3rem;">
                                        <span style="font-size: 0.75rem; font-weight: 600; color: #64748b;">Urgency Level</span>
                                        <span style="font-size: 0.95rem; font-weight: 600; color: #334155;">-</span>
                                    </div>
                                    <div class="detail-field" style="display: flex; flex-direction: column; gap: 0.3rem;">
                                        <span style="font-size: 0.75rem; font-weight: 600; color: #64748b;">Purchase Order</span>
                                        <span style="font-size: 0.95rem; font-weight: 600; color: #334155;">-</span>
                                    </div>
                                    <div class="detail-field" style="display: flex; flex-direction: column; gap: 0.3rem;">
                                        <span style="font-size: 0.75rem; font-weight: 600; color: #64748b;">Currency</span>
                                        <span style="font-size: 0.95rem; font-weight: 600; color: #334155;">-</span>
                                    </div>
                                    <div class="detail-field" style="display: flex; flex-direction: column; gap: 0.3rem;">
                                        <span style="font-size: 0.75rem; font-weight: 600; color: #64748b;">Data Receive By</span>
                                        <span style="font-size: 0.95rem; font-weight: 600; color: #334155;">2/28/2026</span>
                                    </div>
                                   
                                    <!-- Row 4 -->
                                    <div class="detail-field" style="display: flex; flex-direction: column; gap: 0.3rem; grid-column: span 4;">
                                        <span style="font-size: 0.75rem; font-weight: 600; color: #64748b;">Notes</span>
                                        <span style="font-size: 0.95rem; font-weight: 600; color: #334155;">-</span>
                                    </div>
                                </div>
                            </div>

                            <div class="request-card" style="padding: 0;">
                                <div class="request-card-header simple" style="padding: 1.5rem 1.5rem 1rem;">
                                    <h3 style="font-size: 1.1rem; color: #0f172a; margin: 0; font-weight: 700;">Items</h3>
                                </div>

                                <div class="item-table-wrapper" style="border-radius: 0; border: none; border-top: 1px solid #e2e8f0; overflow-x: auto;">
                                    <div class="item-table-header" style="background: #f8fafc; border-bottom: 1px solid #e2e8f0; display: grid; grid-template-columns: 2.5fr 1fr 1fr 1fr 1fr 1.5fr 1fr; text-align: left; font-size: 0.7rem; padding: 1rem;">
                                        <div style="font-weight: 700; color: #64748b;">ITEM</div>
                                        <div style="font-weight: 700; color: #64748b;">DESCRIPTION</div>
                                        <div style="font-weight: 700; color: #64748b;">QUANTITY</div>
                                        <div style="font-weight: 700; color: #64748b;">RATE</div>
                                        <div style="font-weight: 700; color: #64748b;">TOTAL</div>
                                        <div style="font-weight: 700; color: #64748b;">ACCOUNT</div>
                                        <div style="font-weight: 700; color: #64748b;">VENDOR</div>
                                    </div>

                                    <div class="item-row" style="display: grid; grid-template-columns: 2.5fr 1fr 1fr 1fr 1fr 1.5fr 1fr; border-bottom: 1px solid #f1f5f9; padding: 1rem; align-items: center; font-size: 0.85rem; color: #334155; gap: 1rem;">
                                        <div style="font-weight: 500;">Aurora™ CS System</div>
                                        <div>Cytek</div>
                                        <div>10</div>
                                        <div>200.00</div>
                                        <div>2000.00</div>
                                        <div><span style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 0.4rem 0.6rem; font-size: 0.75rem;">99476 Expenses2</span></div>
                                        <div>N/A</div>
                                    </div>
                                    <div class="item-row" style="display: grid; grid-template-columns: 2.5fr 1fr 1fr 1fr 1fr 1.5fr 1fr; padding: 1rem; align-items: center; font-size: 0.85rem; color: #334155; gap: 1rem;">
                                        <div style="font-weight: 500;">Cytek® Amnis® ImageStream®X Mk II Imaging Flow Cytometer</div>
                                        <div>Amnis</div>
                                        <div>10</div>
                                        <div>20.00</div>
                                        <div>200.00</div>
                                        <div><span style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 0.4rem 0.6rem; font-size: 0.75rem;">99676 Expenses1</span></div>
                                        <div>N/A</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- PROFILE VIEW -->
                <div id="profile-view" style="display: none; padding-bottom: 2rem;">
                    <div style="display: flex; flex-direction: column; margin-top: 1rem;">
                        <header style="align-items: center; justify-content: flex-start; gap: 1rem; margin: 0 0 1.5rem 0; display: flex;">
                            <button id="btn-close-profile" aria-label="Back" style="cursor: pointer; margin: 0; background: #0ea5e9; color: #ffffff; border: none; font-size: 1.2rem; display: flex; align-items: center; justify-content: center; border-radius: 50%; width: 32px; height: 32px; transition: background-color 0.15s ease;">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="16" height="16"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                            </button>
                            <div>
                                <h2 style="font-size: 1.5rem; color: #0f172a; margin: 0 0 0.25rem 0; font-weight: 700;">My Profile</h2>
                                <p style="font-size: 0.9rem; color: #64748b; margin: 0;">View and manage your personal information and account details.</p>
                            </div>
                        </header>
                       
                        <div style="background: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); border: 1px solid #e2e8f0; padding: 2.5rem; display: flex; gap: 4rem; flex-wrap: wrap;">
                            <!-- Avatar Column -->
                            <div style="flex: 0 0 auto; display: flex; justify-content: center; align-items: center; padding-right: 2rem;">
                                <div style="width: 140px; height: 140px; border-radius: 50%; background: #237a76; display: flex; justify-content: center; align-items: center; box-shadow: 0 10px 25px -5px rgba(35, 122, 118, 0.4); border: 6px solid #e0f2f1; position: relative; overflow: hidden;">
                                    <svg viewBox="0 0 24 24" width="80" height="80" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-top: 1rem;">
                                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                        <circle cx="12" cy="7" r="4"></circle>
                                    </svg>
                                </div>
                            </div>

                            <!-- Middle Column (Name, Subsidiary, Role) -->
                            <div style="flex: 1 1 300px; display: flex; flex-direction: column; gap: 2rem; border-right: 1px solid #e2e8f0; padding-right: 2rem;">
                                <div style="display: flex; gap: 1rem;">
                                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#64748b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-top: 0.2rem;"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                                    <div style="display: flex; flex-direction: column; gap: 0.3rem;">
                                        <span style="font-size: 0.8rem; font-weight: 600; color: #64748b;">Name</span>
                                        <span style="font-size: 1rem; font-weight: 700; color: #1e293b;">Dinesh TM</span>
                                    </div>
                                </div>
                                <div style="display: flex; gap: 1rem;">
                                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#64748b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-top: 0.2rem;"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line></svg>
                                    <div style="display: flex; flex-direction: column; gap: 0.3rem;">
                                        <span style="font-size: 0.8rem; font-weight: 600; color: #64748b;">Subsidiary</span>
                                        <span style="font-size: 1rem; font-weight: 600; color: #1e293b;">Parent Company</span>
                                    </div>
                                </div>
                                <div style="display: flex; gap: 1rem;">
                                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#64748b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-top: 0.2rem;"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                                    <div style="display: flex; flex-direction: column; gap: 0.3rem;">
                                        <span style="font-size: 0.8rem; font-weight: 600; color: #64748b;">Role</span>
                                        <span style="font-size: 1rem; font-weight: 600; color: #1e293b;">SMTR Requestor, SMTR Shipping Clerk, SMTR Supervisor</span>
                                    </div>
                                </div>
                            </div>

                            <!-- Right Column (Email, Location) -->
                            <div style="flex: 1 1 300px; display: flex; flex-direction: column; gap: 2rem;">
                                <div style="display: flex; gap: 1rem;">
                                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#64748b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-top: 0.2rem;"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                                    <div style="display: flex; flex-direction: column; gap: 0.3rem;">
                                        <span style="font-size: 0.8rem; font-weight: 600; color: #64748b;">Email</span>
                                        <span style="font-size: 1rem; font-weight: 600; color: #334155;">dinesh@techmantranow.com</span>
                                    </div>
                                </div>
                                <div style="display: flex; gap: 1rem;">
                                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#64748b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-top: 0.2rem;"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                                    <div style="display: flex; flex-direction: column; gap: 0.3rem;">
                                        <span style="font-size: 0.8rem; font-weight: 600; color: #64748b;">Location</span>
                                        <span style="font-size: 1rem; font-weight: 600; color: #334155;">San Francisco, CA</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    </div>
<script>
    (function() {
        var openBtn = document.getElementById('btn-open-request');
        var closeBtn = document.getElementById('btn-close-request');
        var modal = document.getElementById('request-modal');
        var btnAddLine = document.getElementById('btn-add-line');
        var btnSaveDraft = document.getElementById('btn-save-draft');
        var btnSubmitRequest = document.getElementById('btn-submit-request');
        var itemsContainer = document.getElementById('items-container');

        if (openBtn && modal) {
            openBtn.addEventListener('click', function() {
                var dashElements = document.querySelectorAll('#dashboard-view > .page-header, #dashboard-view > .cards-grid, #dashboard-view > .table-card');
                dashElements.forEach(function(el) { el.style.display = 'none'; });
                modal.classList.add('open');
                window.scrollTo(0, 0);
            });
        }

        if (closeBtn && modal) {
            closeBtn.addEventListener('click', function() {
                var dashElements = document.querySelectorAll('#dashboard-view > .page-header, #dashboard-view > .cards-grid, #dashboard-view > .table-card');
                dashElements.forEach(function(el) { el.style.display = ''; });
                modal.classList.remove('open');
            });
        }

        function setupRemoveButtons() {
            var removeBtns = modal ? modal.querySelectorAll('.row-remove-btn') : [];
            removeBtns.forEach(function(btn) {
                btn.onclick = function() {
                    if (itemsContainer && itemsContainer.querySelectorAll('.new-item-row').length > 1) {
                        btn.closest('.new-item-row').remove();
                    } else {
                        alert('You must have at least one line item.');
                    }
                };
            });
        }

        if (btnAddLine && itemsContainer) {
            btnAddLine.addEventListener('click', function() {
                var rows = itemsContainer.querySelectorAll('.new-item-row');
                if (rows.length > 0) {
                    var newRow = rows[0].cloneNode(true);
                    var inputs = newRow.querySelectorAll('input, textarea, select');
                    inputs.forEach(function(input) {
                        if (!input.readOnly && input.type !== 'button') {
                            input.value = '';
                        }
                    });
                    itemsContainer.appendChild(newRow);
                    setupRemoveButtons();
                }
            });
        }



        if (btnSubmitRequest) {
            btnSubmitRequest.addEventListener('click', function() {
                var oldHtml = btnSubmitRequest.innerHTML;
                btnSubmitRequest.innerHTML = 'Submitting...';
                setTimeout(function() {
                    alert('Request submitted successfully for approval.');
                    if (modal) {
                        var dashElements = document.querySelectorAll('#dashboard-view > .page-header, #dashboard-view > .cards-grid, #dashboard-view > .table-card');
                        dashElements.forEach(function(el) { el.style.display = ''; });
                        modal.classList.remove('open');
                    }
                    btnSubmitRequest.innerHTML = oldHtml;
                }, 1000);
            });
        }

        var infoBtns = document.querySelectorAll('.info-btn');
        var detailsView = document.getElementById('details-view');
        var dashboardView = document.getElementById('dashboard-view');
        var closeDetailsBtn = document.getElementById('btn-close-details');
        var closeProfileBtn = document.getElementById('btn-close-profile');
        var profileView = document.getElementById('profile-view');

        var profileNavItem = Array.from(document.querySelectorAll('.nav-item')).find(function(item) { return item.textContent.indexOf('Profile') > -1; });
        var dashboardNavItem = Array.from(document.querySelectorAll('.nav-item')).find(function(item) { return item.textContent.indexOf('Dashboard') > -1; });

        // Check if we should show details or profile view on load
        var urlParams = new URLSearchParams(window.location.search);
        var currentView = urlParams.get('view');
       
        if (currentView === 'details' && detailsView && dashboardView) {
            dashboardView.style.display = 'none';
            detailsView.style.display = 'block';
            if (profileView) profileView.style.display = 'none';
            if (dashboardNavItem) dashboardNavItem.classList.remove('active');
            if (profileNavItem) profileNavItem.classList.remove('active');
        } else if (currentView === 'profile' && profileView && dashboardView) {
            dashboardView.style.display = 'none';
            if (detailsView) detailsView.style.display = 'none';
            profileView.style.display = 'block';
            if (dashboardNavItem) dashboardNavItem.classList.remove('active');
            if (profileNavItem) profileNavItem.classList.add('active');
        } else {
            if (dashboardNavItem) dashboardNavItem.classList.add('active');
            if (profileNavItem) profileNavItem.classList.remove('active');
        }

        if (profileNavItem) {
            profileNavItem.addEventListener('click', function() {
                var url = new URL(window.location.href);
                url.searchParams.set('view', 'profile');
                var form = document.getElementById('navigation-form');
                if (form) {
                    form.action = url.href;
                    form.submit();
                }
            });
        }
       
        if (dashboardNavItem) {
            dashboardNavItem.addEventListener('click', function() {
                var url = new URL(window.location.href);
                url.searchParams.delete('view');
                var form = document.getElementById('navigation-form');
                if (form) {
                    form.action = url.href;
                    form.submit();
                }
            });
        }

        infoBtns.forEach(function(btn) {
            btn.addEventListener('click', function() {
                var url = new URL(window.location.href);
                url.searchParams.set('view', 'details');
                var form = document.getElementById('navigation-form');
                if (form) {
                    form.action = url.href;
                    form.submit();
                } else {
                    window.location.href = url.href;
                }
            });
        });

        if (closeDetailsBtn) {
            closeDetailsBtn.addEventListener('click', function() {
                var url = new URL(window.location.href);
                url.searchParams.delete('view');
                var form = document.getElementById('navigation-form');
                if (form) {
                    form.action = url.href;
                    form.submit();
                } else {
                    window.location.href = url.href;
                }
            });
        }

        if (closeProfileBtn) {
            closeProfileBtn.addEventListener('click', function() {
                var url = new URL(window.location.href);
                url.searchParams.delete('view');
                var form = document.getElementById('navigation-form');
                if (form) {
                    form.action = url.href;
                    form.submit();
                } else {
                    window.location.href = url.href;
                }
            });
        }

        if (modal) {
            setupRemoveButtons();
        }

        // Nav item switching (PR List / SMTR List)
        var navPageItems = document.querySelectorAll('.nav-item[data-page]');
        var pageTitleEl = document.querySelector('.page-title');
        var pageSubEl = document.querySelector('.page-subtitle');

        navPageItems.forEach(function(item) {
            item.addEventListener('click', function() {
                navPageItems.forEach(function(n) { n.classList.remove('active'); });
                item.classList.add('active');

                var page = item.getAttribute('data-page');
                if (page === 'pr-list') {
                    pageTitleEl.innerHTML = '<strong>PR</strong> List';
                    if(pageSubEl) pageSubEl.textContent = 'Overview of your purchase requests and approvals';
                } else if (page === 'smtr-list') {
                    pageTitleEl.innerHTML = '<strong>SMTR</strong> List';
                    if(pageSubEl) pageSubEl.textContent = 'Overview of your SMTR requests and records';
                }
            });
        });
    })();
</script>
</body>
</html>`;
        }

        return {
            onRequest
        };
    }
);