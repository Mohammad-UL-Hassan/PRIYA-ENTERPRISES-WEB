/* =========================================================
   PRIYA ENTERPRISES
   MAIN JAVASCRIPT
   ========================================================= */


/* ------------------------------
   HEADER
------------------------------ */

const header = document.querySelector(".header");


window.addEventListener("scroll", () => {

    if (window.scrollY > 30) {
        header.classList.add("scrolled");
    } else {
        header.classList.remove("scrolled");
    }

});


/* ------------------------------
   MOBILE MENU
------------------------------ */

const menuBtn = document.querySelector(".menu-btn");
const navLinks = document.querySelector(".nav-links");
const links = document.querySelectorAll(".nav-links a");


menuBtn.addEventListener("click", () => {

    navLinks.classList.toggle("active");

    const icon = menuBtn.querySelector("i");

    if (navLinks.classList.contains("active")) {

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

});


links.forEach(link => {

    link.addEventListener("click", () => {

        navLinks.classList.remove("active");

        const icon = menuBtn.querySelector("i");

        icon.classList.replace(
            "fa-xmark",
            "fa-bars"
        );

    });

});


/* =========================================================
   PREMIUM SCROLL REVEAL
   ========================================================= */


const revealElements = document.querySelectorAll(
    ".intro, .materials, .trust, .brands, .contact, " +
    ".material-card, .brand-category, .brand-card, " +
    ".contact-row, .footer-brand, .footer-links"
);


revealElements.forEach(element => {

    element.classList.add("reveal");

});


const revealObserver = new IntersectionObserver(

    (entries, observer) => {

        entries.forEach(entry => {

            if (entry.isIntersecting) {

                entry.target.classList.add("show");

                observer.unobserve(entry.target);

            }

        });

    },

    {
        threshold: 0.12,
        rootMargin: "0px 0px -50px 0px"
    }

);


revealElements.forEach(element => {

    revealObserver.observe(element);

});


/* =========================================================
   STAGGER BRAND CARDS
   ========================================================= */


const brandCards = document.querySelectorAll(".brand-card");


brandCards.forEach((card, index) => {

    card.style.transitionDelay =
        `${(index % 4) * 0.08}s`;

});


/* =========================================================
   STAGGER MATERIAL CARDS
   ========================================================= */


const materialCards =
    document.querySelectorAll(".material-card");


materialCards.forEach((card, index) => {

    card.style.transitionDelay =
        `${index * 0.08}s`;

});