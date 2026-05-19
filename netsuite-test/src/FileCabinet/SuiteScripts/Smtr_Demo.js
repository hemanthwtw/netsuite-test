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
                        writeHtmlResponse(response, getDashboardHtml(email));
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
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        body {
            font-family: 'Inter', system-ui, sans-serif;
            min-height: 100vh;
            background: #fff;
            color: #0f172a;
            -webkit-font-smoothing: antialiased;
            overflow-x: hidden;
        }

        .login-root {
            min-height: 100vh;
            display: flex;
            align-items: stretch;
        }

        /* ---- LEFT PANEL ---- */
        .left-panel {
            flex: 1;
            min-width: 360px;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 4rem 3rem;
            background: linear-gradient(135deg, #0d47a1 0%, #1565c0 45%, #1976d2 90%);
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

        /* ---- RIGHT PANEL ---- */
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
            background: #0d47a1;
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
            color: #0f172a;
            margin-bottom: 0.6rem;
            text-align: center;
        }

        .divider {
            width: 52px;
            height: 4px;
            margin: 0 auto 1.8rem;
            border-radius: 999px;
            background: linear-gradient(135deg, #1565c0, #0d47a1);
        }

        .input-wrapper {
            position: relative;
        }

        .field-input {
            width: 100%;
            padding: 1rem 1.1rem 1rem 3.6rem;
            border: 2px solid #e2e8f0;
            border-radius: 14px;
            font-size: 1rem;
            color: #0f172a;
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
            color: #64748b;
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

        .form-title {
            font-size: 2rem;
            font-weight: 700;
            color: #0f172a;
            letter-spacing: -0.02em;
            margin-bottom: 0.5rem;
        }

        .form-subtitle {
            font-size: 0.95rem;
            color: #64748b;
            line-height: 1.6;
        }

        .form-subtitle strong {
            color: #1565c0;
            font-weight: 600;
        }

        /* ---- FIELDS ---- */
        .field-group {
            display: flex;
            flex-direction: column;
            gap: 0.6rem;
            margin-bottom: 1.8rem;
        }

        .field-label {
            font-size: 0.85rem;
            font-weight: 600;
            color: #1e293b;
            letter-spacing: 0.02em;
            text-transform: uppercase;
            text-align: left;
        }

        .input-wrapper {
            position: relative;
        }

        .field-input {
            width: 100%;
            padding: 1rem 1.1rem;
            border: 2px solid #e2e8f0;
            border-radius: 14px;
            font-size: 0.96rem;
            color: #0f172a;
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
            border-color: #1976d2;
            background: rgba(255, 255, 255, 0.95);
            box-shadow: 0 0 0 5px rgba(25, 118, 210, 0.12);
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
            background: linear-gradient(135deg, rgba(25, 118, 210, 0.08), rgba(25, 118, 210, 0.04));
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

        /* ---- BUTTON ---- */
        .btn-primary {
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.65rem;
            padding: 1rem 1.4rem;
            background: linear-gradient(135deg, #1565c0 0%, #0d47a1 100%);
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
            box-shadow: 0 12px 32px rgba(13, 71, 161, 0.32), 0 0 0 4px rgba(25, 118, 210, 0.12);
        }

        .btn-primary:hover:not(.loading)::before {
            left: 100%;
        }

        .btn-primary:active:not(.loading) {
            transform: translateY(-1px);
        }

        .btn-primary.loading {
            background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);
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

        /* ---- OTP ---- */
        .otp-icon {
            width: 56px;
            height: 56px;
            border-radius: 50%;
            background: linear-gradient(135deg, rgba(25, 118, 210, 0.15), rgba(25, 118, 210, 0.08));
            display: flex;
            align-items: center;
            justify-content: center;
            color: #1565c0;
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
            color: #0f172a;
            border: 2px solid #e2e8f0;
            border-radius: 14px;
            background: rgba(255, 255, 255, 0.8);
            backdrop-filter: blur(8px);
            outline: none;
            transition: all 0.25s cubic-bezier(0.22, 1, 0.36, 1);
            caret-color: #1565c0;
        }

        .otp-input:focus {
            border-color: #1565c0;
            background: #fff;
            box-shadow: 0 0 0 5px rgba(25, 118, 210, 0.12), 0 8px 20px rgba(25, 118, 210, 0.15);
            transform: scale(1.08) translateY(-2px);
        }

        .otp-input.otp-input--filled {
            border-color: #1565c0;
            background: linear-gradient(135deg, #eff6ff 0%, #f0f7ff 100%);
            color: #1565c0;
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
            color: #1565c0;
            font-weight: 600;
            animation: fadeIn 0.3s ease;
            margin-bottom: 1rem;
        }

        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }

        /* ---- RESEND ---- */
        .resend-text {
            font-size: 0.88rem;
            color: #64748b;
            text-align: center;
            margin-top: 0.5rem;
        }

        .resend-btn {
            background: none;
            border: none;
            color: #1565c0;
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
            background: #1565c0;
            transform: scaleX(0);
            transition: transform 0.3s cubic-bezier(0.22, 1, 0.36, 1);
        }

        .resend-btn:hover::after {
            transform: scaleX(1);
        }

        /* ---- BACK BUTTON ---- */
        .back-btn {
            background: none;
            border: none;
            color: #64748b;
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
            color: #1565c0;
            transform: translateX(-2px);
        }

        /* ---- VERIFIED ---- */
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
            color: #64748b;
            margin-bottom: 1.5rem;
        }

        .progress-bar {
            width: 100%;
            height: 3px;
            background: #e2e8f0;
            border-radius: 2px;
            overflow: hidden;
        }

        .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #1565c0, #1976d2);
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

        /* ---- RESPONSIVE ---- */
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
            .brand-logo { height: 50px !important; }
            .shape-1 { width: 200px; height: 200px; }
            .shape-2 { width: 130px; height: 130px; }
            .shape-3 { width: 100px; height: 100px; }
            .form-title { font-size: 1.5rem; }
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

        function getDashboardHtml(email) {
            const safeEmail = escapeHtml(email || 'Supervisor');
            return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>TRACKnow Requestor Dashboard</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        body {
            font-family: 'Inter', system-ui, sans-serif;
            background-color: #f4f7fb;
            color: #1e293b;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            overflow-x: hidden;
            -webkit-font-smoothing: antialiased;
        }

        button {
            font: inherit;
            border: none;
            background: none;
            cursor: pointer;
        }

        a {
            text-decoration: none;
            color: inherit;
        }

        .dashboard-root {
            display: flex;
            min-height: 100vh;
        }

        /* ---- SIDEBAR ---- */
        .sidebar {
            width: 240px;
            background-color: #06182c;
            padding: 1.5rem 1rem;
            display: flex;
            flex-direction: column;
            gap: 1.5rem;
            flex-shrink: 0;
            border-right: 1px solid rgba(255, 255, 255, 0.05);
        }

        .brand {
            color: #ffffff;
            font-size: 1.15rem;
            font-weight: 800;
            letter-spacing: 0.2em;
            text-transform: uppercase;
            padding: 0.25rem 0.5rem;
            margin-bottom: 0.5rem;
        }

        .nav {
            display: flex;
            flex-direction: column;
            gap: 0.25rem;
            flex: 1;
        }

        .nav-item {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            padding: 0.65rem 0.75rem;
            border-radius: 8px;
            color: #94a3b8;
            cursor: pointer;
            transition: all 0.2s ease;
            font-size: 0.85rem;
            font-weight: 500;
        }

        .nav-item svg {
            width: 16px;
            height: 16px;
            flex-shrink: 0;
            stroke: currentColor;
            fill: none;
            stroke-width: 2;
        }

        .nav-item.active {
            background-color: #0d52d6;
            color: #ffffff;
        }

        .nav-item:hover:not(.active) {
            background-color: rgba(255, 255, 255, 0.05);
            color: #ffffff;
        }

        .nav-divider {
            height: 1px;
            background-color: rgba(255, 255, 255, 0.08);
            margin: 0.5rem 0;
        }

        .sidebar-footer {
            margin-top: auto;
            display: flex;
            align-items: center;
            gap: 0.6rem;
            padding: 0.75rem 0.5rem;
            border-top: 1px solid rgba(255, 255, 255, 0.08);
            color: #ffffff;
        }

        .user-avatar {
            width: 32px;
            height: 32px;
            border-radius: 50%;
            background-color: #10b981;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            font-size: 0.8rem;
            color: #ffffff;
            flex-shrink: 0;
        }

        .user-info {
            flex: 1;
            display: flex;
            flex-direction: column;
            overflow: hidden;
        }

        .user-name {
            font-size: 0.8rem;
            font-weight: 600;
            color: #ffffff;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .user-role {
            font-size: 0.7rem;
            color: #64748b;
        }

        .sidebar-chevron {
            color: #64748b;
            width: 14px;
            height: 14px;
            flex-shrink: 0;
        }

        /* ---- MAIN CONTENT ---- */
        .main {
            flex: 1;
            display: flex;
            flex-direction: column;
            min-width: 0;
        }

        /* ---- TOPBAR ---- */
        .topbar {
            height: 52px;
            background-color: #ffffff;
            border-bottom: 1px solid #e2e8f0;
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 1.5rem;
            flex-shrink: 0;
        }

        .topbar-left {
            display: flex;
            align-items: center;
            gap: 1rem;
            flex: 1;
        }

        .hamburger-btn {
            color: #64748b;
            display: flex;
            align-items: center;
            transition: color 0.15s ease;
        }

        .hamburger-btn:hover {
            color: #0f172a;
        }

        .hamburger-btn svg {
            width: 18px;
            height: 18px;
            stroke-width: 2;
        }

        .search-bar {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            background-color: #f1f5f9;
            border-radius: 8px;
            padding: 0.35rem 0.65rem;
            width: 240px;
            border: 1px solid transparent;
            transition: all 0.15s ease;
        }

        .search-bar:focus-within {
            border-color: #cbd5e1;
            background-color: #ffffff;
            box-shadow: 0 0 0 3px rgba(15, 23, 42, 0.04);
        }

        .search-bar svg, .search-bar i {
            font-size: 14px;
            width: 14px;
            height: 14px;
            color: #94a3b8;
            stroke-width: 2.5;
        }

        .search-bar input {
            border: none;
            background: transparent;
            outline: none;
            font-size: 0.8rem;
            color: #334155;
            width: 100%;
        }

        .search-bar input::placeholder {
            color: #94a3b8;
        }

        .search-shortcut {
            font-size: 0.68rem;
            color: #94a3b8;
            background-color: #ffffff;
            border: 1px solid #e2e8f0;
            padding: 0.05rem 0.25rem;
            border-radius: 4px;
            font-weight: 500;
        }

        .topbar-right {
            display: flex;
            align-items: center;
            gap: 1.25rem;
        }

        .notification-badge {
            position: relative;
            cursor: pointer;
            color: #475569;
            display: flex;
            align-items: center;
            transition: color 0.15s ease;
        }

        .notification-badge:hover {
            color: #0f172a;
        }

        .notification-badge svg {
            width: 18px;
            height: 18px;
            stroke-width: 2;
        }

        .notification-count {
            position: absolute;
            top: -5px;
            right: -5px;
            background-color: #2563eb;
            color: #ffffff;
            font-size: 0.65rem;
            font-weight: 700;
            width: 14px;
            height: 14px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .top-profile-dropdown {
            display: flex;
            align-items: center;
            gap: 0.35rem;
            cursor: pointer;
            padding: 0.25rem 0.5rem;
            border-radius: 6px;
            transition: background-color 0.15s ease;
        }

        .top-profile-dropdown:hover {
            background-color: #f1f5f9;
        }

        .top-profile-name {
            font-size: 0.8rem;
            font-weight: 600;
            color: #334155;
        }

        .top-profile-chevron {
            width: 14px;
            height: 14px;
            color: #64748b;
            stroke-width: 2.5;
        }

        /* ---- CONTAINER ---- */
        .container {
            padding: 1.25rem 1.5rem;
            display: flex;
            flex-direction: column;
            gap: 1.25rem;
            flex: 1;
        }

        /* ---- HEADER TITLE BLOCK ---- */
        .page-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
        }

        .page-title {
            font-size: 1.35rem;
            font-weight: 500;
            color: #0f172a;
            letter-spacing: -0.01em;
        }

        .page-title strong {
            font-weight: 800;
        }

        .page-subtitle {
            font-size: 0.8rem;
            color: #64748b;
            margin-top: 0.1rem;
        }

        .btn-request-pr {
            display: inline-flex;
            align-items: center;
            gap: 0.35rem;
            background-color: #0d47a1;
            color: #ffffff;
            padding: 0.45rem 0.85rem;
            border-radius: 8px;
            font-size: 0.8rem;
            font-weight: 600;
            transition: background-color 0.15s ease;
        }

        .btn-request-pr:hover {
            background-color: #0b3c88;
        }

        .btn-request-pr svg {
            width: 14px;
            height: 14px;
            stroke-width: 2.5;
        }

        /* ---- METRICS GRID ---- */
        .cards-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 1rem;
        }

        .metric-card {
            background-color: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 1rem;
            position: relative;
            overflow: hidden;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            min-height: 105px;
        }

        .metric-card.primary {
            background: linear-gradient(135deg, #1565c0 0%, #0d47a1 100%);
            color: #ffffff;
            border: none;
        }

        .card-top {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 0.5rem;
        }

        .metric-icon-badge {
            width: 28px;
            height: 28px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
        }

        .metric-card.primary .metric-icon-badge {
            background-color: rgba(255, 255, 255, 0.15);
            color: #ffffff;
        }

        .metric-card.orange .metric-icon-badge {
            background-color: #fff7ed;
            color: #ea580c;
        }

        .metric-card.green .metric-icon-badge {
            background-color: #f0fdf4;
            color: #16a34a;
        }

        .metric-card.blue .metric-icon-badge {
            background-color: #eff6ff;
            color: #2563eb;
        }

        .metric-icon-badge svg {
            width: 14px;
            height: 14px;
            stroke-width: 2.2;
        }

        .card-watermark {
            position: absolute;
            bottom: -8px;
            right: -8px;
            opacity: 0.08;
            pointer-events: none;
            width: 72px;
            height: 72px;
            color: currentColor;
        }

        .metric-label {
            font-size: 0.7rem;
            font-weight: 600;
            color: #475569;
            text-transform: uppercase;
            letter-spacing: 0.02em;
        }

        .metric-card.primary .metric-label {
            color: rgba(255, 255, 255, 0.75);
        }

        .metric-value {
            font-size: 1.55rem;
            font-weight: 800;
            color: #0f172a;
            line-height: 1.15;
            margin: 0.1rem 0;
        }

        .metric-card.primary .metric-value {
            color: #ffffff;
        }

        .metric-note {
            font-size: 0.72rem;
            color: #64748b;
        }

        .metric-card.primary .metric-note {
            color: rgba(255, 255, 255, 0.75);
        }

        /* ---- TABLE SECTION ---- */
        .table-card {
            background-color: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
            display: flex;
            flex-direction: column;
        }

        .request-modal-overlay {
            position: fixed;
            inset: 0;
            background: rgba(15, 23, 42, 0.4);
            backdrop-filter: blur(6px);
            display: none;
            align-items: center;
            justify-content: center;
            padding: 2vh 2vw;
            z-index: 9999;
        }

        .request-modal-overlay.open {
            display: flex;
        }

        .request-modal {
            width: 100%;
            height: 100%;
            max-width: 100%;
            max-height: 100%;
            overflow: auto;
            background: #ffffff;
            border-radius: 16px;
            box-shadow: 0 40px 100px rgba(15, 23, 42, 0.2);
            padding: 2rem;
        }

        .request-modal-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 1rem;
            margin-bottom: 1.25rem;
        }

        .request-label {
            font-size: 0.75rem;
            font-weight: 700;
            letter-spacing: 0.12em;
            text-transform: uppercase;
            color: #0f172a;
            margin-bottom: 0.2rem;
        }

        .request-title {
            font-size: 1.3rem;
            font-weight: 800;
            color: #0f172a;
            margin: 0;
        }

        .modal-close {
            width: 36px;
            height: 36px;
            border-radius: 50%;
            background: #f8fafc;
            color: #0f172a;
            font-size: 1.5rem;
            line-height: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 1px solid #e2e8f0;
            cursor: pointer;
        }

        .request-stepper {
            display: flex;
            gap: 0.75rem;
            margin-bottom: 1.5rem;
            background: #f8fafc;
            border-radius: 999px;
            padding: 0.4rem;
        }

        .step {
            display: flex;
            align-items: center;
            gap: 0.65rem;
            padding: 0.55rem 0.9rem;
            border-radius: 999px;
            background: transparent;
            color: #64748b;
        }

        .step.active {
            background: #0f172a;
            color: #ffffff;
        }

        .step span {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 26px;
            height: 26px;
            border-radius: 50%;
            background: currentColor;
            color: #ffffff;
            font-size: 0.8rem;
            font-weight: 700;
        }

        .step p {
            margin: 0;
            font-size: 0.78rem;
            font-weight: 600;
        }

        .request-form {
            display: grid;
            grid-template-columns: 2fr 1fr;
            gap: 1rem;
        }

        .request-card {
            background: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 16px;
            padding: 1.25rem;
            box-shadow: 0 16px 40px rgba(15, 23, 42, 0.06);
        }

        .request-card-header {
            display: flex;
            align-items: center;
            gap: 0.9rem;
            margin-bottom: 1rem;
        }

        .request-card-header.simple {
            margin-bottom: 1rem;
        }

        .request-card-number {
            width: 32px;
            height: 32px;
            border-radius: 50%;
            background: #eff6ff;
            color: #0f172a;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
        }

        .request-card-title {
            font-size: 1rem;
            font-weight: 700;
            margin-bottom: 0.2rem;
        }

        .request-card-subtitle {
            margin: 0;
            font-size: 0.8rem;
            color: #64748b;
        }

        .request-grid {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 1rem;
            margin-bottom: 1rem;
        }

        .request-field {
            display: flex;
            flex-direction: column;
            gap: 0.45rem;
            font-size: 0.75rem;
            color: #475569;
        }

        .request-field span {
            font-weight: 600;
        }

        .request-field input,
        .request-field select,
        .request-field textarea {
            width: 100%;
            min-height: 40px;
            padding: 0.85rem 0.95rem;
            border: 1px solid #cbd5e1;
            border-radius: 12px;
            background: #fbfcfd;
            color: #334155;
            font-size: 0.9rem;
            outline: none;
            transition: border-color 0.15s ease, box-shadow 0.15s ease;
        }

        .request-field input:focus,
        .request-field select:focus,
        .request-field textarea:focus {
            border-color: #94a3b8;
            box-shadow: 0 0 0 4px rgba(148, 163, 184, 0.12);
        }

        .request-field textarea {
            resize: vertical;
            min-height: 120px;
        }

        .request-file input[type="file"] {
            padding: 0.65rem 0.75rem;
            border-radius: 12px;
            background: #ffffff;
        }

        .request-notes {
            grid-column: span 2;
        }

        .request-items-card {
            grid-column: span 2;
        }

        .item-table-wrapper {
            border: 1px solid #e2e8f0;
            border-radius: 14px;
            overflow: hidden;
        }

        .item-table-header {
            display: grid;
            grid-template-columns: 2fr 1fr 1fr 1fr auto;
            gap: 0.75rem;
            background: #f8fbff;
            padding: 1rem;
            font-size: 0.75rem;
            font-weight: 700;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 0.03em;
        }

        .item-row {
            display: grid;
            grid-template-columns: 2fr 1fr 1fr 1fr auto;
            gap: 0.75rem;
            align-items: center;
            padding: 1rem;
            background: #ffffff;
        }

        .item-row select,
        .item-row input {
            width: 100%;
            border-radius: 12px;
            border: 1px solid #cbd5e1;
            background: #fbfcfd;
            padding: 0.75rem 0.9rem;
        }

        .row-remove {
            width: 36px;
            height: 36px;
            border-radius: 50%;
            background: #fee2e2;
            color: #dc2626;
            font-size: 1.1rem;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            border: 1px solid #fecaca;
        }

        .request-total-row {
            margin-top: 1rem;
            padding: 1rem 1rem 0;
            display: flex;
            align-items: center;
            justify-content: space-between;
            font-weight: 700;
            color: #0f172a;
        }

        .request-actions-row {
            margin-top: 1.25rem;
            display: flex;
            justify-content: flex-end;
            gap: 0.75rem;
        }

        .request-action {
            padding: 0.9rem 1.2rem;
            border-radius: 12px;
            font-weight: 700;
            min-width: 140px;
        }

        .request-action.secondary {
            background: #ffffff;
            color: #0f172a;
            border: 1px solid #cbd5e1;
        }

        .request-action.primary {
            background: #10b981;
            color: #ffffff;
        }

        .request-action.primary:hover {
            background: #0f9d70;
        }

        .request-action.secondary:hover {
            background: #f8fafc;
        }

        .request-actions-row .request-action svg {
            width: 14px;
            height: 14px;
            stroke-width: 2.5;
        }

        .request-actions-row .request-action.primary {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
        }

        .request-actions-row .request-action.secondary {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
        }

        .request-actions-row .request-action svg {
            stroke: currentColor;
        }

        .request-modal-overlay.open .request-modal {
            transform: translateY(0);
        }

        .request-modal {
            transform: translateY(20px);
            transition: transform 0.2s ease;
        }

        @media (max-width: 900px) {
            .request-form {
                grid-template-columns: 1fr;
            }

            .request-grid {
                grid-template-columns: 1fr;
            }
        }

        @media (max-width: 600px) {
            .request-modal {
                padding: 1rem;
            }

            .request-modal-header,
            .request-stepper,
            .request-actions-row {
                flex-direction: column;
                align-items: stretch;
            }

            .request-actions-row {
                align-items: stretch;
            }
        }

        .table-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0.85rem 1.25rem;
            border-bottom: 1px solid #e2e8f0;
        }

        .table-header h2 {
            font-size: 0.95rem;
            font-weight: 700;
            color: #0f172a;
        }

        .table-actions {
            display: flex;
            align-items: center;
            gap: 0.4rem;
        }

        .pill-select {
            padding: 0.35rem 0.65rem;
            border-radius: 6px;
            border: 1px solid #cbd5e1;
            background-color: #ffffff;
            font-size: 0.75rem;
            font-weight: 500;
            color: #475569;
            cursor: pointer;
            outline: none;
            height: 28px;
        }

        .pill-button {
            display: inline-flex;
            align-items: center;
            gap: 0.3rem;
            padding: 0.35rem 0.65rem;
            border-radius: 6px;
            border: 1px solid #cbd5e1;
            background-color: #ffffff;
            font-size: 0.75rem;
            font-weight: 500;
            color: #475569;
            cursor: pointer;
            height: 28px;
            transition: all 0.15s ease;
        }

        .pill-button:hover {
            border-color: #94a3b8;
            color: #0f172a;
        }

        .pill-button svg {
            width: 12px;
            height: 12px;
            stroke-width: 2.2;
        }

        .requests-table {
            width: 100%;
            border-collapse: collapse;
            text-align: left;
        }

        .requests-table th {
            padding: 0.65rem 1rem;
            font-size: 0.68rem;
            font-weight: 700;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 0.04em;
            border-bottom: 1px solid #e2e8f0;
            background-color: #f8fafc;
        }

        .requests-table th.sortable {
            cursor: pointer;
            transition: color 0.15s ease;
        }

        .requests-table th.sortable:hover {
            color: #0f172a;
        }

        .sort-icon {
            display: inline-flex;
            align-items: center;
            margin-left: 0.2rem;
            vertical-align: middle;
        }

        .sort-icon svg {
            width: 10px;
            height: 10px;
            stroke-width: 2.5;
        }

        .requests-table tbody tr {
            border-bottom: 1px solid #f1f5f9;
            transition: background-color 0.1s ease;
        }

        .requests-table tbody tr:hover {
            background-color: #f8fafc;
        }

        .requests-table tbody tr:last-child {
            border-bottom: none;
        }

        .requests-table td {
            padding: 0.75rem 1rem;
            font-size: 0.8rem;
            color: #334155;
            vertical-align: middle;
        }

        .status-pill {
            display: inline-flex;
            align-items: center;
            gap: 0.3rem;
            padding: 0.2rem 0.5rem;
            border-radius: 999px;
            font-size: 0.72rem;
            font-weight: 600;
        }

        .status-pill.status-pending {
            background-color: #fff7ed;
            color: #ea580c;
        }

        .status-pill.status-approved {
            background-color: #f0fdf4;
            color: #16a34a;
        }

        .status-dot {
            width: 5px;
            height: 5px;
            border-radius: 50%;
            display: inline-block;
        }

        .status-pill.status-pending .status-dot {
            background-color: #ea580c;
        }

        .status-pill.status-approved .status-dot {
            background-color: #16a34a;
        }

        .info-btn {
            width: 24px;
            height: 24px;
            border-radius: 50%;
            background-color: #f1f5f9;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            color: #64748b;
            transition: all 0.15s ease;
        }

        .info-btn:hover {
            background-color: #e2e8f0;
            color: #0f172a;
            transform: scale(1.05);
        }

        .info-btn svg {
            width: 12px;
            height: 12px;
            stroke-width: 2.5;
        }

        /* ---- RESPONSIVE DESIGN ---- */
        @media (max-width: 1100px) {
            .cards-grid {
                grid-template-columns: repeat(2, 1fr);
            }
        }

        @media (max-width: 800px) {
            .dashboard-root {
                flex-direction: column;
            }
            .sidebar {
                width: 100%;
                height: auto;
                padding: 1rem;
            }
            .sidebar-footer {
                margin-top: 1rem;
            }
            .cards-grid {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>
<body>
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
                        <i class="bi bi-search"></i>
                        <input type="text" id="search-input" placeholder="Search anything..." aria-label="Search dashboard" />
                        <span class="search-shortcut">&#8984; K</span>
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
                <!-- PAGE HEADER -->
                <div class="page-header">
                    <div>
                        <h1 class="page-title"><strong>PR</strong> List</h1>
                        <p class="page-subtitle">Overview of your purchase requests and approvals</p>
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
                            <span style="background: #10b981; color: #fff;">1</span><p style="color: #ffffff;">Fill Details</p>
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
                            <div class="request-card" style="border-top: 4px solid #10b981;">
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
                            <div class="request-card" style="background: #f8fafc; border: 1px solid #d1fae5; border-radius: 12px; padding: 1.5rem;">
                                <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1.5rem;">
                                    <div style="width: 36px; height: 36px; border-radius: 8px; background: #ecfdf5; color: #10b981; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 1.2rem; flex-shrink: 0;">!</div>
                                    <div>
                                        <p style="font-weight: 700; color: #0f172a; margin: 0; font-size: 0.95rem;">Tips Before Submitting</p>
                                        <p style="font-size: 0.8rem; color: #10b981; margin: 0; font-weight: 500;">Avoid common rejection reasons</p>
                                    </div>
                                </div>
                                
                                <div style="display: flex; flex-direction: column; gap: 1rem;">
                                    <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 1rem; display: flex; gap: 0.8rem;">
                                        <div style="color: #f59e0b; flex-shrink: 0;"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg></div>
                                        <div>
                                            <p style="font-size: 0.8rem; font-weight: 700; color: #0f172a; margin: 0 0 0.2rem 0;">Be specific.</p>
                                            <p style="font-size: 0.75rem; color: #64748b; margin: 0; line-height: 1.4;">Approvers prefer concrete deliverables and measurable outcomes.</p>
                                        </div>
                                    </div>
                                    <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 1rem; display: flex; gap: 0.8rem;">
                                        <div style="color: #f59e0b; flex-shrink: 0;"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg></div>
                                        <div>
                                            <p style="font-size: 0.8rem; font-weight: 700; color: #0f172a; margin: 0 0 0.2rem 0;">Mind the budget tier.</p>
                                            <p style="font-size: 0.75rem; color: #64748b; margin: 0; line-height: 1.4;">Higher amounts are routed to senior approvers and take longer.</p>
                                        </div>
                                    </div>
                                    <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 1rem; display: flex; gap: 0.8rem;">
                                        <div style="color: #f59e0b; flex-shrink: 0;"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg></div>
                                        <div>
                                            <p style="font-size: 0.8rem; font-weight: 700; color: #0f172a; margin: 0 0 0.2rem 0;">Save often.</p>
                                            <p style="font-size: 0.75rem; color: #64748b; margin: 0; line-height: 1.4;">Use "Save Draft" at any time — your work won't be lost.</p>
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
                                        <button type="button" id="btn-save-draft" style="background: #ffffff; border: 1px solid #cbd5e1; color: #0f172a; display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.6rem 1.2rem; border-radius: 6px; font-size: 0.85rem; font-weight: 600; cursor: pointer;">
                                            Save Draft
                                        </button>
                                        <button type="button" id="btn-submit-request" style="background: #38b2ac; color: #ffffff; border: none; padding: 0.6rem 1.2rem; border-radius: 6px; font-size: 0.85rem; font-weight: 600; display: inline-flex; align-items: center; gap: 0.4rem; cursor: pointer;">
                                            Submit Request
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16" style="margin-left: 0.2rem;"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Submission Summary -->
                        <div class="request-card" style="border-top: 4px solid #14b8a6; background: #f8fafc; border-bottom: 1px solid #e2e8f0; border-left: 1px solid #e2e8f0; border-right: 1px solid #e2e8f0; padding: 1.5rem;">
                            <div class="request-card-header" style="margin-bottom: 1.5rem;">
                                <div class="request-card-number" style="background: #e0f2fe; color: #0ea5e9;">i</div>
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
                modal.classList.add('open');
                document.body.style.overflow = 'hidden';
            });
        }

        if (closeBtn && modal) {
            closeBtn.addEventListener('click', function() {
                modal.classList.remove('open');
                document.body.style.overflow = '';
            });
        }

        if (modal) {
            modal.addEventListener('click', function(event) {
                if (event.target === modal) {
                    modal.classList.remove('open');
                    document.body.style.overflow = '';
                }
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

        if (btnSaveDraft) {
            btnSaveDraft.addEventListener('click', function() {
                var oldText = btnSaveDraft.innerText;
                btnSaveDraft.innerText = 'Saving...';
                setTimeout(function() {
                    btnSaveDraft.innerText = 'Draft Saved!';
                    setTimeout(function() { btnSaveDraft.innerText = oldText; }, 2000);
                }, 800);
            });
        }

        if (btnSubmitRequest) {
            btnSubmitRequest.addEventListener('click', function() {
                var oldHtml = btnSubmitRequest.innerHTML;
                btnSubmitRequest.innerHTML = 'Submitting...';
                setTimeout(function() {
                    alert('Request submitted successfully for approval.');
                    if (modal) {
                        modal.classList.remove('open');
                        document.body.style.overflow = '';
                    }
                    btnSubmitRequest.innerHTML = oldHtml;
                }, 1000);
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
                    pageSubEl.textContent = 'Overview of your purchase requests and approvals';
                } else if (page === 'smtr-list') {
                    pageTitleEl.innerHTML = '<strong>SMTR</strong> List';
                    pageSubEl.textContent = 'Overview of your SMTR requests and records';
                }
            });
        });
        // Search functionality
        var searchInput = document.getElementById('search-input');
        var tableRows = document.querySelectorAll('.requests-table tbody tr');

        if (searchInput) {
            searchInput.addEventListener('input', function(e) {
                var query = e.target.value.toLowerCase();
                tableRows.forEach(function(row) {
                    var rowText = row.textContent.toLowerCase();
                    if (rowText.indexOf(query) !== -1) {
                        row.style.display = '';
                    } else {
                        row.style.display = 'none';
                    }
                });
            });

            // Keyboard shortcut Cmd/Ctrl + K
            document.addEventListener('keydown', function(e) {
                if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                    e.preventDefault();
                    searchInput.focus();
                }
            });
        }
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
//-------//