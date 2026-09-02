/* =========================================================
   PRIYA ENTERPRISES
   PREMIUM MAIN JAVASCRIPT
   ========================================================= */


/* =========================================================
   CONFIGURATION
   ========================================================= */

const API_BASE_URL =
    "https://priya-enterprises-web.onrender.com";


/* =========================================================
   DOM READY
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        initializeHeader();

        initializeMobileMenu();

        initializeScrollReveal();

        initializeCardAnimations();

        initializeInquiryForm();

        checkBackendStatus();

    }
);


/* =========================================================
   HEADER
   ========================================================= */

function initializeHeader() {

    const header =
        document.querySelector(".header");

    if (!header) return;

    function updateHeader() {

        if (window.scrollY > 30) {

            header.classList.add("scrolled");

        } else {

            header.classList.remove("scrolled");

        }

    }

    updateHeader();

    window.addEventListener(
        "scroll",
        updateHeader,
        {
            passive: true
        }
    );

}


/* =========================================================
   MOBILE MENU
   ========================================================= */

function initializeMobileMenu() {

    const menuBtn =
        document.querySelector(".menu-btn");

    const navLinks =
        document.querySelector(".nav-links");

    const links =
        document.querySelectorAll(
            ".nav-links a"
        );

    if (!menuBtn || !navLinks) return;

    const icon =
        menuBtn.querySelector("i");

    menuBtn.addEventListener(
        "click",
        () => {

            const isOpen =
                navLinks.classList.toggle(
                    "active"
                );

            menuBtn.setAttribute(
                "aria-expanded",
                String(isOpen)
            );

            if (!icon) return;

            if (isOpen) {

                icon.classList.replace(
                    "fa-bars",
                    "fa-xmark"
                );

            } else {

                icon.classList.replace(
                    "fa-xmark",
                    "fa-bars"
                );

            }

        }
    );


    links.forEach(
        link => {

            link.addEventListener(
                "click",
                () => {

                    navLinks.classList.remove(
                        "active"
                    );

                    menuBtn.setAttribute(
                        "aria-expanded",
                        "false"
                    );

                    if (icon) {

                        icon.classList.replace(
                            "fa-xmark",
                            "fa-bars"
                        );

                    }

                }
            );

        }
    );

}


/* =========================================================
   SCROLL REVEAL
   ========================================================= */

function initializeScrollReveal() {

    const revealElements =
        document.querySelectorAll(

            ".intro, " +
            ".materials, " +
            ".trust, " +
            ".brands, " +
            ".contact, " +
            ".material-card, " +
            ".brand-category, " +
            ".brand-card, " +
            ".contact-row, " +
            ".footer-brand, " +
            ".footer-links, " +
            ".enquiry-wrapper"

        );


    if (!revealElements.length) return;


    revealElements.forEach(
        element => {

            element.classList.add(
                "reveal"
            );

        }
    );


    if (
        !("IntersectionObserver" in window)
    ) {

        revealElements.forEach(
            element => {

                element.classList.add(
                    "show"
                );

            }
        );

        return;

    }


    const revealObserver =
        new IntersectionObserver(

            (
                entries,
                observer
            ) => {

                entries.forEach(
                    entry => {

                        if (
                            entry.isIntersecting
                        ) {

                            entry.target.classList.add(
                                "show"
                            );

                            observer.unobserve(
                                entry.target
                            );

                        }

                    }
                );

            },

            {
                threshold: 0.12,

                rootMargin:
                    "0px 0px -50px 0px"
            }

        );


    revealElements.forEach(
        element => {

            revealObserver.observe(
                element
            );

        }
    );

}


/* =========================================================
   CARD ANIMATIONS
   ========================================================= */

function initializeCardAnimations() {

    const brandCards =
        document.querySelectorAll(
            ".brand-card"
        );


    brandCards.forEach(
        (card, index) => {

            card.style.transitionDelay =
                `${(index % 4) * 0.08}s`;

        }
    );


    const materialCards =
        document.querySelectorAll(
            ".material-card"
        );


    materialCards.forEach(
        (card, index) => {

            card.style.transitionDelay =
                `${index * 0.08}s`;

        }
    );

}


/* =========================================================
   INQUIRY FORM
   ========================================================= */

function initializeInquiryForm() {

    const inquiryForm =
        document.getElementById(
            "inquiryForm"
        );


    if (!inquiryForm) return;


    const formStatus =
        document.getElementById(
            "formStatus"
        );


    const submitButton =
        document.getElementById(
            "submitInquiry"
        );


    const buttonText =
        submitButton?.querySelector(
            ".button-text"
        );


    const buttonLoading =
        submitButton?.querySelector(
            ".button-loading"
        );


    const messageInput =
        document.getElementById(
            "message"
        );


    const messageCount =
        document.getElementById(
            "messageCount"
        );


    /* =====================================================
       MESSAGE CHARACTER COUNTER
       ===================================================== */

    function updateCharacterCount() {

        if (
            !messageInput ||
            !messageCount
        ) {

            return;

        }


        messageCount.textContent =
            messageInput.value.length;

    }


    if (messageInput) {

        messageInput.addEventListener(
            "input",
            updateCharacterCount
        );

        updateCharacterCount();

    }


    /* =====================================================
       STATUS
       ===================================================== */

    function showFormStatus(
        message,
        type
    ) {

        if (!formStatus) return;


        formStatus.textContent =
            message;


        formStatus.className =
            `form-status ${type}`;

    }


    function clearFormStatus() {

        if (!formStatus) return;


        formStatus.textContent =
            "";


        formStatus.className =
            "form-status";

    }


    /* =====================================================
       LOADING
       ===================================================== */

    function setLoading(
        isLoading
    ) {

        if (!submitButton) return;


        submitButton.disabled =
            isLoading;


        if (buttonText) {

            buttonText.hidden =
                isLoading;

        }


        if (buttonLoading) {

            buttonLoading.hidden =
                !isLoading;

        }


        if (isLoading) {

            submitButton.setAttribute(
                "aria-busy",
                "true"
            );

        } else {

            submitButton.removeAttribute(
                "aria-busy"
            );

        }

    }


    /* =====================================================
       VALIDATION
       ===================================================== */

    function validateForm(
        data
    ) {

        if (
            !data.name ||
            data.name.trim().length < 2
        ) {

            return (
                "Please enter your name."
            );

        }


        const phone =
            data.phone.replace(
                /\D/g,
                ""
            );


        let normalizedPhone =
            phone;


        if (
            normalizedPhone.startsWith(
                "91"
            ) &&
            normalizedPhone.length === 12
        ) {

            normalizedPhone =
                normalizedPhone.substring(
                    2
                );

        }


        if (
            normalizedPhone.length !== 10 ||
            ![
                "6",
                "7",
                "8",
                "9"
            ].includes(
                normalizedPhone[0]
            )
        ) {

            return (
                "Please enter a valid 10-digit mobile number."
            );

        }


        if (!data.material) {

            return (
                "Please select the material you need."
            );

        }


        if (
            !data.message ||
            data.message.trim().length < 3
        ) {

            return (
                "Please enter your enquiry."
            );

        }


        if (data.email) {

            const emailPattern =
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


            if (
                !emailPattern.test(
                    data.email
                )
            ) {

                return (
                    "Please enter a valid email address."
                );

            }

        }


        return null;

    }


    /* =====================================================
       SUBMIT
       ===================================================== */

    inquiryForm.addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            clearFormStatus();


            /* ---------------------------------------------
               FORM DATA
            --------------------------------------------- */

            const formData =
                new FormData(
                    inquiryForm
                );


            const data = {

                name:
                    formData
                        .get("name")
                        ?.trim() || "",

                phone:
                    formData
                        .get("phone")
                        ?.trim() || "",

                email:
                    formData
                        .get("email")
                        ?.trim() || "",

                material:
                    formData
                        .get("material")
                        ?.trim() || "",

                message:
                    formData
                        .get("message")
                        ?.trim() || ""

            };


            /* ---------------------------------------------
               VALIDATE
            --------------------------------------------- */

            const validationError =
                validateForm(
                    data
                );


            if (validationError) {

                showFormStatus(
                    validationError,
                    "error"
                );

                return;

            }


            /* ---------------------------------------------
               LOADING
            --------------------------------------------- */

            setLoading(true);


            showFormStatus(
                "Sending your enquiry...",
                "loading"
            );


            /* ---------------------------------------------
               API URL
            --------------------------------------------- */

            const inquiryURL =
                `${API_BASE_URL}/api/inquiries`;


            console.log(
                "=========================================="
            );

            console.log(
                "PRIYA ENTERPRISES — INQUIRY REQUEST"
            );

            console.log(
                "API URL:",
                inquiryURL
            );

            console.log(
                "Frontend:",
                window.location.origin
            );

            console.log(
                "Request data:",
                data
            );

            console.log(
                "=========================================="
            );


            try {

                /* -----------------------------------------
                   BACKEND REQUEST
                ----------------------------------------- */

                const response =
                    await fetch(

                        inquiryURL,

                        {

                            method:
                                "POST",

                            headers: {

                                "Content-Type":
                                    "application/json",

                                "Accept":
                                    "application/json"

                            },

                            body:
                                JSON.stringify(
                                    data
                                )

                        }

                    );


                console.log(
                    "Backend response received."
                );

                console.log(
                    "HTTP status:",
                    response.status
                );

                console.log(
                    "HTTP status text:",
                    response.statusText
                );


                /* -----------------------------------------
                   RESPONSE JSON
                ----------------------------------------- */

                let result = null;


                try {

                    result =
                        await response.json();


                    console.log(
                        "Backend JSON:",
                        result
                    );

                } catch (jsonError) {

                    console.error(
                        "Could not read backend JSON:",
                        jsonError
                    );

                }


                /* -----------------------------------------
                   SERVER ERROR
                ----------------------------------------- */

                if (!response.ok) {

                    throw new Error(

                        result?.error ||

                        `Server returned HTTP ${response.status}.`

                    );

                }


                /* -----------------------------------------
                   SUCCESS
                ----------------------------------------- */

                console.log(
                    "✅ INQUIRY SUBMITTED SUCCESSFULLY"
                );


                showFormStatus(

                    result?.message ||

                    "Your enquiry was sent successfully!",

                    "success"

                );


                /* Clear form */

                inquiryForm.reset();


                /* Reset character count */

                if (messageCount) {

                    messageCount.textContent =
                        "0";

                }


                /* Scroll to status */

                formStatus?.scrollIntoView({

                    behavior:
                        "smooth",

                    block:
                        "center"

                });


            } catch (error) {

                /* =========================================
                   DETAILED ERROR LOG
                   ========================================= */

                console.error(
                    "========== INQUIRY ERROR =========="
                );

                console.error(
                    "Error:",
                    error
                );

                console.error(
                    "Name:",
                    error.name
                );

                console.error(
                    "Message:",
                    error.message
                );

                console.error(
                    "API URL:",
                    inquiryURL
                );

                console.error(
                    "Frontend URL:",
                    window.location.href
                );

                console.error(
                    "Frontend Origin:",
                    window.location.origin
                );

                console.error(
                    "==================================="
                );


                /* =========================================
                   USER MESSAGE
                   ========================================= */

                if (
                    error instanceof TypeError
                ) {

                    showFormStatus(

                        "Unable to connect to the Priya Enterprises server. " +
                        "Please go into our whatsapp group.",

                        "error"

                    );

                } else {

                    showFormStatus(

                        `Request failed: ${
                            error.message ||
                            "Unknown error"
                        }`,

                        "error"

                    );

                }

            } finally {

                setLoading(false);

            }

        }
    );

}


/* =========================================================
   BACKEND STATUS CHECK
   ========================================================= */

async function checkBackendStatus() {

    const statusURL =
        `${API_BASE_URL}/api/status`;


    console.log(
        "Checking Priya Enterprises backend..."
    );

    console.log(
        "Backend URL:",
        statusURL
    );


    try {

        const response =
            await fetch(

                statusURL,

                {

                    method:
                        "GET",

                    headers: {

                        "Accept":
                            "application/json"

                    }

                }

            );


        console.log(
            "Backend status HTTP:",
            response.status
        );


        if (!response.ok) {

            throw new Error(
                `Backend returned HTTP ${response.status}`
            );

        }


        const data =
            await response.json();


        console.log(
            "✅ Priya Enterprises Backend ONLINE"
        );

        console.log(
            "Status:",
            data.status
        );

        console.log(
            "Version:",
            data.version
        );

        console.log(
            "Total inquiries:",
            data.total_inquiries
        );


    } catch (error) {

        console.error(
            "❌ BACKEND STATUS ERROR"
);

        console.error(
            "Error:",
            error
        );

        console.error(
            "Name:",
            error.name
        );

        console.error(
            "Message:",
            error.message
        );

        console.error(
            "Backend URL:",
            statusURL
        );

    }

}


/* =========================================================
   SMOOTH INTERNAL LINKS
   ========================================================= */

document.addEventListener(
    "click",
    event => {

        const link =
            event.target.closest(
                'a[href^="#"]'
            );


        if (!link) return;


        const targetId =
            link.getAttribute(
                "href"
            );


        if (
            !targetId ||
            targetId === "#"
        ) {

            return;

        }


        const target =
            document.querySelector(
                targetId
            );


        if (!target) return;


        event.preventDefault();


        target.scrollIntoView({

            behavior:
                "smooth",

            block:
                "start"

        });

    }
);


/* =========================================================
   END
   ========================================================= */