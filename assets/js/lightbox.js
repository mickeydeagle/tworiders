/* Two Riders — minimal dependency-free lightbox.
   Opens any <a class="lightbox" href="full.jpg" data-caption="…">.
   Groups by the nearest .gallery / .album-gallery container.
   Click backdrop or Esc to close; arrow keys or side zones to navigate. */
(function () {
  "use strict";

  var links = Array.prototype.slice.call(document.querySelectorAll("a.lightbox"));
  if (!links.length) return;

  function groupOf(link) {
    return link.closest(".gallery, .album-gallery") || document.body;
  }

  var groups = new Map();
  links.forEach(function (link) {
    var g = groupOf(link);
    if (!groups.has(g)) groups.set(g, []);
    groups.get(g).push(link);
  });

  var overlay = document.createElement("div");
  overlay.className = "lb-overlay";
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-modal", "true");
  overlay.innerHTML =
    '<button class="lb-prev" type="button" aria-label="Previous">‹</button>' +
    '<figure class="lb-figure"><img alt=""><figcaption class="lb-caption"></figcaption></figure>' +
    '<div class="lb-counter" aria-hidden="true"></div>' +
    '<button class="lb-next" type="button" aria-label="Next">›</button>';
  document.body.appendChild(overlay);

  var imgEl = overlay.querySelector("img");
  var capEl = overlay.querySelector(".lb-caption");
  var countEl = overlay.querySelector(".lb-counter");
  var current = [];
  var index = 0;

  function preload(src) { var i = new Image(); i.src = src; }

  function show(i) {
    index = (i + current.length) % current.length;
    var link = current[index];
    imgEl.src = link.getAttribute("href");
    imgEl.alt = link.getAttribute("data-caption") || "";
    var cap = link.getAttribute("data-caption") || "";
    capEl.textContent = cap;
    capEl.style.display = cap ? "" : "none";
    countEl.textContent = current.length > 1 ? index + 1 + " / " + current.length : "";
    if (current.length > 1) {
      preload(current[(index + 1) % current.length].getAttribute("href"));
      preload(current[(index - 1 + current.length) % current.length].getAttribute("href"));
    }
  }

  function open(link) {
    current = groups.get(groupOf(link)) || [link];
    show(current.indexOf(link));
    overlay.classList.add("is-open");
    document.documentElement.style.overflow = "hidden";
  }
  function close() {
    overlay.classList.remove("is-open");
    document.documentElement.style.overflow = "";
    imgEl.src = "";
  }

  links.forEach(function (link) {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      open(link);
    });
  });

  overlay.querySelector(".lb-figure").addEventListener("click", function (e) {
    e.stopPropagation();
  });
  overlay.querySelector(".lb-next").addEventListener("click", function (e) {
    e.stopPropagation();
    show(index + 1);
  });
  overlay.querySelector(".lb-prev").addEventListener("click", function (e) {
    e.stopPropagation();
    show(index - 1);
  });
  overlay.addEventListener("click", close);

  document.addEventListener("keydown", function (e) {
    if (!overlay.classList.contains("is-open")) return;
    if (e.key === "Escape") close();
    else if (e.key === "ArrowRight") show(index + 1);
    else if (e.key === "ArrowLeft") show(index - 1);
  });
})();
