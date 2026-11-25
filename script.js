// Cuenta regresiva (hora Argentina) — sábado 23 de enero de 2027, 20:30
(function () {
  var EVENT_DATE = new Date(document.body.getAttribute("data-event-date")).getTime();
  var els = {};
  ["days", "hours", "minutes", "seconds"].forEach(function (unit) {
    els[unit] = document.querySelector('[data-unit="' + unit + '"]');
  });
  function pad(n) { return String(n).padStart(2, "0"); }
  function set(el, value) { if (el.textContent !== value) el.textContent = value; }
  function tick() {
    var s = Math.floor(Math.max(0, EVENT_DATE - Date.now()) / 1000);
    set(els.days, pad(Math.floor(s / 86400)));
    set(els.hours, pad(Math.floor((s % 86400) / 3600)));
    set(els.minutes, pad(Math.floor((s % 3600) / 60)));
    set(els.seconds, pad(s % 60));
  }
  tick();
  setInterval(tick, 1000);
})();

// Agregar al calendario: Google Calendar (en iPhone/Mac, archivo .ics para el calendario del equipo)
(function () {
  var EVENT = {
    title: "Mis XV · Camila",
    start: "20270123T233000Z", // 20:30 hs Argentina
    end: "20270124T090000Z",   // 06:00 hs Argentina
    location: "TRAPEMN, Butaco",
    details: "¡Te espero para celebrar mis XV! Ubicación: https://maps.app.goo.gl/Nr65C8xhVBESsyG17"
  };
  var btn = document.querySelector("[data-calendar]");
  if (!btn) return;
  btn.href = "https://calendar.google.com/calendar/render?action=TEMPLATE" +
    "&text=" + encodeURIComponent(EVENT.title) +
    "&dates=" + EVENT.start + "/" + EVENT.end +
    "&location=" + encodeURIComponent(EVENT.location) +
    "&details=" + encodeURIComponent(EVENT.details) +
    "&ctz=America/Argentina/Buenos_Aires";
  var apple = /iPhone|iPad|iPod|Macintosh/.test(navigator.userAgent);
  if (!apple) return;
  btn.addEventListener("click", function (e) {
    e.preventDefault();
    var esc = function (s) { return s.replace(/([,;\\])/g, "\\$1"); };
    var ics = [
      "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//BloomDate//XV Camila//ES", "BEGIN:VEVENT",
      "UID:xv-camila-20270123@bloomdate", "DTSTAMP:20261125T000000Z",
      "DTSTART:" + EVENT.start, "DTEND:" + EVENT.end,
      "SUMMARY:" + esc(EVENT.title), "LOCATION:" + esc(EVENT.location), "DESCRIPTION:" + esc(EVENT.details),
      "BEGIN:VALARM", "TRIGGER:-P1D", "ACTION:DISPLAY", "DESCRIPTION:Mañana son los XV de Camila", "END:VALARM",
      "END:VEVENT", "END:VCALENDAR"
    ].join("\r\n");
    var url = URL.createObjectURL(new Blob([ics], { type: "text/calendar;charset=utf-8" }));
    var a = document.createElement("a");
    a.href = url;
    a.download = "xv-camila.ics";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
  });
})();

// Ráfaga de brillitos (en % del contenedor)
var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
function sparkBurst(container, x, y, count) {
  if (reduceMotion) return;
  for (var i = 0; i < (count || 14); i++) {
    var s = document.createElement("i");
    s.className = "spark";
    s.setAttribute("aria-hidden", "true");
    var a = Math.random() * Math.PI * 2, d = 10 + Math.random() * 16;
    s.style.left = x + "%";
    s.style.top = y + "%";
    s.style.setProperty("--dx", (Math.cos(a) * d).toFixed(1) + "cqi");
    s.style.setProperty("--dy", (Math.sin(a) * d - 4).toFixed(1) + "cqi");
    s.style.setProperty("--s", (0.6 + Math.random() * 0.8).toFixed(2));
    s.style.animationDelay = (Math.random() * 0.15).toFixed(2) + "s";
    if (i % 3 === 0) s.classList.add("spark--pearl");
    container.appendChild(s);
    setTimeout(function (el) { el.remove(); }.bind(null, s), 1500);
  }
}

// Copiar al portapapeles con aviso
function copyText(text, toast, message) {
  function show(msg) {
    toast.textContent = msg;
    toast.classList.add("is-visible");
    clearTimeout(toast._t);
    toast._t = setTimeout(function () { toast.classList.remove("is-visible"); }, 2200);
  }
  function fallback() {
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    (toast.closest("dialog") || document.body).appendChild(ta);
    ta.select();
    try { document.execCommand("copy"); show(message); } catch (_e) { show("No se pudo copiar"); }
    ta.remove();
  }
  if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(text).then(function () { show(message); }, fallback);
  else fallback();
}

// Modal de transferencia: se abre tocando la perla del sobre; se cierra con la X o tocando fuera
(function () {
  var modal = document.querySelector(".gift-modal");
  var card = modal.getAttribute("data-card").split(",").map(Number); // x1,y1,x2,y2 en %
  var stage = modal.querySelector(".img-modal__stage");
  document.querySelector("[data-open-gifts]").addEventListener("click", function () {
    var panel = document.querySelector(".panel--gifts");
    sparkBurst(panel, 49.95, 67, 16);
    setTimeout(function () {
      modal.showModal();
      var p = modal.getAttribute("data-burst").split(",").map(Number);
      setTimeout(function () { sparkBurst(stage, p[0], p[1], 18); }, 380);
    }, reduceMotion ? 0 : 350);
  });
  modal.querySelectorAll("[data-close]").forEach(function (b) {
    b.addEventListener("click", function () { modal.close(); });
  });
  modal.addEventListener("click", function (e) {
    if (e.target.closest(".img-modal__hit")) return;
    var r = stage.getBoundingClientRect();
    var x = (e.clientX - r.left) / r.width * 100, y = (e.clientY - r.top) / r.height * 100;
    if (x < card[0] || x > card[2] || y < card[1] || y > card[3]) modal.close();
  });
  modal.querySelectorAll("[data-copy]").forEach(function (b) {
    b.addEventListener("click", function () {
      copyText(b.getAttribute("data-copy"), modal.querySelector(".toast"), b.getAttribute("data-msg"));
    });
  });
})();

// Bloomkeep: la cámara saca una foto al aparecer y cada tantos segundos mientras se ve
(function () {
  var cam = document.querySelector(".panel--camera");
  if (!cam || reduceMotion) return;
  var visible = false, timer = 0;
  function shoot() {
    cam.classList.remove("is-shooting");
    void cam.offsetWidth;
    cam.classList.add("is-shooting");
  }
  function cycle() {
    clearTimeout(timer);
    if (!visible || document.hidden) return;
    shoot();
    timer = setTimeout(cycle, 4200 + Math.random() * 1800);
  }
  cam.addEventListener("animationend", function (e) { if (e.animationName === "flash-light") cam.classList.remove("is-shooting"); });
  cam.addEventListener("click", function (e) {
    var r = cam.getBoundingClientRect();
    if ((e.clientY - r.top) / r.height > 0.45 && !e.target.closest(".hotspot")) shoot();
  });
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        var was = visible;
        visible = e.isIntersecting;
        if (visible && !was) timer = setTimeout(cycle, 700);
        if (!visible) clearTimeout(timer);
      });
    }, { threshold: 0.45 }).observe(cam);
  }
  document.addEventListener("visibilitychange", function () { if (!document.hidden && visible) cycle(); });
})();

// Intro + música + apariciones
(function () {
  var intro = document.querySelector(".intro");
  var audio = document.getElementById("backgroundMusic");
  var toggle = document.querySelector(".audio-toggle");
  var musicPanel = document.querySelector(".panel--music");
  var wantsMusic = false;

  function setPlaying(on) {
    toggle.classList.toggle("is-playing", on);
    toggle.setAttribute("aria-pressed", String(on));
    toggle.setAttribute("aria-label", on ? "Pausar música" : "Reproducir música");
    if (musicPanel) musicPanel.classList.toggle("is-playing", on);
  }
  function play() {
    var p = audio.play();
    if (p && p.then) p.then(function () { setPlaying(true); }, function () { setPlaying(false); });
    else setPlaying(true);
  }
  function enter(withMusic) {
    if (intro.classList.contains("is-leaving")) return;
    wantsMusic = withMusic;
    if (withMusic) play(); // dentro del toque: los celulares lo permiten
    window.scrollTo(0, 0);
    intro.classList.add("is-leaving");
    setTimeout(function () { document.body.classList.remove("intro-open"); }, 300);
    setTimeout(function () { intro.classList.add("is-gone"); }, 1100);
  }
  intro.querySelector("[data-enter-with-music]").addEventListener("click", function () { enter(true); });
  intro.querySelector("[data-enter-without-music]").addEventListener("click", function () { enter(false); });

  document.querySelectorAll("[data-toggle-music]").forEach(function (b) {
    b.addEventListener("click", function () { toggle.click(); });
  });

  toggle.addEventListener("click", function () {
    if (audio.paused) { wantsMusic = true; play(); }
    else { wantsMusic = false; audio.pause(); setPlaying(false); }
  });
  audio.addEventListener("pause", function () { setPlaying(false); });
  document.addEventListener("visibilitychange", function () {
    if (document.hidden) { if (!audio.paused) audio.pause(); }
    else if (wantsMusic) { play(); }
  });

  if (!reduceMotion && "IntersectionObserver" in window) {
    document.documentElement.classList.add("js-reveal");
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("is-revealed"); io.unobserve(e.target); }
      });
    }, { threshold: 0.35 });
    document.querySelectorAll(".guests, .countdown").forEach(function (el) {
      io.observe(el.classList.contains("countdown") ? el.parentElement : el);
    });
    document.querySelectorAll(".countdown strong").forEach(function (el) {
      new MutationObserver(function () {
        el.classList.remove("flick");
        void el.offsetWidth;
        el.classList.add("flick");
      }).observe(el, { childList: true, characterData: true, subtree: true });
    });
  }
})();
