/* Persists theme/font/mode across pages via localStorage.
   Runs before paint to avoid FOUC. */
(function () {
  try {
    var palette = localStorage.getItem("jk.palette") || "cream-bronze";
    var mode    = localStorage.getItem("jk.mode")    || "light";
    var fonts   = localStorage.getItem("jk.fonts")   || "source";
    var research = localStorage.getItem("jk.research") || "default";
    var root = document.documentElement;
    if (palette !== "cream-bronze") root.setAttribute("data-palette", palette);
    if (mode === "dark") root.setAttribute("data-mode", "dark");
    if (fonts !== "source") root.setAttribute("data-fonts", fonts);
    root.setAttribute("data-research", research);
  } catch (e) {}
})();

document.addEventListener("DOMContentLoaded", function () {
  var t = document.getElementById("menu-toggle");
  var n = document.getElementById("navbar");
  if (t && n) {
    if (!t.querySelector(".bars")) {
      t.textContent = "";
      var bars = document.createElement("span");
      bars.className = "bars";
      t.appendChild(bars);
    }
    t.setAttribute("aria-expanded", "false");

    // Inject scrim once
    var scrim = document.createElement("div");
    scrim.className = "nav-scrim";
    document.body.appendChild(scrim);

    // Inject "Menu" label + close button into the drawer
    if (!n.querySelector(".nav-label")) {
      var label = document.createElement("div");
      label.className = "nav-label";
      label.textContent = "Menu";
      n.insertBefore(label, n.firstChild);
    }
    if (!n.querySelector(".nav-close")) {
      var close = document.createElement("button");
      close.className = "nav-close";
      close.setAttribute("aria-label", "Close menu");
      close.innerHTML = "&times;";
      n.insertBefore(close, n.firstChild);
      close.addEventListener("click", function () { setOpen(false); });
    }

    function setOpen(open) {
      n.classList.toggle("show", open);
      scrim.classList.toggle("show", open);
      t.setAttribute("aria-expanded", open ? "true" : "false");
      document.body.classList.toggle("nav-open", open);
    }

    t.addEventListener("click", function () {
      setOpen(!n.classList.contains("show"));
    });
    scrim.addEventListener("click", function () { setOpen(false); });

    // Close drawer when a link is tapped
    n.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () { setOpen(false); });
    });
    // Close on Escape
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && n.classList.contains("show")) setOpen(false);
    });
  }

  // Mark current page in nav
  var path = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll("nav.primary a").forEach(function (a) {
    var href = a.getAttribute("href");
    if (href === path) a.setAttribute("aria-current", "page");
  });
});
