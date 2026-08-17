/* =========================================
   ULTRATECH PAGE JAVASCRIPT
   PRIYA ENTERPRISES
========================================= */

document.addEventListener("DOMContentLoaded", () => {

    console.log("UltraTech page loaded successfully.");


    /* =====================================
       PRODUCT CARDS
    ===================================== */

    const productCards =
        document.querySelectorAll(".product-card");


    productCards.forEach((card) => {

        card.addEventListener("mouseenter", () => {

            card.classList.add("active");

        });


        card.addEventListener("mouseleave", () => {

            card.classList.remove("active");

        });

    });


    /* =====================================
       WHATSAPP MESSAGE
    ===================================== */

    const whatsappButtons =
        document.querySelectorAll(".whatsapp-btn");


    whatsappButtons.forEach((button) => {

        button.addEventListener("click", () => {

            console.log(
                "Customer clicked WhatsApp enquiry."
            );

        });

    });

});