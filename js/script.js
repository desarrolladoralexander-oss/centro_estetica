
/* ============================================
   RUEDA CENTRO DE ESTÉTICA
   JAVASCRIPT PRINCIPAL
============================================ */

document.addEventListener("DOMContentLoaded", () => {

    /* 00. SELECCIÓN DE TRATAMIENTO PARA RESERVAR */

  const bookingDialog = document.querySelector("#booking-dialog");

  if (bookingDialog && typeof bookingDialog.showModal === "function") {
    const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyMplm7UUl2-1wBkJPNRyh3lDnsZrw1WNtYS-07vk4CbM5aAFqj5ysKvc9C-NySJRq9/exec";

    const bookingTriggers = document.querySelectorAll(".booking-trigger");
    const bookingOptions = bookingDialog.querySelectorAll("[data-booking-service]");
    const bookingOptionsBox = bookingDialog.querySelector(".booking-options");
    const bookingContinue = bookingDialog.querySelector(".booking-continue");
    const bookingSelection = bookingDialog.querySelector(".booking-selection");
    const bookingIntro = bookingDialog.querySelector(".booking-intro");
    const bookingCalendar = bookingDialog.querySelector(".booking-calendar");
    const bookingCalendarSummary = bookingDialog.querySelector(".booking-selection-summary");
    const bookingBack = bookingDialog.querySelector(".booking-back");
    const bookingTitle = bookingDialog.querySelector("#booking-title");

    // Quitar el calendario de Google y su nota
    bookingDialog.querySelector(".booking-calendar-frame")?.remove();
    bookingDialog.querySelector(".booking-note")?.remove();

    const agenda = document.createElement("div");
    agenda.className = "rw-agenda";
    bookingCalendar.append(agenda);

    const WEEK = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
    const MONTHS = [
      "enero", "febrero", "marzo", "abril", "mayo", "junio",
      "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
    ];

    let st = {};

    const pad = (n) => String(n).padStart(2, "0");
    const escapeHTML = (value) => String(value).replace(/[&<>"']/g, (character) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    })[character]);
    const toKey = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    const fromKey = (k) => {
      const [y, m, d] = k.split("-").map(Number);
      return new Date(y, m - 1, d);
    };
    const fmtTime = (hhmm) => {
      let [h, m] = hhmm.split(":").map(Number);
      const suffix = h >= 12 ? "pm" : "am";
      h = h % 12 || 12;
      return `${h}:${pad(m)} ${suffix}`;
    };

    function resetState(service) {
      st = {
        service,
        days: [],
        times: [],
        date: "",
        time: "",
        name: "",
        phone: "",
        loading: false,
        sending: false,
        error: "",
        confirmed: false,
      };
    }

    async function api(params) {
      const res = await fetch(APPS_SCRIPT_URL + "?" + new URLSearchParams(params));
      return res.json();
    }

    async function loadDays() {
      st.loading = true;
      st.error = "";
      renderAgenda();
      try {
        const data = await api({ action: "days" });
        st.days = Array.isArray(data) ? data : [];
      } catch (e) {
        st.error = "No pudimos cargar los días. Intenta de nuevo.";
      }
      st.loading = false;
      renderAgenda();
    }

    async function loadTimes(dateKey) {
      st.loading = true;
      st.times = [];
      st.error = "";
      renderAgenda();
      try {
        const data = await api({ action: "times", date: dateKey });
        st.times = Array.isArray(data) ? data : [];
      } catch (e) {
        st.error = "No pudimos cargar las horas. Intenta de nuevo.";
      }
      st.loading = false;
      renderAgenda();
    }

    async function enviarReserva() {
      st.sending = true;
      st.error = "";
      renderAgenda();
      try {
        const res = await fetch(APPS_SCRIPT_URL, {
          method: "POST",
          headers: { "Content-Type": "text/plain;charset=utf-8" },
          body: JSON.stringify({
            service: st.service,
            start: `${st.date}T${st.time}:00-05:00`,
            name: st.name.trim(),
            phone: st.phone.trim(),
          }),
        });
        const data = await res.json();
        if (data.ok) {
          st.confirmed = true;
        } else {
          st.error = data.error || "No se pudo reservar. Elige otra hora.";
          st.time = "";
          st.sending = false;
          await loadTimes(st.date);
          return;
        }
      } catch (e) {
        st.error = "Hubo un problema de conexión. Intenta de nuevo.";
      }
      st.sending = false;
      renderAgenda();
    }

    function puedeConfirmar() {
      return st.date && st.time && st.name.trim() && st.phone.trim() && !st.sending;
    }

    function renderAgenda() {
      if (st.confirmed) {
        const d = fromKey(st.date);
        agenda.innerHTML = `
          <div class="rw-msg">
            Tu cita de <strong>${escapeHTML(st.service)}</strong> quedó para el
            ${WEEK[d.getDay()].toLowerCase()} ${d.getDate()} de ${MONTHS[d.getMonth()]}
            a las ${fmtTime(st.time)}. Te confirmaremos la reserva.
          </div>`;
        return;
      }

      const todayKey = toKey(new Date());
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowKey = toKey(tomorrow);

      const dayButtons = st.days.map((k) => {
        const d = fromKey(k);
        const label = k === todayKey ? "Hoy" : k === tomorrowKey ? "Mañana" : WEEK[d.getDay()];
        return `
          <button type="button" class="rw-day ${st.date === k ? "selected" : ""}" data-date="${k}">
            <span class="rw-dw">${label}</span>
            <span class="rw-dn">${d.getDate()}</span>
          </button>`;
      }).join("");

      const timeButtons = st.times.map((t) => `
        <button type="button" class="rw-time ${st.time === t ? "selected" : ""}" data-time="${t}">${fmtTime(t)}</button>`).join("");

      const sinHoras = st.date && !st.loading && st.times.length === 0
        ? `<p class="rw-loading">No hay horas libres para este día.</p>` : "";

      agenda.innerHTML = `
        <h4 class="rw-label">Día</h4>
        ${st.loading && !st.days.length ? `<p class="rw-loading">Cargando días...</p>` : ""}
        <div class="rw-days">${dayButtons}</div>

        ${st.date ? `<h4 class="rw-label">Hora</h4>` : ""}
        ${st.loading && st.date ? `<p class="rw-loading">Cargando horas...</p>` : ""}
        ${st.date ? `<div class="rw-times">${timeButtons}</div>` : ""}
        ${sinHoras}

        ${st.time ? `
          <h4 class="rw-label">Tus datos</h4>
          <input class="rw-input" id="rw-name" name="name" autocomplete="name" placeholder="Nombre" value="${escapeHTML(st.name)}">
          <input class="rw-input" id="rw-phone" name="phone" type="tel" autocomplete="tel" placeholder="Teléfono" value="${escapeHTML(st.phone)}">
        ` : ""}

        <button type="button" class="rw-confirm" data-action="confirm" ${puedeConfirmar() ? "" : "disabled"}>
          ${st.sending ? "ENVIANDO..." : "CONFIRMAR CITA"}
        </button>

        ${st.error ? `<div class="rw-msg rw-error">${st.error}</div>` : ""}
      `;
    }

    function actualizarBoton() {
      const btn = agenda.querySelector(".rw-confirm");
      if (btn) btn.disabled = !puedeConfirmar();
    }

    // Clics: día, hora, confirmar
    agenda.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-date], [data-time], [data-action]");
      if (!btn) return;

      if (btn.dataset.date !== undefined) {
        st.date = btn.dataset.date;
        st.time = "";
        loadTimes(st.date);
      } else if (btn.dataset.time !== undefined) {
        st.time = btn.dataset.time;
        renderAgenda();
      } else if (btn.dataset.action === "confirm" && puedeConfirmar()) {
        enviarReserva();
      }
    });

    // Escribir nombre y teléfono sin volver a dibujar la pantalla
    agenda.addEventListener("input", (e) => {
      if (e.target.id === "rw-name") st.name = e.target.value;
      if (e.target.id === "rw-phone") st.phone = e.target.value;
      actualizarBoton();
    });

    function mostrarSelectorTratamientos() {
      bookingCalendar.hidden = true;
      bookingOptionsBox.hidden = false;
      bookingIntro.hidden = false;
      bookingSelection.hidden = false;
      bookingContinue.hidden = false;
      bookingOptions.forEach((option) => {
        option.classList.remove("is-selected");
        option.setAttribute("aria-pressed", "false");
      });
      bookingContinue.setAttribute("aria-disabled", "true");
      delete bookingContinue.dataset.selectedService;
      bookingSelection.textContent = "";
      bookingTitle.innerHTML = "¿Qué tratamiento <em>quieres elegir?</em>";
    }

    function abrirAgenda(service) {
      resetState(service);
      bookingOptionsBox.hidden = true;
      bookingIntro.hidden = true;
      bookingSelection.hidden = true;
      bookingContinue.hidden = true;
      bookingCalendarSummary.textContent = `Tratamiento elegido: ${service}`;
      bookingTitle.textContent = "Elige fecha y hora";
      bookingCalendar.hidden = false;
      agenda.replaceChildren();
      if (!bookingDialog.open) bookingDialog.showModal();
      loadDays();
    }

    bookingTriggers.forEach((trigger) => {
      trigger.addEventListener("click", () => {
        mostrarSelectorTratamientos();
        agenda.replaceChildren();
        if (!bookingDialog.open) bookingDialog.showModal();
      });
    });

    document.querySelectorAll(".treatment-booking-trigger").forEach((trigger) => {
      trigger.addEventListener("click", () => {
        const service = trigger
          .closest(".treatment-card")
          ?.querySelector("h3")
          ?.textContent.trim();

        if (service) abrirAgenda(service);
      });
    });

    bookingOptions.forEach((option) => {
      option.setAttribute("aria-pressed", "false");
      option.addEventListener("click", () => {
        bookingOptions.forEach((item) => {
          const selected = item === option;
          item.classList.toggle("is-selected", selected);
          item.setAttribute("aria-pressed", String(selected));
        });

        bookingContinue.removeAttribute("aria-disabled");
        bookingContinue.dataset.selectedService = option.dataset.bookingService;
        bookingSelection.textContent = `Tratamiento elegido: ${option.dataset.bookingService}`;
      });
    });

    bookingContinue.addEventListener("click", () => {
      const service = bookingContinue.dataset.selectedService;
      if (!service || bookingContinue.getAttribute("aria-disabled") === "true") return;
      abrirAgenda(service);
    });

    bookingBack.addEventListener("click", () => {
      mostrarSelectorTratamientos();
      if (!bookingDialog.open) bookingDialog.showModal();
    });

    bookingDialog.addEventListener("click", (event) => {
      if (event.target === bookingDialog) bookingDialog.close();
    });
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
