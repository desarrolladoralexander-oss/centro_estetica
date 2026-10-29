
/* ============================================
   RUEDA CENTRO DE ESTÉTICA
   JAVASCRIPT PRINCIPAL
============================================ */

document.addEventListener("DOMContentLoaded", () => {

  /* ==========================================
     00. CONTACTO OPCIONAL POR WHATSAPP
  ========================================== */

  const contactActions = document.querySelector("[data-whatsapp-number]");
  const rawWhatsappNumber = contactActions?.dataset.whatsappNumber || "";
  const whatsappNumber = rawWhatsappNumber.replace(/\D/g, "");

  if (contactActions && whatsappNumber) {
    const whatsappLink = document.createElement("a");

    whatsappLink.className = "contact-button";
    whatsappLink.href = `https://wa.me/${whatsappNumber}`;
    whatsappLink.target = "_blank";
    whatsappLink.rel = "noopener noreferrer";
    whatsappLink.textContent = "ESCRÍBENOS POR WHATSAPP ↗";

    contactActions.append(whatsappLink);
  }

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


  /* ==========================================
     02. FILTROS DE TRATAMIENTOS
  ========================================== */

  const botonesFiltro = document.querySelectorAll(".filter-btn");

  const tarjetasTratamiento = document.querySelectorAll(
    ".treatment-card"
  );

  function filtrarTratamientos(categoria) {

    // Actualizar botones
    botonesFiltro.forEach((boton) => {

      const seleccionado = boton.dataset.filter === categoria;

      boton.classList.toggle("active", seleccionado);

      boton.setAttribute(
        "aria-pressed",
        String(seleccionado)
      );

    });

    // Mostrar u ocultar tarjetas
    tarjetasTratamiento.forEach((tarjeta) => {

      const categoriaTarjeta = tarjeta.dataset.category;

      const mostrar =
        categoria === "todos" ||
        categoriaTarjeta === categoria;

      tarjeta.hidden = !mostrar;

    });

  }

  // Clic en los botones de filtro
  botonesFiltro.forEach((boton) => {

    boton.addEventListener("click", () => {

      const categoria = boton.dataset.filter;

      filtrarTratamientos(categoria);

    });

  });


  /* ==========================================
     03. TARJETAS DE CATEGORÍAS
  ========================================== */

  const enlacesCategoria = document.querySelectorAll(
    "[data-category-link]"
  );

  enlacesCategoria.forEach((enlace) => {

    enlace.addEventListener("click", () => {

      const categoria = enlace.dataset.categoryLink;

      filtrarTratamientos(categoria);

    });

  });


  /* ==========================================
     04. ANIMACIONES AL HACER SCROLL
  ========================================== */

  const elementosAnimados = document.querySelectorAll(
    ".section-heading, " +
    ".category-card, " +
    ".treatment-card, " +
    ".about-card, " +
    ".step-card, " +
    ".feature-content"
  );

  const movimientoReducido = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  if (!movimientoReducido && "IntersectionObserver" in window) {

    // Agregar clase de preparación
    elementosAnimados.forEach((elemento) => {
      elemento.classList.add("reveal");
    });

    const observador = new IntersectionObserver(
      (entradas, observer) => {

        entradas.forEach((entrada) => {

          if (entrada.isIntersecting) {

            entrada.target.classList.add("visible");

            // Animar solamente la primera vez
            observer.unobserve(entrada.target);

          }

        });

      },
      {
        threshold: 0.08,
        rootMargin: "0px 0px -30px 0px"
      }
    );

    elementosAnimados.forEach((elemento) => {
      observador.observe(elemento);
    });

  }


  /* ==========================================
     05. REINICIAR FILTRO AL CARGAR
  ========================================== */

  filtrarTratamientos("todos");

});
