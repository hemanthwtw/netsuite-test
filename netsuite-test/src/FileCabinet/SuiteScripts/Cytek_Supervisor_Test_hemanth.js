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

        var loginmobilecss = `
            @media (max-width: 576px) {
                .container-fluid {
                    padding: 0 !important;
                    align-items: center !important;
                }
                .row {
                    flex-direction: column !important;
                    align-items: center !important;
                    width: 100% !important;
                    margin: 0 !important;
                }
                .col-12.col-md-5 {
                    text-align: center !important;
                    padding: 80px 16px 20px !important;
                    margin: 0 !important;
                    width: 100% !important;
                    display: flex !important;
                    flex-direction: column !important;
                    align-items: center !important;
                    justify-content: center !important;
                }

             
                .col-12.col-md-5 h2 {
                    font-size: 19px !important;
                    text-align: center !important;
                    color: #666 !important;
                    font-weight: 700 !important;
                    margin-bottom: 6px !important;
                    letter-spacing: 0.2px !important;
                }

               
                .col-12.col-md-5 img {
                    max-width: 320px !important;
                    width: 88% !important;
                }

                .col-12.col-sm-10.col-md-6.col-xl-4 {
                    width: 100% !important;
                    padding: 0 16px 60px !important;
                    margin: 0 !important;
                }
                .card {
                    border-radius: 16px !important;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.12) !important;
                    overflow: hidden !important;
                }
                .card-header {
                    padding: 30px 20px !important;
                    border-radius: 0 !important;
                    display: flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                    text-align: center !important;
                }
                .card-header img {
                    max-width: 240px !important;
                    width: 80% !important;
                    height: auto !important;
                    display: block !important;
                    margin: 0 auto !important;
                }
                .card-body {
                    padding: 24px 24px 32px !important;
                }
                .form-control {
                    font-size: 15px !important;
                    padding: 13px 16px !important;
                    border-radius: 10px !important;
                    border: 1.5px solid #ddd !important;
                    -webkit-appearance: none;
                }
                .btn-brand-orange {
                    display: block !important;
                    width: 58% !important;
                    margin: 8px auto 0 !important;
                    padding: 14px !important;
                    font-size: 15px !important;
                    font-weight: 700 !important;
                    border-radius: 30px !important;
                    text-align: center !important;
                }
            }
            `;
        var loginPage = () => {
            return `<!DOCTYPE html>
                        <html lang="en">                          
                        <head>
                            <meta charset="UTF-8">
                            <meta name="viewport" content="width=device-width, initial-scale=1.0">
                            <title>TrackNow Login</title>
                            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
                       
                            <style>
                                body {
                                    background-color: #F0F2F5;
                                    font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
                                }
                       
                                .bg-brand-teal {
                                    background-color: #35858B;
                                }
                       
                                .btn-brand-orange {
                                    background-color: #F29D38;
                                    color: white;
                                }
                       
                                .btn-brand-orange:hover {
                                    background-color: #d68b31;
                                    color: white;
                                }
                       
                                .form-control {
                                    background-color: #f8f9fa;
                                    border: 1px solid #e9ecef;
                                }
                       
                                .form-control:focus {
                                    background-color: #fff;
                                    border-color: #35858B;
                                    box-shadow: 0 0 0 0.25rem rgba(53, 133, 139, 0.25);
                                }
                                ${loginmobilecss}
                               
                            </style>
                        </head>
                       
                        <body>
                       
                            <div class="container-fluid min-vh-100 d-flex align-items-center justify-content-center py-5">
                                <div class="row w-100 justify-content-center align-items-center">
                       
                                    <div class="col-12 col-md-5 text-center text-md-start mb-4 mb-md-0 ps-xl-4 ms-0">
                                        <h2 class="fw-bold text-secondary mb-3">Welcome to</h2>
                                        <img src="https://i.postimg.cc/HWtXzb6H/1-1-removebg-preview.png" alt="TRACKnow" class="img-fluid" style="max-width: 280px; width: 100%;" />
                                    </div>
                       
                                    <div class="col-12 col-sm-10 col-md-6 col-xl-4">
                                        <div class="card border-0 shadow-lg rounded-4 overflow-hidden">
                       
                                            <div class="card-header bg-brand-teal text-center p-4 border-0">
                                                <h1 style="color: white; font-weight: bold; margin: 0;">TRACKNOW</h1>
                                            </div>
                                            <h3 class="text-center mt-2 text-dark">SMTR Supervisor</h3>
                                            <div class="card-body px-4 pb-4 px-md-5 pb-md-5 bg-white">
                                                <form method="post" action="">
                                                    <div class="mb-4">
                                                        <label for="vendorEmail" class="form-label fw-semibold text-muted">Email</label>
                                                        <input type="email" class="form-control form-control-lg rounded-3" id="vendorEmail" name="vendorEmail" placeholder="Enter mail" required>
                                                    </div>
                       
                                                    <div class="text-center gap-2">
                                                        <button type="submit" class="btn btn-brand-orange btn-lg rounded-pill fw-bold shadow-sm w-50" name="get_otp" value="get_otp">Get OTP</button>
                                                    </div>
                                                </form>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                       
                            <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
                            <script>
                                document.addEventListener("DOMContentLoaded", function() {
                                    const loginForm = document.querySelector("form");
                                    loginForm.addEventListener("submit", function() {
                                        localStorage.setItem("tracknow_logged_in", "true");
                                    });
                                });
                            </script>
                        </body>
                        </html>`;
        };

        var verifyPage = (
            requestorId,
            email,
            prAccess,
            smtrAccess,
            prSupervisorRoleAcess,
            smtrSupervisorRoleAcess,
            errorMessage = ""
        ) => {
            var modalHtml = errorMessage
                ? `
            <div class="modal fade" id="otpErrorModal" tabindex="-1" aria-labelledby="otpErrorModalLabel" aria-hidden="true">
                <div class="modal-dialog modal-dialog-centered" style="max-width: 360px;">
                    <div class="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
                        <div class="modal-header border-0 pb-0" style="background-color: #35858B;">
                            <h6 class="modal-title text-white fw-semibold" id="otpErrorModalLabel">
                                <i class="bi bi-shield-exclamation me-2"></i>Verification Failed
                            </h6>
                        </div>
                        <div class="modal-body pt-3 pb-2 text-center">
                            <i class="bi bi-x-circle-fill text-danger mb-2" style="font-size: 2.5rem;"></i>
                            <p class="fw-semibold text-secondary mt-2 mb-0">${errorMessage}</p>
                        </div>
                        <div class="modal-footer border-0 pt-1 justify-content-center">
                            <button type="button" class="btn btn-brand-orange rounded-pill px-4 fw-bold" data-bs-dismiss="modal">OK</button>
                        </div>
                    </div>
                </div>
            </div>
            <script>
                document.addEventListener("DOMContentLoaded", function () {
                    var errorModal = new bootstrap.Modal(document.getElementById("otpErrorModal"), { backdrop: true });
                    errorModal.show();
                });
            </script>`
                : "";

            return `<!DOCTYPE html>
                        <html lang="en">                          
                        <head>
                            <meta charset="UTF-8">
                            <meta name="viewport" content="width=device-width, initial-scale=1.0">
                            <title>TrackNow Login</title>
                            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
                            <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
                            <style>
                                body { background-color: #F0F2F5; font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif; }
                                .bg-brand-teal { background-color: #35858B; }
                                .btn-brand-orange { background-color: #F29D38; color: white; }
                                .btn-brand-orange:hover { background-color: #d68b31; color: white; }
                                .form-control { background-color: #f8f9fa; border: 1px solid #e9ecef; }
                                .form-control:focus { background-color: #fff; border-color: #35858B; box-shadow: 0 0 0 0.25rem rgba(53, 133, 139, 0.25); }
                                ${loginmobilecss}
                            </style>
                        </head>
                        <body>
                            ${modalHtml}
                            <div class="container-fluid min-vh-100 d-flex align-items-center justify-content-center py-5">
                                <div class="row w-100 justify-content-center align-items-center">
                                    <div class="col-12 col-md-5 text-center text-md-start mb-4 mb-md-0 ps-xl-4 ms-0">
                                        <h2 class="fw-bold text-secondary mb-3">Welcome to</h2>
                                        <img src="https://i.postimg.cc/HWtXzb6H/1-1-removebg-preview.png" alt="TRACKnow" class="img-fluid" style="max-width: 280px; width: 100%;" />
                                    </div>
                                    <div class="col-12 col-sm-10 col-md-6 col-xl-4">
                                        <div class="card border-0 shadow-lg rounded-4 overflow-hidden">
                                            <div class="card-header bg-brand-teal text-center p-4 border-0">
                                                <h1 style="color: white; font-weight: bold; margin: 0;">TRACKNOW</h1>
                                            </div>
                                            <h3 class="text-center mt-2">SMTR Supervisor</h3>
                                            <div class="card-body px-4 pb-4 px-md-5 pb-md-5 bg-white">
                                                <form method="post" action="">
                                                    <div class="mb-4">
                                                        <h6 class="text-success">An OTP sent to <span class="fst-italic text-warning">${email}</span>.</h6>
                                                        <label for="authenticated" class="form-label fw-semibold text-muted">Verify OTP</label>
                                                        <input type="hidden" name="employeeInternalId" value="${requestorId}"/>
                                                        <input type="hidden" name="vendorEmail" value="${email}"/>
                                                        <input type="hidden" name="prSupervisorRoleAcess" value="${prSupervisorRoleAcess}"/>
                                                        <input type="hidden" name="smtrSupervisorRoleAcess" value="${smtrSupervisorRoleAcess}"/>
                                                        <input type="hidden" name="prAccess" value="${prAccess}"/>
                                                        <input type="hidden" name="smtrAccess" value="${smtrAccess}"/>
                                                        <input type="password" class="form-control form-control-lg rounded-3" id="authenticated" name="authenticated" placeholder="Enter OTP" maxlength="4" pattern="[0-9]{4}" inputmode="numeric" oninput="this.value = this.value.replace(/[^0-9]/g, '').slice(0,4)" required>
                                                    </div>
                                                    <div class="text-center gap-2">
                                                        <button type="submit" class="btn btn-brand-orange btn-lg rounded-pill fw-bold shadow-sm w-50" name="verify_otp" value="verify_otp">Verify OTP</button>
                                                    </div>
                                                </form>
                                            </div>
                                        </div>
                                    </div>                  
                                </div>
                            </div>
                            <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
                            <script>
                                document.addEventListener("DOMContentLoaded", function() {
                                    const loginForm = document.querySelector("form");
                                    loginForm.addEventListener("submit", function() {
                                        localStorage.setItem("tracknow_logged_in", "true");
                                    });
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
                    employeeRecord.setValue({
                        fieldId: "custentityotp",
                        value: "",
                        ignoreFieldChange: true
                    });
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

            if (context.request.parameters.get_otp) {
                var employeeRecord, requestorId, requestorEmail;
                var employeeSearchObj = search.create({
                    type: "employee",
                    filters: [["email", "is", context.request.parameters.vendorEmail]],
                    columns: [
                        search.createColumn({ name: "email", label: "Email" }),
                        search.createColumn({ name: "internalid", label: "Internal ID" }),
                        search.createColumn({ name: "custentity_tm_pr_po_employee_type", label: "Employee Role" }),
                        search.createColumn({ name: "custentity_tm_pr_portal", label: "Purchase Request User" })
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

                    var smtrAccess = employeeRecord.getValue({
                        fieldId: "custentity_tm_tracknow_smtr_access"
                    });

                    var prAccess = employeeRecord.getValue({
                        fieldId: "custentity_tm_pr_portal"
                    });

                    var smtrSupervisorRoleAcess = employeeRecord.getValue({
                        fieldId: "custentity_tm_tracknow_smtr_role"
                    });

                    var prSupervisorRoleAcess = employeeRecord.getValue({
                        fieldId: "custentity_tracknow_pr_access_roles"
                    });

                    if (Array.isArray(smtrSupervisorRoleAcess)) {
                        smtrSupervisorRoleAcess = smtrSupervisorRoleAcess.includes("2");
                    } else {
                        smtrSupervisorRoleAcess = smtrSupervisorRoleAcess === "2";
                    }

                    if (Array.isArray(prSupervisorRoleAcess)) {
                        prSupervisorRoleAcess = prSupervisorRoleAcess.includes("2");
                    } else {
                        prSupervisorRoleAcess = prSupervisorRoleAcess === "2";
                    }

                    var hasPRAccess = prAccess === true && prSupervisorRoleAcess === true;
                    var hasSMTRAccess = smtrAccess === true && smtrSupervisorRoleAcess === true;

                    if (hasSMTRAccess || hasPRAccess) {
                        employeeRecord.setValue({
                            fieldId: "custentityotp",
                            value: randomInt,
                            ignoreFieldChange: true
                        });
                        log.debug("randomInt", randomInt);

                        var recordId = employeeRecord.save();

                        email.send({
                            author: "4129",
                            recipients: requestorEmail,
                            subject: "TrackNow Supervisor Login OTP",
                            body: "Your TRACKnow Login OTP is: " + randomInt
                        });

                        context.response.write(
                            verifyPage(
                                requestorId,
                                context.request.parameters.vendorEmail,
                                hasPRAccess,
                                hasSMTRAccess,
                                prSupervisorRoleAcess,
                                smtrSupervisorRoleAcess
                            )
                        );
                    } else {
                        // Access denied — same pattern as shipping clerk
                        context.response.write(`<script>
                            alert("Access Denied. Please contact administrator.");
                            ${context.response.write(loginPage())};
                        </script>`);
                    }
                } catch (error) {
                    log.debug("Error in OTP Generation or Email Sending", error);
                    context.response.write(
                        `<script>
                            alert("Invalid Email. Please enter a registered email to receive OTP.");
                            ${context.response.write(loginPage())};
                        </script>`
                    );
                }
            }

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
                            log.debug("Fetching user access details", context.request.parameters.vendorEmail);
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
                        log.debug("userDetailsResponse (early)", userDetailsResponse);

                        var prAccess = false;
                        var smtrAccess = false;
                        var prSupervisorRoleAccess = parseBoolean(context.request.parameters.prSupervisorRoleAcess);
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

                                    var employeePrAccess = accessEmployeeRecord.getValue({
                                        fieldId: "custentity_tm_pr_portal"
                                    });
                                    var employeeSmtrAccess = accessEmployeeRecord.getValue({
                                        fieldId: "custentity_tm_tracknow_smtr_access"
                                    });
                                    var employeePrRole = accessEmployeeRecord.getValue({
                                        fieldId: "custentity_tracknow_pr_access_roles"
                                    });
                                    var employeeSmtrRole = accessEmployeeRecord.getValue({
                                        fieldId: "custentity_tm_tracknow_smtr_role"
                                    });

                                    prSupervisorRoleAccess = hasRoleValue(employeePrRole, "2");
                                    smtrSupervisorRoleAccess = hasRoleValue(employeeSmtrRole, "2");

                                    prAccess = parseBoolean(employeePrAccess) && prSupervisorRoleAccess;
                                    smtrAccess = parseBoolean(employeeSmtrAccess) && smtrSupervisorRoleAccess;

                                    accessResolvedFromEmployee = true;
                                } catch (accessLoadErr) {
                                    log.debug("Employee access fallback", accessLoadErr);
                                }
                            }

                            if (!accessResolvedFromEmployee) {
                                if (
                                    userDetailsResponse.roleDetails &&
                                    parseBoolean(userDetailsResponse.roleDetails.prAccess)
                                ) {
                                    prAccess = true;
                                } else if (parseBoolean(context.request.parameters.prAccess)) {
                                    prAccess = true;
                                }

                                if (
                                    userDetailsResponse.roleDetails &&
                                    parseBoolean(userDetailsResponse.roleDetails.smtrAccess)
                                ) {
                                    smtrAccess = true;
                                } else if (parseBoolean(context.request.parameters.smtrAccess)) {
                                    smtrAccess = true;
                                }

                                // Gate access by supervisor role — same as get_otp branch
                                prAccess = prAccess && prSupervisorRoleAccess;
                                smtrAccess = smtrAccess && smtrSupervisorRoleAccess;
                            }
                        }

                        log.debug("prAccess", prAccess);
                        log.debug("smtrAccess", smtrAccess);
                        log.debug("prSupervisorRoleAccess", prSupervisorRoleAccess);
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
                        } else if (smtrAccess && !prAccess) {
                            activeDashboard = "SMTRList";
                        } else if (prAccess && !smtrAccess) {
                            activeDashboard = "PRRequestorList";
                        } else {
                            activeDashboard = context.request.parameters.dashboard || "PRRequestorList";
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

                        var dashboardPage = `<!DOCTYPE html>
                            <html lang="en">                            
                            <head>
                            <script>
                            if (localStorage.getItem("tracknow_logged_in") !== "true") {
                                window.location.replace("/pr/supervisor");
                            }
                            </script>
                                <meta charset="UTF-8">
                                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                                <title>TRACKnow Dashboard | Cytek</title>
                                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
                                <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
                                <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/choices.js/public/assets/styles/choices.min.css" />
                                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
                                <style>
                                    :root {
                                        --brand-teal: #35858B;
                                        --brand-teal-dark: #2a6a70;
                                        --brand-orange: #F29D38;
                                        --brand-bg-light: #F0F2F5;
                                        --brand-text-dark: #343a40;
                                        --sidebar-width: 250px;
                                        --top-nav-height: 60px;
                                        --mobile-top-nav-height: 110px;
                                    }
                   
                                    body {
                                        background-color: var(--brand-bg-light);
                                        font-family: 'Inter', 'Segoe UI', sans-serif;
                                        color: var(--brand-text-dark);
                                        overflow-x: hidden;
                                    }
                           
                                    .navbar-top {
                                        height: var(--top-nav-height);
                                        background-color: var(--brand-teal);
                                        box-shadow: 0 2px 4px rgba(0,0,0,0.08);
                                        z-index: 1020;
                                    }
                           
                                    .navbar-brand img { height: 32px; }

                                    .search-container .search-form {
                                        width: 50%;
                                    }
                           
                                    .search-form .form-control {
                                        background-color: rgba(255,255,255,0.15);
                                        border: none;
                                        color: white;
                                        padding-left: 2.5rem;
                                        border-radius: 4px;
                                    }
                                    .search-form .form-control::placeholder { color: rgba(255,255,255,0.7); }
                                    .search-form .form-control:focus {
                                        background-color: rgba(255,255,255,0.25);
                                        box-shadow: none;
                                        color: white;
                                    }
                                    .search-icon {
                                        position: absolute; left: 10px; top: 50%;
                                        transform: translateY(-50%);
                                        color: rgba(255,255,255,0.7);
                                        pointer-events: none;
                                    }
                                    .nav-icon-link {
                                        color: rgba(255,255,255,0.85);
                                        font-size: 1.2rem; padding: 0.5rem;
                                        transition: color 0.2s;
                                    }
                                    .nav-icon-link:hover { color: white; }
                           
                                    .sidebar {
                                        position: fixed;
                                        top: var(--top-nav-height); bottom: 0; left: 0;
                                        width: var(--sidebar-width);
                                        background-color: var(--brand-teal);
                                        padding: 20px 15px;
                                        overflow-y: hidden;
                                        z-index: 1010;
                                        transition: transform 0.3s ease-in-out;
                                    }
                                    .sidebar-brand-text {
                                        color: white; font-weight: 700; font-size: 1.4rem;
                                        margin-bottom: 30px; padding-left: 10px; letter-spacing: 0.5px;
                                    }
                                    .nav-pills .nav-link {
                                        color: rgba(255,255,255,0.85); font-weight: 500;
                                        padding: 0.8rem 1rem; margin-bottom: 0.5rem;
                                        border-radius: 6px; transition: all 0.2s;
                                        display: flex; align-items: center;
                                    }
                                    .nav-pills .nav-link i { margin-right: 12px; font-size: 1.1rem; }
                                    .nav-pills .nav-link:hover { color: white; background-color: rgba(255,255,255,0.1); }
                                    .nav-pills .nav-link.active { color: var(--brand-orange); background-color: transparent; }
                                    .nav-card.active { color: var(--brand-teal); background-color: var(--brand-orange); }
                           
                                    .main-content {
                                        margin-top: var(--top-nav-height);
                                        margin-left: var(--sidebar-width);
                                        transition: margin-left 0.3s ease-in-out;
                                    }
                                    .page-title { font-weight: 600; font-size: 1.5rem; margin-bottom: 25px; }
                           
                                    .card-stats {
                                        border: none; border-radius: 12px;
                                        box-shadow: 0 2px 6px rgba(0,0,0,0.04);
                                        transition: transform 0.2s ease-in-out;
                                    }
                                    .card-stats:hover { transform: translateY(-3px); box-shadow: 0 4px 10px rgba(0,0,0,0.06); }
                                    .card-stats .card-title { font-size: 0.95rem; font-weight: 500; }
                                    .card-stats .stats-number { font-size: 2rem; font-weight: 700; line-height: 1.2; }
                           
                                    .text-teal { color: var(--brand-teal); }
                                    .text-orange { color: var(--brand-orange); }
                                    .stats-icon-container { font-size: 2.5rem; opacity: 0.8; }
                           
                                    .card-table {
                                        border: none; border-radius: 12px;
                                        box-shadow: 0 2px 6px rgba(0,0,0,0.04);
                                        overflow: hidden;
                                        margin-bottom: 150px;
                                    }
                                    .card-table .card-header {
                                        background-color: white;
                                        border-bottom: 1px solid #edf2f9;
                                        padding: 20px 25px;
                                        font-weight: 600; font-size: 1.1rem;
                                    }

                                    /* Keep dropdown visible in detail cards without breaking page/table layout */
                                    .detail-page .card-table {
                                        overflow: visible;
                                    }

                                    /* Keep table scrollbars available */
                                    .table-responsive {
                                        overflow-x: auto !important;
                                        overflow-y: hidden !important;
                                        pointer-events: auto !important;
                                        -webkit-overflow-scrolling: touch;
                                    }
                                    .table-responsive.choices-open {
                                        overflow-x: auto !important;
                                        overflow-y: visible !important;
                                    }
                                    .table-responsive > * {
                                        pointer-events: auto;
                                    }
                                   
                                    /* Choices.js Custom Overrides */
                                    .choices__inner {
                                        background-color: #fff;
                                        border: 1px solid #dee2e6;
                                        border-radius: 0.375rem;
                                        min-height: 31px;
                                        padding: 2px 10px;
                                    }
                                    .choices__input { background-color: transparent; margin-bottom: 0; font-size: 14px; }
                                    .choices[data-type*="select-one"].is-open .choices__list--dropdown,
                                    .choices[data-type*="select-one"].is-open .choices__list[aria-expanded] {
                                        top: 100% !important;
                                        bottom: auto !important;
                                        margin-top: 6px;
                                        margin-bottom: 0 !important;
                                    }
                                    .choices__list--dropdown,
                                    .choices__list[aria-expanded] {
                                        z-index: 12000 !important;
                                        overflow: visible;
                                        display: flex !important;
                                        flex-direction: column !important;
                                    }
                                    .choices__list--dropdown .choices__input {
                                        order: 0;
                                        position: sticky;
                                        top: 0;
                                        margin-top: 0;
                                        background: #fff;
                                        z-index: 2;
                                    }
                                    .choices__list--dropdown .choices__list {
                                        order: 1;
                                        max-height: 280px;
                                        overflow-y: auto;
                                        overflow-x: hidden !important;
                                    }
                                    .choices__item--choice { padding: 8px 10px; white-space: normal !important; word-break: break-word; }
                                    .choices { position: relative; }

                                    .table-responsive {
                                        -webkit-overflow-scrolling: touch;
                                    }

                                    @media (max-width: 767.98px) {
                                        .navbar-top {
                                            height: auto;
                                            min-height: var(--mobile-top-nav-height);
                                            padding-top: 4px;
                                            padding-bottom: 4px;
                                            flex-wrap: wrap;
                                            row-gap: 6px;
                                        }
                                        .navbar-top img {
                                            max-width: 160px !important;
                                        }
                                        .navbar-top > a {
                                            margin-right: 0 !important;
                                        }
                                        .navbar-top .navbar-nav {
                                            display: none;
                                        }
                                        .main-content {
                                            margin-top: var(--mobile-top-nav-height);
                                        }
                                        .sidebar {
                                            top: var(--mobile-top-nav-height);
                                            padding-top: 28px;
                                        }
                                        .search-container {
                                            order: 2;
                                            flex: 0 0 100%;
                                            max-width: 100%;
                                            width: 100%;
                                            margin-top: 2px;
                                            margin-left: 0 !important;
                                        }
                                        .search-container .search-form {
                                            width: 100% !important;
                                        }
                                        .search-form .form-control {
                                            height: 44px;
                                            font-size: 1rem;
                                            padding-left: 2.2rem;
                                        }
                                       .detail-page .detail-toolbar {
                                           display: flex !important;
                                           flex-direction: column !important;
                                           align-items: flex-start !important;
                                           gap: 10px !important;
                                           margin-bottom: 14px !important;
                                           width: 100% !important;
                                       }
                                       .detail-page .detail-toolbar > div:first-child {
                                           display: flex !important;
                                           align-items: center !important;
                                           gap: 6px !important;
                                           margin-bottom: 0 !important;
                                           width: 100% !important;
                                       }
                                       .detail-page .detail-actions {
                                           width: auto !important;
                                           display: flex !important;
                                           align-items: center !important;
                                           margin-left: auto !important;
                                       }
                                       .detail-page .detail-actions form {
                                           display: flex !important;
                                           flex-direction: row !important;
                                           align-items: center !important;
                                           gap: 8px !important;
                                           width: auto !important;
                                       }
                                       .detail-page .detail-actions .btn {
                                           flex: none !important;
                                           width: auto !important;
                                           padding: 6px 18px !important;
                                           font-size: 13px !important;
                                           font-weight: 600 !important;
                                           white-space: nowrap !important;
                                       }
                                      .detail-page .page-title {
                                           font-size: 0.95rem;
                                           margin-bottom: 0;
                                           line-height: 1.2;
                                           font-weight: 700;
                                           white-space: nowrap;
                                           overflow: hidden;
                                           text-overflow: ellipsis;
                                           max-width: 220px;
                                       }
                                        .detail-page .card.card-stats,
                                        .detail-page .card.card-table {
                                            border-radius: 14px;
                                            margin-bottom: 14px;
                                        }
                                        .detail-page .card.card-stats {
                                            padding: 14px !important;
                                        }
                                        .detail-page .card.card-stats .row.g-3,
                                        .detail-page .card.card-stats .row.g-4 {
                                            display: grid;
                                            grid-template-columns: repeat(2, minmax(0, 1fr));
                                            gap: 14px 14px !important;
                                        }
                                        .detail-page .card.card-stats .col-6,
                                        .detail-page .card.card-stats .col-12,
                                        .detail-page .card.card-stats .col-md-3,
                                        .detail-page .card.card-stats .col-md-6,
                                        .detail-page .card.card-stats .col-md-9 {
                                            width: auto;
                                            max-width: none;
                                        }
                                        .detail-page .card.card-stats h6 {
                                            font-size: 0.92rem;
                                            margin-bottom: 0.3rem;
                                        }
                                        .detail-page .card.card-stats p,
                                        .detail-page .card.card-stats input,
                                        .detail-page .card.card-stats select,
                                        .detail-page .card.card-stats textarea {
                                            width: 100%;
                                            font-size: 0.92rem;
                                        }
                                        .detail-page .card.card-stats textarea {
                                            min-height: 92px;
                                        }
                                        .detail-page .detail-items-table {
                                            min-width: 720px;
                                        }
                                        .detail-page .detail-items-table thead th,
                                        .detail-page .detail-items-table tbody td {
                                            padding: 10px 12px;
                                            font-size: 0.86rem;
                                        }
                                        .page-title {
                                            font-size: 1.7rem;
                                            margin-bottom: 0;
                                        }
                                        .card-stats .stats-number {
                                            font-size: 2.2rem;
                                        }
                                        .card-table {
                                            margin-bottom: 18px;
                                        }
                                        .card-table .card-header {
                                            padding: 14px 14px;
                                        }
                                        .table-responsive {
                                            overflow-x: auto !important;
                                            -webkit-overflow-scrolling: touch;
                                        }
                                        .dashboard-list-table thead th,
                                        .dashboard-list-table tbody td {
                                            white-space: normal !important;
                                            font-size: 0.9rem;
                                            padding: 10px 10px;
                                        }
                                        .dashboard-list-table tbody td,
                                        .dashboard-list-table thead th {
                                            white-space: nowrap !important;
                                        }
                                        .dashboard-list-table tbody td:nth-child(5),
                                        .dashboard-list-table thead th:nth-child(5) {
                                            text-align: left;
                                            min-width: 110px;
                                        }
                                        .dashboard-list-table {
                                            min-width: 980px;
                                        }
                                        .table-responsive {
                                            overflow-x: auto !important;
                                            overflow-y: auto !important;
                                            -webkit-overflow-scrolling: touch;
                                        }
                                        .detail-page .table-responsive,
                                        .card-table .table-responsive {
                                            overflow-x: auto !important;
                                            -webkit-overflow-scrolling: touch;
                                        }
                                        .choices,
                                        .choices.is-open {
                                            z-index: 13000;
                                        }
                                        .choices__list--dropdown,
                                        .choices__list[aria-expanded] {
                                            z-index: 13001 !important;
                                        }
                                        .choices__list--dropdown .choices__input,
                                        .choices__list[aria-expanded] .choices__input {
                                            position: sticky;
                                            top: 0;
                                            background: #fff;
                                            z-index: 2;
                                        }
                                        .table-responsive::-webkit-scrollbar {
                                            height: 8px;
                                        }
                                        .table-responsive::-webkit-scrollbar-thumb {
                                            background: rgba(53, 133, 139, 0.45);
                                            border-radius: 999px;
                                        }
                                        .pagination {
                                            margin-bottom: 0;
                                        }
                                        .pagination .page-link {
                                            padding: 0.35rem 0.55rem;
                                            font-size: 0.86rem;
                                        }
                                        .table thead th,
                                        .table tbody td {
                                            padding: 10px 12px;
                                            font-size: 0.82rem;
                                            white-space: nowrap;
                                        }
                                    }
                                       
                                    .table thead th {
                                        background-color: #f8f9fa;
                                        color: #6c757d;
                                        font-weight: 600;
                                        font-size: 0.85rem;
                                        text-transform: uppercase;
                                        border-bottom: none;
                                        padding: 12px 25px;
                                        white-space: nowrap;
                                    }
                                    .table tbody td {
                                        padding: 15px 25px;
                                        vertical-align: middle;
                                        font-size: 0.95rem;
                                        border-color: #edf2f9;
                                        white-space: nowrap;
                                    }
                           
                                    .badge-status { font-weight: 500; font-size: 0.8rem; padding: 6px 12px; border-radius: 30px; }
                                    .badge-processing { background-color: rgba(242,157,56,0.15); color: var(--brand-orange); }
                                    .badge-completed { background-color: rgba(53,133,139,0.15); color: var(--brand-teal); }
                           
                                    .action-icon {
                                        color: var(--brand-teal); font-size: 1.1rem;
                                        margin: 0 5px; cursor: pointer; transition: color 0.2s;
                                    }
                                    .action-icon:hover { color: var(--brand-teal-dark); }
                           
                                    .menu-toggle-btn { cursor: pointer; font-size: 1.5rem; display: none; }

                                        .sidebar-close-btn {
                                        display: inline-flex;
                                        align-items: center;
                                        justify-content: center;
                                        width: 40px;
                                        height: 40px;
                                        border-radius: 50%;
                                        border: 1px solid rgba(255,255,255,0.35);
                                        background: transparent;
                                        color: #fff;
                                        font-size: 1.15rem;
                                        line-height: 1;
                                        padding: 0;
                                    }
                           
                                    .modal-header { border-bottom: none; }
                                    .modal-title { font-weight: 600; letter-spacing: 0.5px; }
                           
                                    .choices__inner {
                                        background-color: #fff;
                                        border: 1px solid #dee2e6;
                                        border-radius: 0.375rem;
                                        min-height: 31px;
                                        padding: 2px 10px;
                                    }
                                    .choices__input { background-color: transparent; margin-bottom: 0; }

                                    .choices__list--dropdown {
                                        z-index: 9999 !important;
                                        overflow: visible;
                                        display: flex !important;
                                        flex-direction: column !important;
                                    }
                                    .choices__list--dropdown .choices__input {
                                        order: 0;
                                        position: sticky;
                                        top: 0;
                                        margin-top: 0;
                                        background: #fff;
                                        z-index: 2;
                                    }
                                    .choices__list--dropdown .choices__list {
                                        order: 1;
                                        max-height: 280px;
                                        overflow-y: auto;
                                        overflow-x: hidden !important;
                                    }
                                   
                                    .choices__inner {
                                        min-height: 38px;
                                        padding: 6px 10px;
                                    }
                                   
                                    .choices__input {
                                        font-size: 14px;
                                    }
                                   
                                    .choices__item--choice {
                                        padding: 8px 10px;
                                        white-space: normal !important;
                                        word-break: break-word;
                                    }
                                   
                                    .choices {
                                        position: relative;
                                    }
                           
                                    #profileSection .pagination,
                                    #profileSection nav.pagination { display: none !important; }
                           
                                    @media (max-width: 991.98px) {
                                        .menu-toggle-btn { display: block; }
                                        .sidebar { transform: translateX(-100%); }
                                        .sidebar.show { transform: translateX(0); box-shadow: 4px 0 15px rgba(0,0,0,0.1); }
                                        .main-content { margin-left: 0; }
                                        .sidebar.show~.main-content { margin-left: var(--sidebar-width); }
                                    }
                                    @media (max-width: 767.98px) {
                                        .sidebar.show~.main-content { margin-left: 0; }
                                        .sidebar.show { box-shadow: 10px 0 25px rgba(0,0,0,0.2); }
                                    }
                                    .brand-link{
                                        display: flex;
                                        align-items: center;
                                        height: 100%;
                                    }
                                </style>
                            </head>
                           
                            <body>
                           
                                <nav class="navbar navbar-expand navbar-dark navbar-top fixed-top px-3">
                                    <div class="brand-link">
                                        <h1 style="color: white; font-weight: bold; margin: 0;">TRACKNOW</h1>
                                    </div>
                                    <div class="search-container flex-grow-1 ms-2">
                                        <form class="search-form position-relative" method="post" action="">
                                            <i class="bi bi-search search-icon"></i>
                                            <input class="form-control" name="search" value="${context.request.parameters.search || ""}" type="text" placeholder="Search">
                                            <input type="hidden" name="vendorEmail" value="${context.request.parameters.vendorEmail || ""}"/>
                                            <input type="hidden" name="authenticated" value="${context.request.parameters.authenticated || ""}"/>
                                            <input type="hidden" name="employeeInternalId" value="${context.request.parameters.employeeInternalId || ""}"/>
                                            <input type="hidden" name="verify_otp" value="verify_otp"/>
                                            <input type="hidden" name="dashboard" value="${activeDashboard || "SMTRList"}"/>
                                            <input type="hidden" name="prAccess" value="${prAccess}"/>
                                            <input type="hidden" name="smtrAccess" value="${smtrAccess}"/>
                                            <input type="hidden" name="smtrUserRole" value="${smtrUserRoleParam || smtrUserRole || ""}"/>
                                            <input type="hidden" name="PRListFilter" value="${context.request.parameters.PRListFilter || ""}"/>
                                            <input type="hidden" name="smtrStatusFilter" value="${context.request.parameters.smtrStatusFilter || ""}"/>
                                            <input type="hidden" name="pageNumber" value="1"/>
                                        </form>
                                    </div>
                                    <div class="navbar-nav ms-auto align-items-center">
                                        <h2 class="text-light fw-bold mt-2 d-none d-sm-block">TRACKnow</h2>
                                    </div>
                                </nav>
                           
                                <aside class="sidebar">
                                    <div class="d-lg-none text-end mb-0 p-0">
                                        <button type="button" class="sidebar-close-btn" id="sidebar-close" aria-label="Close menu">
                                            <i class="bi bi-x-lg"></i>
                                        </button>
                                    </div>
                                    <ul class="nav nav-pills flex-column mb-auto">
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
                                    <hr class="text-white-50 my-3">
                                    <form id="logoutForm" method="post" action="">
                                        <ul class="nav nav-pills flex-column">
                                            <li class="active">
                                                <a href="#" id="logoutBtn" class="nav-link">
                                                    <i class="bi bi-box-arrow-right"></i> Logout
                                                </a>
                                                <input type="hidden" name="vendorEmail" value="${context.request.parameters.vendorEmail}"/>
                                                <input type="hidden" name="authenticated" value="${context.request.parameters.authenticated}"/>
                                                <input type="hidden" name="employeeInternalId" value="${context.request.parameters.employeeInternalId}"/>
                                                <input type="hidden" name="logout" value="true"/>
                                            </li>
                                        </ul>
                                    </form>
                                </aside>
                           
                                <main class="main-content p-3">
                                    <div id="dashboardSection">`;

                        if (activeDashboard === "PRRequestorList" || activeDashboard === "SMTRList") {
                            dashboardPage += `<div class="container-fluid p-0">
                                            <div class="d-flex align-items-center gap-3 mb-4">
                                                <i class="bi bi-list menu-toggle-btn"></i>
                                                <h1 class="page-title m-0">TRACKnow Supervisor</h1>
                                            </div>
                                            <div class="row g-4 mb-4">`;

                            var prActiveClass = activeDashboard === "PRRequestorList" ? "active" : "";
                            var smtrActiveClass = activeDashboard === "SMTRList" ? "active" : "";
                            var prActiveText = activeDashboard === "PRRequestorList" ? "text-light" : "text-teal";
                            var smtrActiveText = activeDashboard === "SMTRList" ? "text-light" : "text-teal";

                            var smtrUserRoleParam =
                                context.request.parameters.smtrUserRole &&
                                    context.request.parameters.smtrUserRole !== "undefined"
                                    ? context.request.parameters.smtrUserRole
                                    : smtrUserRole || "";

                            if (prAccess && !smtrAccess) {
                                dashboardPage += `<div class="col-md-6">
                                <form class="card card-stats h-100 p-3 nav-card ${prActiveClass} callingmethod" role="button" method="post" action="">
                                    <div class="d-flex justify-content-between align-items-center">
                                        <div class="${prActiveText}">
                                            <h6 class="card-title mb-2">Purchase Requests</h6>
                                            <div class="stats-number">127</div>
                                        </div>
                                    </div>
                                    <input type="hidden" name="dashboard" value="PRRequestorList"/>
                                    <input type="hidden" name="prAccess" value="${prAccess}"/>
                                    <input type="hidden" name="smtrAccess" value="${smtrAccess}"/>
                                    <input type="hidden" name="vendorEmail" value="${context.request.parameters.vendorEmail}"/>
                                    <input type="hidden" name="smtrUserRole" value="${smtrUserRoleParam}"/>
                                    <input type="hidden" name="verified" value="true"/>
                                    <input type="hidden" name="employeeInternalId" value="${context.request.parameters.employeeInternalId}"/>
                                    <input type="hidden" name="authenticated" value="${context.request.parameters.authenticated}"/>
                                </form>
                            </div>`;
                            } else if (smtrAccess && !prAccess) {
                                dashboardPage += `<div class="col-md-6">
                                <form class="card card-stats h-100 p-3 nav-card ${smtrActiveClass} callingmethod" role="button" method="post" action="">
                                    <div class="d-flex justify-content-between align-items-center">
                                        <div class="${smtrActiveText}">
                                            <h6 class="card-title mb-2">SMTR List</h6>
                                            <div class="stats-number">310</div>
                                        </div>
                                    </div>
                                    <input type="hidden" name="dashboard" value="SMTRList"/>
                                    <input type="hidden" name="prAccess" value="${prAccess}"/>
                                    <input type="hidden" name="smtrAccess" value="${smtrAccess}"/>
                                    <input type="hidden" name="vendorEmail" value="${context.request.parameters.vendorEmail}"/>
                                    <input type="hidden" name="smtrUserRole" value="${smtrUserRoleParam}"/>
                                    <input type="hidden" name="verified" value="true"/>
                                    <input type="hidden" name="employeeInternalId" value="${context.request.parameters.employeeInternalId}"/>
                                    <input type="hidden" name="authenticated" value="${context.request.parameters.authenticated}"/>
                                </form>
                            </div>`;
                            } else {
                                dashboardPage += `<div class="col-md-6">
                                <form class="card card-stats h-100 p-3 nav-card ${prActiveClass} callingmethod" role="button" method="post" action="">
                                    <div class="d-flex justify-content-between align-items-center">
                                        <div class="${prActiveText}">
                                            <h6 class="card-title mb-2">Purchase Requests</h6>
                                            <div class="stats-number">127</div>
                                        </div>
                                    </div>
                                    <input type="hidden" name="dashboard" value="PRRequestorList"/>
                                    <input type="hidden" name="prAccess" value="${prAccess}"/>
                                    <input type="hidden" name="smtrAccess" value="${smtrAccess}"/>
                                    <input type="hidden" name="vendorEmail" value="${context.request.parameters.vendorEmail}"/>
                                    <input type="hidden" name="smtrUserRole" value="${smtrUserRoleParam}"/>
                                    <input type="hidden" name="verified" value="true"/>
                                    <input type="hidden" name="employeeInternalId" value="${context.request.parameters.employeeInternalId}"/>
                                    <input type="hidden" name="authenticated" value="${context.request.parameters.authenticated}"/>
                                </form>
                            </div>
                            <div class="col-md-6">
                                <form class="card card-stats h-100 p-3 nav-card ${smtrActiveClass} callingmethod" role="button" method="post" action="">
                                    <div class="d-flex justify-content-between align-items-center">
                                        <div class="${smtrActiveText}">
                                            <h6 class="card-title mb-2">SMTR List</h6>
                                            <div class="stats-number">310</div>
                                        </div>
                                    </div>
                                    <input type="hidden" name="dashboard" value="SMTRList"/>
                                    <input type="hidden" name="prAccess" value="${prAccess}"/>
                                    <input type="hidden" name="smtrAccess" value="${smtrAccess}"/>
                                    <input type="hidden" name="vendorEmail" value="${context.request.parameters.vendorEmail}"/>
                                    <input type="hidden" name="smtrUserRole" value="${smtrUserRoleParam}"/>
                                    <input type="hidden" name="verified" value="true"/>
                                    <input type="hidden" name="employeeInternalId" value="${context.request.parameters.employeeInternalId}"/>
                                    <input type="hidden" name="authenticated" value="${context.request.parameters.authenticated}"/>
                                </form>
                            </div>`;
                            }

                            dashboardPage += `</div>`;

                            var myTransactionDataObj;

                            if (activeDashboard === "PRRequestorList") {
                                if (context.request.parameters.approvalStatus) {
                                    var myRestletResponse = https.requestRestlet({
                                        body: JSON.stringify({
                                            userAction: "approvalStatus",
                                            approvalStatus: context.request.parameters.approvalStatus,
                                            vendorEmail: context.request.parameters.vendorEmail,
                                            vendorInternalId: context.request.parameters.vendorInternalId,
                                            transactionInternalId: context.request.parameters.transactionInternalId,
                                            approvedTransactionDetails: parseJSON(
                                                context.request.parameters.approvedTransactionDetails
                                            ),
                                            rejectReason: context.request.parameters.rejectReason || ""
                                        }),
                                        headers: { "Content-Type": "application/json" },
                                        method: "POST",
                                        scriptId: "customscript_tm_rs_pr_po_getdata",
                                        deploymentId: "customdeploy_tm_rs_pr_po_getdata"
                                    });
                                }

                                var options = {
                                    urlParams: {
                                        vendorInternalId: context.request.parameters.vendorInternalId,
                                        userAction: "pendingPurchaseRequests",
                                        pageNumber: pageNumber,
                                        vendorEmail: context.request.parameters.vendorEmail,
                                        urgencyLevelFilter: context.request.parameters.urgencyLevelFilter || "",
                                        prListFilter: context.request.parameters.PRListFilter || "",
                                        globalSearchValue: context.request.parameters.search || ""
                                    },
                                    method: "GET",
                                    scriptId: "customscript_tm_rs_pr_po_getdata",
                                    deploymentId: "customdeploy_tm_rs_pr_po_getdata"
                                };
                                var response = https.requestRestlet(options);
                                var body = response.body || "{}";
                                myTransactionDataObj = JSON.parse(body);

                                var transactionDataObj =
                                    (myTransactionDataObj && myTransactionDataObj.transactionDataObj) || {};
                                if (
                                    pageNumber > 1 &&
                                    (!transactionDataObj ||
                                        !transactionDataObj.transactionDataArray ||
                                        transactionDataObj.transactionDataArray.length === 0)
                                ) {
                                    pageNumber = pageNumber - 1;
                                    listOptions.urlParams.pageNumber = pageNumber;
                                    var response = https.requestRestlet(listOptions);
                                    myTransactionDataObj = JSON.parse(response.body || "{}");
                                    transactionDataObj = myTransactionDataObj.transactionDataObj || {};
                                }
                            } else if (activeDashboard === "SMTRList") {
                                if (context.request.parameters.approvalStatus === "Approved") {
                                    https.requestRestlet({
                                        body: JSON.stringify({
                                            userAction: "approveSMTRForm",
                                            vendorEmail: context.request.parameters.vendorEmail,
                                            vendorInternalId: context.request.parameters.vendorInternalId,
                                            smtrInternalId: context.request.parameters.smtrInternalId,
                                            approvedTransactionDetails:
                                                context.request.parameters.approvedTransactionDetails
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
                                            approvedTransactionDetails:
                                                context.request.parameters.approvedTransactionDetails,
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
                                myTransactionDataObj = JSON.parse(response.body || "{}");

                                if (
                                    pageNumber > 1 &&
                                    (!myTransactionDataObj.smtrRecordsData ||
                                        myTransactionDataObj.smtrRecordsData.length === 0)
                                ) {
                                    pageNumber = pageNumber - 1;
                                    smtrListOptions.urlParams.pageNumber = pageNumber;
                                    myTransactionDataObj = JSON.parse(
                                        https.requestRestlet(smtrListOptions).body || "{}"
                                    );
                                }
                            }

                            dashboardPage += `<div class="card card-table mb-4">
                                            <div class="card-header bg-white py-3">
                                                <div class="d-flex justify-content-between align-items-center flex-wrap gap-2">
                                                    <div>
                                                        <h5 class="m-0 font-weight-bold">Recent Sample Batches</h5>
                                                    </div>
                                                    <div class="d-flex align-items-center gap-2">`;

                            if (activeDashboard === "PRRequestorList") {
                                var currentFilter = context.request.parameters.PRListFilter || "";
                                var urgencyLevelFilter = context.request.parameters.urgencyLevelFilter || "";
                                dashboardPage += `<form class="selectingfilter" method="post">
                                                <div class="d-flex gap-3 flex-wrap">
                                                    <select class="form-select form-select-sm" name="PRListFilter" style="width: auto;">
                                                        <option value="" ${currentFilter === "" ? "selected" : ""}>All Status</option>
                                                        <option value="2" ${currentFilter === "2" ? "selected" : ""}>Pending for Approval</option>
                                                        <option value="4" ${currentFilter === "4" ? "selected" : ""}>Approved</option>
                                                    </select>
                                                    <input type="hidden" name="prAccess" value="${prAccess}"/>
                                                    <input type="hidden" name="smtrAccess" value="${smtrAccess}"/>
                                                    <input type="hidden" name="vendorEmail" value="${context.request.parameters.vendorEmail}"/>
                                                    <input type="hidden" name="dashboard" value="PRRequestorList"/>
                                                    <input type="hidden" name="verified" value="true"/>
                                                    <input type="hidden" name="employeeInternalId" value="${context.request.parameters.employeeInternalId}"/>
                                                    <input type="hidden" name="authenticated" value="${context.request.parameters.authenticated}"/>
                                                </div>
                                            </form>`;
                            } else if (activeDashboard === "SMTRList") {
                                var currentFilter = context.request.parameters.smtrStatusFilter || "";
                                var urgencyLevelFilter = context.request.parameters.urgencyLevelFilter || "";
                                dashboardPage += `<form class="selectingfilter" method="post">
                                                <div class="d-flex gap-3 flex-wrap">
                                                    <select class="form-select form-select-sm" name="urgencyLevelFilter" style="width: auto;">
                                                        <option value="" ${urgencyLevelFilter === "" ? "selected" : ""}>Urgency Level</option>
                                                        <option value="1" ${urgencyLevelFilter === "1" ? "selected" : ""}>Low</option>
                                                        <option value="2" ${urgencyLevelFilter === "2" ? "selected" : ""}>Medium</option>
                                                        <option value="3" ${urgencyLevelFilter === "3" ? "selected" : ""}>High</option>
                                                    </select>
                                                    <select class="form-select form-select-sm" name="smtrStatusFilter" style="width: auto;">
                                                        <option value="" ${currentFilter === "" ? "selected" : ""}>All Status</option>
                                                        <option value="1" ${currentFilter === "1" ? "selected" : ""}>Pending for Approval</option>
                                                        <option value="2" ${currentFilter === "2" ? "selected" : ""}>Approved</option>
                                                        <option value="3" ${currentFilter === "3" ? "selected" : ""}>Rejected</option>
                                                        <option value="5" ${currentFilter === "5" ? "selected" : ""}>Fulfilled</option>
                                                    </select>
                                                    <input type="hidden" name="prAccess" value="${prAccess}"/>
                                                    <input type="hidden" name="smtrAccess" value="${smtrAccess}"/>
                                                    <input type="hidden" name="vendorEmail" value="${context.request.parameters.vendorEmail}"/>
                                                    <input type="hidden" name="dashboard" value="SMTRList"/>
                                                    <input type="hidden" name="verified" value="true"/>
                                                    <input type="hidden" name="employeeInternalId" value="${context.request.parameters.employeeInternalId}"/>
                                                    <input type="hidden" name="authenticated" value="${context.request.parameters.authenticated}"/>                                                </div>
                                            </form>`;
                            }

                            dashboardPage += `</div>
                                        </div>
                                    </div>
                                    <div class="table-responsive">
                                    <table class="table table-hover mb-0 align-middle dashboard-list-table">
                                        <thead>`;

                            if (activeDashboard === "SMTRList") {
                                dashboardPage += `<tr>
                                                    <th>Document Number</th>
                                                    <th>Purpose</th>
                                                    <th>Location</th>
                                                    <th>Req. Date</th>
                                                    <th>Need By Date</th>
                                                    <th>Urgency Level</th>
                                                    <th>Status</th>
                                                    <th>Info</th>
                                                </tr>`;
                            } else {
                                dashboardPage += `<tr>
                                                    <th>Date</th>
                                                    <th>Document Number</th>
                                                    <th>Location</th>
                                                    <th>Total Amount</th>
                                                    <th>Next Approver</th>
                                                    <th>Status</th>
                                                    <th>Info</th>
                                                </tr>`;
                            }

                            dashboardPage += `</thead><tbody>`;

                            if (activeDashboard === "SMTRList") {
                                var transactionDataArray =
                                    myTransactionDataObj && myTransactionDataObj.smtrRecordsData
                                        ? myTransactionDataObj.smtrRecordsData
                                        : [];
                                for (var index = 0; index < transactionDataArray.length; index++) {
                                    dashboardPage += `<tr>
                                                        <td>${transactionDataArray[index].documentNumber}</td>
                                                        <td>${transactionDataArray[index].purchasePurpose}</td>
                                                        <td>${transactionDataArray[index].smtrTerritory}</td>
                                                        <td>${transactionDataArray[index].RequestedArrivalDate}</td>
                                                        <td>${transactionDataArray[index].DateNeededtoArrive}</td>
                                                        <td>${transactionDataArray[index].urgencyLevel}</td>
                                                        <td>${transactionDataArray[index].status}</td>
                                                        <td>
                                                            <form class="callingmethod" method="post" action="">
                                                                <i class="bi bi-arrow-right-circle-fill action-icon fs-4"></i>
                                                                <input type="hidden" name="prAccess" value="${prAccess}"/>
                                                                <input type="hidden" name="smtrAccess" value="${smtrAccess}"/>
                                                                <input type="hidden" name="vendorEmail" value="${context.request.parameters.vendorEmail}"/>
                                                                <input type="hidden" name="smtrInternalId" value="${transactionDataArray[index].internalId}"/>
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
                            } else {
                                var transactionDataArray =
                                    transactionDataObj && transactionDataObj.transactionDataArray
                                        ? transactionDataObj.transactionDataArray
                                        : [];
                                for (var index = 0; index < transactionDataArray.length; index++) {
                                    dashboardPage += `<tr>
                                                    <td>${transactionDataArray[index].transactionDate}</td>
                                                    <td>${transactionDataArray[index].transactionDocnum}</td>
                                                    <td>${transactionDataArray[index].transactionLocation}</td>
                                                    <td>${transactionDataArray[index].transactionTotalAmount}</td>
                                                    <td>${transactionDataArray[index].transactionNextApprover}</td>
                                                    <td>${transactionDataArray[index].transactionStatus}</td>
                                                    <td>
                                                        <form class="callingmethod" method="post" action="" style="display:inline;">
                                                            <i class="bi bi-arrow-right-circle-fill action-icon fs-4"></i>
                                                            <input type="hidden" name="prAccess" value="${prAccess}"/>
                                                            <input type="hidden" name="smtrAccess" value="${smtrAccess}"/>
                                                            <input type="hidden" name="vendorEmail" value="${context.request.parameters.vendorEmail}"/>
                                                            <input type="hidden" name="transactionInternalId" value="${transactionDataArray[index].transactionInternalId}"/>
                                                            <input type="hidden" name="recordType" value="PRRecord"/>
                                                            <input type="hidden" name="smtrUserRole" value="${smtrUserRoleParam}"/>
                                                            <input type="hidden" name="verified" value="true"/>
                                                            <input type="hidden" name="employeeInternalId" value="${context.request.parameters.employeeInternalId}"/>
                                                            <input type="hidden" name="authenticated" value="${context.request.parameters.authenticated}"/>
                                                        </form>
                                                    </td>
                                                </tr>`;
                                }
                            }

                            dashboardPage += `</tbody>
                                    </table>
                                    </div>
                                </div>
                            </div>`;

                            if (myTransactionDataObj && myTransactionDataObj.totalNumberOfPages > 1) {
                                var currentPageValue = parseInt(context.request.parameters.pageNumber, 10) || 1;
                                var totalPages = parseInt(myTransactionDataObj.totalNumberOfPages, 10) || 1;
                                dashboardPage += `<nav aria-label="Page navigation" class="d-flex justify-content-center p-3">
                                    <form method="post" id="paginationForm">
                                    <ul class="pagination justify-content-center">
                                        <li class="page-item ${currentPageValue <= 1 ? "disabled" : ""}" role="button" id="previousPage">
                                            <a class="page-link" style="color: var(--brand-teal); ${currentPageValue <= 1 ? "pointer-events: none; opacity: 0.6;" : ""}">Previous</a>
                                        </li>
                                        <li class="page-item" role="button" id="page1"><a class="page-link text-white" style="background-color: var(--brand-orange);">${currentPageValue}</a></li>
                                        <li class="page-item ${currentPageValue + 1 > totalPages ? "disabled" : ""}" role="button" id="page2"><a class="page-link text-secondary" style="${currentPageValue + 1 > totalPages ? "pointer-events: none; opacity: 0.6;" : ""}">${currentPageValue + 1}</a></li>
                                        <li class="page-item ${currentPageValue + 2 > totalPages ? "disabled" : ""}" role="button" id="page3"><a class="page-link text-secondary" style="${currentPageValue + 2 > totalPages ? "pointer-events: none; opacity: 0.6;" : ""}">${currentPageValue + 2}</a></li>
                                        <li class="page-item ${currentPageValue + 3 > totalPages ? "disabled" : ""}" role="button" id="nextPage">
                                            <a class="page-link" style="color: var(--brand-teal); ${currentPageValue + 3 > totalPages ? "pointer-events: none; opacity: 0.6;" : ""}">Next</a>
                                        </li>
                                        <input type="hidden" name="prAccess" value="${prAccess}"/>
                                        <input type="hidden" name="smtrAccess" value="${smtrAccess}"/>
                                        <input type="hidden" name="vendorEmail" value="${context.request.parameters.vendorEmail}"/>
                                        <input type="hidden" name="dashboard" value="${activeDashboard}"/>
                                        <input type="hidden" name="smtrUserRole" value="${smtrUserRoleParam}"/>
                                        <input type="hidden" name="pageNumber" id="pageNumber" value="${currentPageValue}"/>
                                        <input type="hidden" name="smtrStatusFilter" value="${context.request.parameters.smtrStatusFilter || ""}"/>
                                        <input type="hidden" name="urgencyLevelFilter" value="${context.request.parameters.urgencyLevelFilter || ""}"/>
                                        <input type="hidden" name="PRListFilter" value="${context.request.parameters.PRListFilter || ""}"/>
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
                                    </script>`;
                            }
                        } else if (
                            context.request.parameters.recordType === "PRRecord" ||
                            context.request.parameters.recordType === "SMTRRecord"
                        ) {
                            var backDashboard =
                                context.request.parameters.recordType === "PRRecord" ? "PRRequestorList" : "SMTRList";
                            var title =
                                context.request.parameters.recordType === "PRRecord"
                                    ? "Purchase Requestor Details"
                                    : "SMTR Details";
                            const path = context.request.parameters.recordType === "PRRecord" ? "PRList" : "SMTRList";

                            var smtrUserRoleParam =
                                context.request.parameters.smtrUserRole &&
                                    context.request.parameters.smtrUserRole !== "undefined"
                                    ? context.request.parameters.smtrUserRole
                                    : smtrUserRole || "";

                            var transactionData;
                            var transactionDataObj;
                            if (context.request.parameters.recordType === "PRRecord") {
                                var options = {
                                    urlParams: {
                                        vendorInternalId: context.request.parameters.vendorInternalId,
                                        userAction: "getTransactionlineData",
                                        transactionInternalId: context.request.parameters.transactionInternalId,
                                        pageNumber: 1,
                                        recordType: "purchaseorder",
                                        vendorEmail: context.request.parameters.vendorEmail,
                                        prListFilter: context.request.parameters.PRListFilter || "",
                                        globalSearchValue: context.request.parameters.search || ""
                                    },
                                    method: "GET",
                                    scriptId: "customscript_tm_rs_pr_po_getdata",
                                    deploymentId: "customdeploy_tm_rs_pr_po_getdata"
                                };
                                var response = https.requestRestlet(options);
                                var body = response.body || "{}";
                                transactionDataObj = JSON.parse(body);
                                transactionData = transactionDataObj.transactionData;
                            } else if (context.request.parameters.recordType === "SMTRRecord") {
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
                                transactionDataObj = JSON.parse(https.requestRestlet(options).body);
                                transactionData = transactionDataObj.smtrTransactionData;
                            }

                            dashboardPage += `<div class="container-fluid p-0 detail-page">
                                            <div class="d-flex justify-content-between detail-toolbar">
                                                <div class="d-flex align-items-center gap-3 mb-4">
                                                    <i class="bi bi-list menu-toggle-btn"></i>
                                                    <form class="callingmethod m-0" method="post" style="line-height: 0; display:inline;" action="">
                                                        <i class="bi bi-arrow-left-circle-fill text-orange fs-4" role="button"></i>
                                                        <input type="hidden" name="prAccess" value="${prAccess}"/>
                                                        <input type="hidden" name="smtrAccess" value="${smtrAccess}"/>
                                                        <input type="hidden" name="vendorEmail" value="${context.request.parameters.vendorEmail}"/>
                                                        <input type="hidden" name="dashboard" value="${backDashboard}"/>
                                                        <input type="hidden" name="smtrUserRole" value="${smtrUserRoleParam}"/>
                                                        <input type="hidden" name="verified" value="true"/>
                                                        <input type="hidden" name="employeeInternalId" value="${context.request.parameters.employeeInternalId}"/>
                                                        <input type="hidden" name="authenticated" value="${context.request.parameters.authenticated}"/>
                                                    </form>
                                                    <h1 class="page-title m-0">${title}</h1>
                                                </div>
                                                <div class="detail-actions">
                                                    <form method="post" style="display:flex; flex-direction:row; gap:5px; flex-wrap:nowrap; align-items:center;">
                                                        <input type="hidden" name="approvedTransactionDetails" />
                                                        <input type="hidden" name="prAccess" value="${prAccess}"/>
                                                        <input type="hidden" name="smtrAccess" value="${smtrAccess}"/>
                                                        <input type="hidden" name="vendorEmail" value="${context.request.parameters.vendorEmail}"/>
                                                        <input type="hidden" name="smtrUserRole" value="${smtrUserRoleParam}"/>
                                                        <input type="hidden" name="verified" value="true"/>
                                                        <input type="hidden" name="employeeInternalId" value="${context.request.parameters.employeeInternalId}"/>
                                                        <input type="hidden" name="vendorInternalId" value="${context.request.parameters.vendorInternalId || context.request.parameters.employeeInternalId || ""}"/>
                                                        <input type="hidden" name="authenticated" value="${context.request.parameters.authenticated}"/>
                                                        `;

                            if (context.request.parameters.recordType === "PRRecord") {
                                dashboardPage += `<input type="hidden" name="dashboard" value="PRRequestorList"/> <input type="hidden" name="transactionInternalId" value="${transactionData.transactionInternalId}"/>`;
                            } else {
                                dashboardPage += `<input type="hidden" name="dashboard" value="SMTRList"/> <input type="hidden" name="smtrInternalId" value="${transactionData.internalid}"/>`;
                            }

                            if (context.request.parameters.recordType === "PRRecord") {
                                if (
                                    transactionData.transactionStatus === "Pending Approval" ||
                                    transactionData.status === "Pending Approval"
                                ) {
                                    dashboardPage += `<button type="button" class="btn" style="background-color: var(--brand-teal); color: #ffff;" id="approveButton" name="approvalStatus" value="Approved">Approve</button>
                                                  <button type="submit" class="btn" style="background-color: var(--brand-orange); color: #ffff;" name="approvalStatus" value="Rejected">Reject</button>`;
                                } else {
                                    const fullStr = transactionData.transactionPurchaseOrder || "";
                                    const docNum = fullStr.substring(fullStr.indexOf("#"));
                                    var docNum1 = docNum;
                                }
                            } else {
                                log.debug("smtrUserRole for record view", smtrUserRoleParam);
                                if (
                                    smtrUserRoleParam === "SMTR Supervisor" ||
                                    smtrUserRoleParam === "" ||
                                    !smtrUserRoleParam
                                ) {
                                    log.debug("transactionData.status", transactionData.status);
                                    if (transactionData.status === "Pending Approval") {
                                        dashboardPage += `<button type="button" class="btn" style="background-color: var(--brand-teal); color: #ffff;" id="approveButton" name="approvalStatus" value="Approved">Approve</button>
                                                      <button type="submit" class="btn" style="background-color: var(--brand-orange); color: #ffff;" name="approvalStatus" value="Rejected">Reject</button>`;
                                    }
                                }
                                if (smtrUserRoleParam === "Shipping Clerk") {
                                    if (transactionData.status === "Approved") {
                                        dashboardPage += `<button type="button" class="btn" style="background-color: var(--brand-orange); color: #ffff;" onclick="editSTMR()" id="editButton">Edit</button>
                                                    <button type="button" class="btn d-none" style="background-color: var(--brand-orange); color: #ffff;" onclick="saveSTMR()" id="saveButton">Save</button>
                                                    <button type="button" class="btn" style="background-color: var(--brand-teal); color: #ffff;" id="fulfillButton" name="approvalStatus" value="Fulfilled">Mark as Fulfilled</button>
                                                    <input type="hidden" name="smtrDetails" id="smtrDetails" value=""/>`;
                                    } else {
                                        if (transactionData.invadjReference) {
                                            const fullStr = transactionData.invadjReference || "";
                                            const docNum = fullStr.substring(fullStr.indexOf("#"));
                                            dashboardPage += `<h6 class="text-teal mt-3 me-3">Inventory Adjustment: <span class="text-orange fs-6 fw-semibold">${docNum || "-"}</span></h6>`;
                                        }
                                    }
                                }

                                dashboardPage += `<script>
                                function editSTMR() {
                                    document.getElementById("editButton").classList.add("d-none");
                                    document.getElementById("saveButton").classList.remove("d-none");
                                    document.getElementById("customerName").readOnly = false;
                                    document.getElementById("location").readOnly = false;
                                    document.getElementById("department").readOnly = false;
                                    document.getElementById("purchasePurpose").readOnly = false;
                                    document.getElementById("shipTo").readOnly = false;
                                    document.getElementById("memo").readOnly = false;
                                    document.getElementById("trackingNumber").readOnly = false;
                                }
                                function saveSTMR() {
                                    document.getElementById("editButton").classList.remove("d-none");
                                    document.getElementById("saveButton").classList.add("d-none");
                                    document.getElementById("customerName").readOnly = true;
                                    document.getElementById("location").readOnly = true;
                                    document.getElementById("department").readOnly = true;
                                    document.getElementById("purchasePurpose").readOnly = true;
                                    document.getElementById("shipTo").readOnly = true;
                                    document.getElementById("memo").readOnly = true;
                                    document.getElementById("trackingNumber").readOnly = true;
                                }
                                document.getElementById("fulfillButton").addEventListener("click", function() {
                                    var smtrDetails = {
                                        purchasePurpose: document.getElementById("purchasePurpose").value,
                                        shipTo: document.getElementById("shipTo").value,
                                        memo: document.getElementById("memo").value,
                                        trackingNumber: document.getElementById("trackingNumber").value
                                    };
                                    document.getElementById("smtrDetails").value = JSON.stringify(smtrDetails);
                                });
                            </script>`;
                            }

                            dashboardPage += `</form>
                                                </div>
                                            </div>
                                            <div class="row g-4 mb-4">
                                                <div class="col-12">`;

                            if (context.request.parameters.recordType === "PRRecord") {
                                dashboardPage += `<div class="card card-stats h-100 p-4">
                                                    <div class="row g-4">
                                                        <div class="col-md-3"><h6 class="text-teal mb-2">Document Number</h6><p class="text-orange fs-6 fw-semibold m-0">${transactionData.transactionDocumentnumber || "-"}</p></div>
                                                        <div class="col-md-3"><h6 class="text-teal mb-2">Date</h6><p class="text-orange fs-6 fw-semibold m-0">${transactionData.transactionDate || "-"}</p></div>
                                                        <div class="col-md-3"><h6 class="text-teal mb-2">Subsidiary</h6><p class="text-orange fs-6 fw-semibold m-0">${transactionData.transactionSubsidiary || "-"}</p></div>
                                                        <div class="col-md-3"><h6 class="text-teal mb-2">Department</h6><p class="text-orange fs-6 fw-semibold m-0">${transactionData.transactionDepartment || "-"}</p></div>
                                                        <div class="col-md-3"><h6 class="text-teal mb-2">Vendor</h6><p class="text-orange fs-6 fw-semibold m-0">${transactionData.transactionVendor || "-"}</p></div>
                                                        <div class="col-md-3"><h6 class="text-teal mb-2">Location</h6><p class="text-orange fs-6 fw-semibold m-0">${transactionData.transactionLocation || "-"}</p></div>
                                                        <div class="col-md-3"><h6 class="text-teal mb-2">Total Amount</h6><p class="text-orange fs-6 fw-semibold m-0">${transactionData.transactionTotalAmount || "-"}</p></div>
                                                        <div class="col-md-3"><h6 class="text-teal mb-2">Status</h6><p class="text-orange fs-6 fw-semibold m-0">${transactionData.transactionStatus || "-"}</p></div>
                                                        <div class="col-md-3"><h6 class="text-teal mb-2">Urgency Level</h6><p class="text-orange fs-6 fw-semibold m-0">${transactionData.urgencyLevel || "-"}</p></div>
                                                        <div class="col-md-3"><h6 class="text-teal mb-2">Purchase Order</h6><p class="text-orange fs-6 fw-semibold m-0">${docNum1 || "-"}</p></div>
                                                        <div class="col-md-3"><h6 class="text-teal mb-2">Currency</h6><p class="text-orange fs-6 fw-semibold m-0">${transactionData.transactionCurrency || "-"}</p></div>
                                                        <div class="col-md-3"><h6 class="text-teal mb-2">Data Receive By</h6><p class="text-orange fs-6 fw-semibold m-0">${transactionData.transactionRecieveBy || "-"}</p></div>
                                                        <div class="col-md-6"><h6 class="text-teal mb-2">Notes</h6><p class="text-orange fs-6 fw-semibold m-0">${transactionData.transactionMemo || "-"}</p></div>
                                                    </div>
                                                </div>`;
                            } else {
                                dashboardPage += `<div class="card card-stats h-100 p-3">
                                                <div class="row g-3 align-items-start">
                                                    <div class="col-6 col-md-3 text-teal"><h6 class="card-title mb-2">Document Number</h6><p class="text-orange fw-semibold fs-6 m-0">${transactionData.name || "-"}</p></div>
                                                    <div class="col-6 col-md-3 text-teal"><h6 class="card-title mb-2">Customer</h6>
                                                        <select id="customerName" name="customerName" class="form-control form-control-sm" readonly>
                                                            <option value="${transactionData.customerName || ""}">${transactionData.customerName || "-"}</option>
                                                        </select>
                                                    </div>
                                                    <div class="col-6 col-md-3 text-teal"><h6 class="card-title mb-2">SMTR Type</h6><p class="text-orange fw-semibold fs-6 m-0">${transactionData.smtrType || "-"}</p></div>
                                                    <div class="col-6 col-md-3 text-teal"><h6 class="card-title mb-2">Requested Arrival Date</h6><p class="text-orange fw-semibold fs-6 m-0">${transactionData.requestedArrivalDate || "-"}</p></div>
                                                </div>
                                                <div class="row g-3 align-items-start mt-2">
                                                    <div class="col-6 col-md-3 text-teal"><h6 class="card-title mb-2">Date Needed to Arrive</h6><p class="text-orange fw-semibold fs-6 m-0">${transactionData.dateNeededToArrive || "-"}</p></div>
                                                    <div class="col-6 col-md-3 text-teal"><h6 class="card-title mb-2">Department</h6>
                                                        <select id="department" name="department" class="form-control form-control-sm" readonly>
                                                            <option value="${transactionData.department || ""}">${transactionData.department || "-"}</option>
                                                        </select>
                                                    </div>
                                                    <div class="col-6 col-md-3 text-teal"><h6 class="card-title mb-2">Location</h6>
                                                        <select id="location" name="location" class="form-control form-control-sm" readonly>
                                                            <option value="${transactionData.location || ""}">${transactionData.location || "-"}</option>
                                                        </select>
                                                    </div>
                                                    <div class="col-6 col-md-3 text-teal"><h6 class="card-title mb-2">Total</h6><p class="text-orange fw-semibold fs-6 m-0">${transactionData.totalAmount || "-"}</p></div>
                                                </div>
                                                <div class="row g-3 align-items-start mt-2">
                                                    <div class="col-6 col-md-3 text-teal"><h6 class="card-title mb-2">Status</h6><p class="text-orange fw-semibold fs-6 m-0">${transactionData.status || "-"}</p></div>
                                                    <div class="col-6 col-md-3 text-teal"><h6 class="card-title mb-2">Purchase Purpose</h6><input type="text" id="purchasePurpose" name="purchasePurpose" class="form-control form-control-sm" value="${transactionData.purchasePurpose || ""}" readonly/></div>
                                                    <div class="col-12 col-md-3 text-teal"><h6 class="card-title mb-2">Tracking Number</h6><input type="text" id="trackingNumber" name="trackingNumber" class="form-control form-control-sm" value="${transactionData.trackingNumber || ""}" readonly/></div>
                                                    <div class="col-12 col-md-3 text-teal"><h6 class="card-title mb-2">Memo</h6><textarea id="memo" name="memo" class="form-control form-control-sm" rows="3" readonly>${transactionData.memo || ""}</textarea></div>
                                                    <div class="col-6 col-md-3 text-teal"><h6 class="card-title mb-2">Next Approver</h6><p class="text-orange fw-semibold fs-6 m-0">${transactionData.nextApprover || "-"}</p></div>
                                                    <div class="col-6 col-md-3 text-teal"><h6 class="card-title mb-2">Ship To</h6><textarea id="shipTo" name="shipTo" class="form-control form-control-sm" rows="3" readonly>${transactionData.shipTo || ""}</textarea></div>
                                                    <div class="col-6 col-md-3 text-teal"><h6 class="card-title mb-2">Currency</h6><p class="text-orange fw-semibold fs-6 m-0">${transactionData.currency || "-"}</p></div>
                                                </div>
                                            </div>`;
                            }
                            var attachments = transactionData.transactionInvoiceAttachment || [];
                            if (attachments.length > 0) {
                                dashboardPage += `</div>
                                    </div>
                                    <div class="row g-4 mb-4">
                                    <div class="col-12">
                                        <div class="card card-stats p-3">
                                            <div class="row g-3 align-items-start">
                                                <div class="text-teal">
                                                    <h6 class="card-title mb-2">Attachments</h6>`;
                                for (var index = 0; index < attachments.length; index++) {
                                    try {
                                        var transactionAttachment = file.load({ id: attachments[index] });
                                        var transactionAttachmentUrl = transactionAttachment.url;
                                        var host = url.resolveDomain({
                                            hostType: url.HostType.APPLICATION
                                        });
                                        var fullUrl = "https://" + host + transactionAttachmentUrl;
                                        dashboardPage += `<div class="p-2"><a href="${fullUrl}" target="_blank" class="btn-link btn-sm">${transactionAttachment.name}</a></div>`;
                                    } catch (e) {
                                        log.error("Attachment Load Error", e);
                                    }
                                }
                                dashboardPage += `</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>`;
                            }
                            dashboardPage += `</div>
                                        </div>
                                    </div>
                                    <div class="card card-table mb-5">  
                                                <div class="card-header bg-white py-3">
                                                    <div class="d-flex justify-content-between align-items-center flex-wrap gap-2">
                                                        <div><h5 class="m-0 font-weight-bold">Items</h5></div>
                                                    </div>
                                                </div>
                                                <div class="table-responsive">
                                                    <table class="table table-hover mb-0 align-middle detail-items-table"><thead>`;

                            if (context.request.parameters.recordType === "PRRecord") {
                                dashboardPage += `<tr>
                                                <th>Item</th><th>Description</th><th>Quantity</th>
                                                <th>Rate</th><th>Total</th><th>Account</th><th>Vendor</th>
                                            </tr>`;
                            } else {
                                dashboardPage += `<tr>
                                                <th>Item</th><th>Description</th><th>Quantity</th>
                                                <th>Rate</th><th>Amount</th>
                                            </tr>`;
                            }

                            dashboardPage += `</thead><tbody id="itemsTableBodyId">`;

                            if (context.request.parameters.recordType === "PRRecord") {
                                var accountDetails = transactionDataObj.accountDetails || {};
                                var accountKeys = Object.keys(accountDetails);
                                if (transactionData.items && transactionData.items.length > 0) {
                                    for (var i = 0; i < transactionData.items.length; i++) {
                                        var item = transactionData.items[i];
                                        dashboardPage += `<tr>
                                                        <th class="p-3 d-none">${item.itemId || "N/A"}</th>
                                                        <th class="p-3 d-none">${item.itemInternalId || "N/A"}</th>
                                                        <td>${item.itemName || "N/A"}</td>
                                                        <td>${item.itemDescription || "N/A"}</td>
                                                        <td>${item.itemQuantity || "N/A"}</td>
                                                        <td>${item.itemRate || "N/A"}</td>
                                                        <td>${item.itemAmount || "N/A"}</td>
                                                        <td>
                                                       <select class="form-select account-select" name="account" required>
                                                       <option value="${item.accountId}" selected> ${item.accountName} </option>`;
                                        for (var j = 0; j < accountKeys.length; j++) {
                                            var accKey = accountKeys[j];
                                            var accValue = accountDetails[accKey];
                                            dashboardPage += `<option value="${accKey}">${accValue}</option>`;
                                        }
                                        dashboardPage += `</select></td>
                                                        <td>${item.itemVendorName || "N/A"}</td>
                                                    </tr>`;
                                    }
                                } else {
                                    dashboardPage += `<tr><td colspan="6" class="text-center">No items found</td></tr>`;
                                }
                            } else {
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
                                    dashboardPage += `<tr><td colspan="5" class="text-center">No items found</td></tr>`;
                                }
                            }

                            dashboardPage += `</tbody></table></div></div></div>`;
                        }

                        dashboardPage += `</div>`;

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

                        var employeeEmail =
                            userDetailsResponse?.roleDetails?.email || context.request.parameters.vendorEmail || "N/A";
                        var employeeName =
                            userDetailsResponse?.roleDetails?.employeeName || userDetailsResponse?.vendorName || "N/A";
                        var roleName = userDetailsResponse?.roleDetails?.smtrRoleName || "N/A";
                        var location =
                            userDetailsResponse?.roleDetails?.location ||
                            userDetailsResponse?.roleDetails?.locationName ||
                            "N/A";
                        var subsidiary =
                            userDetailsResponse?.roleDetails?.transactionSubsidiary ||
                            userDetailsResponse?.roleDetails?.subsidiaryName ||
                            "N/A";

                        dashboardPage += `<div class="container-fluid p-0 d-none" id="profileSection">
                                        <div class="d-flex align-items-center gap-3 mb-4">
                                            <i class="bi bi-list menu-toggle-btn"></i>
                                            <h1 class="page-title m-0">My Profile</h1>
                                        </div>
                                        <div class="card p-4 mb-4">
                                            <div class="row align-items-center gy-4">
                                                <div class="col-md-3 text-center">
                                                    <i class="bi bi-person-circle" style="font-size:100px; color:#35858B;"></i>
                                                </div>
                                                <div class="col-md-9">
                                                    <div class="row">
                                                        <div class="col-md-6">
                                                            <div class="mb-4"><h6 style="font-weight:700; color:#6c757d;">Name</h6><p style="color: var(--brand-orange);">${employeeName || "N/A"}</p></div>
                                                            <div class="mb-4"><h6 style="font-weight:700; color:#6c757d;">Subsidiary</h6><p style="color: var(--brand-orange);">${subsidiary || "N/A"}</p></div>
                                                            <div class="mb-4"><h6 style="font-weight:700; color:#6c757d;">Role</h6><p style="color: var(--brand-orange);">${roleName || "N/A"}</p></div>
                                                        </div>
                                                        <div class="col-md-6">
                                                            <div class="mb-4"><h6 style="font-weight:700; color:#6c757d;">Email</h6><p style="color: var(--brand-orange);">${employeeEmail || "N/A"}</p></div>
                                                            <div class="mb-4"><h6 style="font-weight:700; color:#6c757d;">Location</h6><p style="color: var(--brand-orange);">${location || "N/A"}</p></div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                    </main>`;

                        dashboardPage += `<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
                                    <script src="https://cdn.jsdelivr.net/npm/choices.js/public/assets/scripts/choices.min.js"></script>
                                    <script>
                                        document.addEventListener("DOMContentLoaded", function() {
                                            var sidebar = document.querySelector(".sidebar");
                                            var closeButton = document.getElementById("sidebar-close");
                                            var dashboardSection = document.getElementById("dashboardSection");
                                            var profileSection = document.getElementById("profileSection");
                                            var dashboardNavLink = document.getElementById("dashboardNavLink");
                                            var profileNavLink = document.getElementById("profileNavLink");

                                            var logoutBtn = document.getElementById("logoutBtn");
                                            if (logoutBtn) {
                                                logoutBtn.addEventListener("click", function(e) {
                                                    e.preventDefault();
                                                    localStorage.setItem("tracknow_logged_in", "false");
                                                    document.getElementById("logoutForm").submit();
                                                });
                                            }

                                            function showSection(sectionToShow) {
                                                if (!dashboardSection || !profileSection) return;
                                                var showingProfile = sectionToShow === "profile";
                                                dashboardSection.classList.toggle("d-none", showingProfile);
                                                profileSection.classList.toggle("d-none", !showingProfile);
                                                if (dashboardNavLink) dashboardNavLink.classList.toggle("active", !showingProfile);
                                                if (profileNavLink) profileNavLink.classList.toggle("active", showingProfile);
                                            }

                                            if (dashboardNavLink) dashboardNavLink.addEventListener("click", function(e) { e.preventDefault(); showSection("dashboard"); });
                                            if (profileNavLink) profileNavLink.addEventListener("click", function(e) { e.preventDefault(); showSection("profile"); });

                                            document.querySelectorAll(".menu-toggle-btn").forEach(function(btn) {
                                                btn.addEventListener("click", function(e) {
                                                    e.preventDefault();
                                                    sidebar.classList.toggle("show");
                                                });
                                            });

                                            if (closeButton && sidebar) closeButton.addEventListener("click", function(e) { e.preventDefault(); sidebar.classList.remove("show"); });

                                            var initialActiveDashboard = "${activeDashboard || ""}";
                                            if (initialActiveDashboard === "Profile") showSection("profile");

                                            document.querySelectorAll(".callingmethod").forEach(function(form) {
                                                form.addEventListener('click', function(event) {
                                                    if (!['BUTTON','INPUT','SELECT','A','LABEL'].includes(event.target.tagName)) this.submit();
                                                });
                                            });

                                            document.querySelectorAll(".selectingfilter").forEach(function(form) {
                                                form.addEventListener('change', function() { this.submit(); });
                                            });
                                        });
                                    </script>
                                    <script>
                                    document.addEventListener("DOMContentLoaded", function () {
                                        var selects = document.querySelectorAll(".account-select, .account-select-global");
                                        selects.forEach(function(select) {
                               
                                        // prevent duplicate init
                                        if (select.classList.contains("choices-initialized")) return;
                                       
                                        new Choices(select, {
                                          searchEnabled: true,
                                          shouldSort: false,
                                          itemSelectText: "",
                                          searchPlaceholderValue: "Search account...",
                                          placeholder: true,
                                          placeholderValue: "Select Account",
                                          searchResultLimit: 100,
                                          renderChoiceLimit: -1,
                                          position: "bottom"
                                        });
                                       
                                        select.classList.add("choices-initialized");
                                      });

                                      // Keep only the nearest table wrapper unlocked while dropdown is open
                                      document.querySelectorAll(".account-select, .account-select-global").forEach(function(select) {
                                        var choicesEl = select.closest(".choices");
                                        if (!choicesEl) return;

                                        function getTableWrapper() {
                                            return choicesEl.closest(".table-responsive");
                                        }

                                        function openDropdownWrapper() {
                                            var wrapper = getTableWrapper();
                                            if (wrapper) wrapper.classList.add("choices-open");
                                        }

                                        function closeDropdownWrapper() {
                                            var wrapper = getTableWrapper();
                                            if (wrapper) wrapper.classList.remove("choices-open");
                                        }

                                        select.addEventListener("showDropdown", openDropdownWrapper);
                                        select.addEventListener("hideDropdown", closeDropdownWrapper);
                                      });


                                        var approveBtn = document.getElementById("approveButton");
                                        if (approveBtn) {
                                            approveBtn.addEventListener("click", function (e) {
                                                e.preventDefault();
                                                var rows = document.querySelectorAll("#itemsTableBodyId tr");
                                                var dataArr = [];
                                                for (var r = 0; r < rows.length; r++) {
                                                    var row = rows[r];
                                                    var hiddenCells = row.querySelectorAll("th.d-none");
                                                    var itemId = hiddenCells.length > 0 ? hiddenCells[0].textContent.trim() : "";
                                                    var itemInternalId = hiddenCells.length > 1 ? hiddenCells[1].textContent.trim() : "";
                                                    var tds = row.querySelectorAll("td");
                                                    if (tds.length >= 4) {
                                                        var itemName = tds[0].textContent.trim();
                                                        var itemDescription = tds[1].textContent.trim();
                                                        var itemQuantity = tds[2].textContent.trim();
                                                        var itemRate = tds[3].textContent.trim();
                                                        var itemAmount = tds[4].textContent.trim();
                                                        var accountSelect = row.querySelector("select.account-select");
                                                        var accountId = accountSelect ? accountSelect.value : "";
                                                        var accountName = accountSelect ? accountSelect.options[accountSelect.selectedIndex].text : "";
                                                        dataArr.push({
                                                             itemId: itemId,
                                                             itemInternalId: itemInternalId,
                                                             itemName: itemName,
                                                             itemDescription: itemDescription,
                                                             itemQuantity: itemQuantity,
                                                             itemRate: itemRate,
                                                             itemAmount: itemAmount,
                                                             accountId: accountId,
                                                             accountName: accountName
                                                        });
                                                    }
                                                }
                                                var jsonData = JSON.stringify(dataArr);
                                                var hiddenInput = document.querySelector('input[name="approvedTransactionDetails"]');
                                                if (hiddenInput) hiddenInput.value = JSON.stringify(dataArr);
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
                                                var statusInput = document.createElement("input");
                                                statusInput.type = "hidden"; statusInput.name = "approvalStatus"; statusInput.value = "Fulfilled";
                                                fulfillBtn.closest("form").appendChild(statusInput);
                                                fulfillBtn.closest("form").submit();
                                            });
                                        }
                                    });
                                    </script></body></html>`;

                        context.response.write(dashboardPage);
                    }
                } else {
                    log.debug("OTP Verification Error");
                    context.request.parameters.verified = false;
                    context.response.write(
                        "<script>alert('Invalid OTP entered. Please try again.');</script>" +
                        verifyPage(
                            context.request.parameters.employeeInternalId,
                            context.request.parameters.vendorEmail,
                            parseBoolean(context.request.parameters.prAccess),
                            parseBoolean(context.request.parameters.smtrAccess),
                            parseBoolean(context.request.parameters.prRequestorAccess),
                            parseBoolean(context.request.parameters.smtrRequestorAccess)
                        )
                    );
                }
            } else {
                log.debug("OTP Verification Not Attempted");
                if (
                    authentication === false &&
                    !context.request.parameters.get_otp &&
                    !context.request.parameters.logout
                ) {
                    context.request.parameters.verified = false;
                    context.response.write(
                        "<script>alert('Another Login Request Detected. Due to security reasons, your session has been terminated.');</script>" +
                        loginPage(
                            context.request.parameters.employeeInternalId,
                            context.request.parameters.vendorEmail
                        )
                    );
                }
            }
        }
    }

    return {
        onRequest: onRequest
    };
});

