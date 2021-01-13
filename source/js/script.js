"use strict";

const menuButton = document.querySelector(".nav__button"),
  menuNav = document.querySelector(".nav__list"),
  header = document.querySelector(".header");

menuButton.classList.remove("nav__button--no-js")
changeStateMenu();

menuButton.addEventListener("click", () => {
  changeStateMenu();
});

function changeStateMenu() {
  const isExpanded = menuButton.getAttribute('aria-expanded') === 'true';;

  menuNav.classList.toggle("nav__list--hide");
  menuButton.setAttribute("aria-expanded", !isExpanded);
  menuButton.classList.toggle("nav__button--close");
  header.classList.toggle("header--transparent")
}
