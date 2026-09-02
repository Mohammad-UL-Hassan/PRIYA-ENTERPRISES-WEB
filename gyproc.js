/* =========================================================
   GYPROC PAGE
   PRIYA ENTERPRISES
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    console.log("GYPROC page loaded successfully.");


    /* =========================================
       PRODUCT CARDS
    ========================================= */

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


    /* =========================================
       WHATSAPP ENQUIRY
    ========================================= */

    const whatsappButtons =
        document.querySelectorAll(".whatsapp-btn");


    whatsappButtons.forEach((button) => {

        button.addEventListener("click", () => {

            console.log(
                "GYPROC product enquiry clicked."
            );

        });

    });


    /* =========================================
       IMAGE ERROR HANDLING
    ========================================= */

    const productImages =
        document.querySelectorAll(".product-image img");


    productImages.forEach((image) => {

        image.addEventListener("error", () => {

            console.warn(
                "ACC product image could not be loaded:",
                image.src
            );

        });

    });

});