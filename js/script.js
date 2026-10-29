
/* ============================================
   RUEDA CENTRO DE ESTÉTICA
   JAVASCRIPT PRINCIPAL
============================================ */

document.addEventListener("DOMContentLoaded", () => {

  /* ==========================================
     01. MENÚ MÓVIL
  ========================================== */

  const menuToggle = document.querySelector(".menu-toggle");
  const mainNav = document.querySelector("#main-nav");

  if (menuToggle && mainNav) {

    function cerrarMenu() {
      mainNav.classList.remove("is-open");

      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.setAttribute("aria-label", "Abrir menú");
      menuToggle.textContent = "☰";
    }

    menuToggle.addEventListener("click", () => {

      const estaAbierto = mainNav.classList.toggle("is-open");

      menuToggle.setAttribute(
        "aria-expanded",
        String(estaAbierto)
      );

      menuToggle.setAttribute(
        "aria-label",
        estaAbierto ? "Cerrar menú" : "Abrir menú"
      );

      menuToggle.textContent = estaAbierto ? "✕" : "☰";

    });

    // Cerrar al seleccionar un enlace
    mainNav.querySelectorAll("a").forEach((enlace) => {
      enlace.addEventListener("click", cerrarMenu);
    });

    // Cerrar al presionar Escape
    document.addEventListener("keydown", (evento) => {
      if (evento.key === "Escape") {
        cerrarMenu();
      }
    });

    // Cerrar si volvemos a pantalla grande
    window.addEventListener("resize", () => {
      if (window.innerWidth > 900) {
        cerrarMenu();
      }
    });

  }



});
