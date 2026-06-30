/* Two Riders — minimal dependency-free lightbox.
   Opens any <a class="lightbox" href="full.jpg" data-caption="…">,
   grouped by the nearest .gallery / .album-gallery container.
   The caption + nav lockup is sized in JS to the rendered image width. */
(function () {
  "use strict";

  var links = Array.prototype.slice.call(document.querySelectorAll("a.lightbox"));
  if (!links.length) return;

  function groupOf(link) { return link.closest(".gallery, .album-gallery") || document.body; }

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
  overlay.hidden = true;
  overlay.innerHTML =
    '<figure class="lb-figure">' +
      '<img alt="">' +
      '<figcaption class="lb-meta">' +
        '<p class="lb-caption">' +
          '<span class="lb-cap-text"></span>' +
          '<span class="lb-counter" aria-hidden="true"></span>' +
        "</p>" +
        '<nav class="lb-controls" aria-label="Gallery">' +
          '<button class="lb-prev" type="button" title="Previous (←)">Previous</button>' +
          '<button class="lb-next" type="button" title="Next (→)">Next</button>' +
          '<button class="lb-close" type="button" title="Close (Esc)">Close</button>' +
        "</nav>" +
      "</figcaption>" +
    "</figure>";
  document.body.appendChild(overlay);

  var imgEl = overlay.querySelector("img");
  var metaEl = overlay.querySelector(".lb-meta");
  var capEl = overlay.querySelector(".lb-caption");
  var capTextEl = overlay.querySelector(".lb-cap-text");
  var counterEl = overlay.querySelector(".lb-counter");
  var prevBtn = overlay.querySelector(".lb-prev");
  var nextBtn = overlay.querySelector(".lb-next");
  var current = [];
  var index = 0;
  var lastFocus = null;

  function preload(src) { var i = new Image(); i.src = src; }

  /* Bind the caption/nav lockup to the image's rendered width. */
  function fitMeta() {
    var w = imgEl.getBoundingClientRect().width;
    if (w > 0) metaEl.style.width = Math.round(w) + "px";
  }

  function show(i) {
    index = (i + current.length) % current.length;
    var link = current[index];
    var cap = link.getAttribute("data-caption") || "";
    imgEl.src = link.getAttribute("href");
    imgEl.alt = cap;

    var multi = current.length > 1;
    capTextEl.textContent = cap;
    counterEl.textContent = multi ? "(" + (index + 1) + " of " + current.length + ")" : "";
    counterEl.style.marginLeft = (cap && multi) ? "0.35em" : "0";
    capEl.style.display = (cap || multi) ? "" : "none";
    prevBtn.style.display = nextBtn.style.display = multi ? "" : "none";

    if (multi) {
      preload(current[(index + 1) % current.length].getAttribute("href"));
      preload(current[(index - 1 + current.length) % current.length].getAttribute("href"));
    }
    if (imgEl.complete) requestAnimationFrame(fitMeta);
  }

  function open(link) {
    lastFocus = document.activeElement;
    current = groups.get(groupOf(link)) || [link];
    overlay.hidden = false;
    show(current.indexOf(link));
    requestAnimationFrame(function () { overlay.classList.add("is-open"); fitMeta(); });
    document.documentElement.style.overflow = "hidden";
    overlay.querySelector(".lb-close").focus();
  }
  function close() {
    overlay.classList.remove("is-open");
    document.documentElement.style.overflow = "";
    imgEl.src = "";
    setTimeout(function () { overlay.hidden = true; }, 250);
    if (lastFocus) lastFocus.focus();
  }

  links.forEach(function (link) {
    link.addEventListener("click", function (e) { e.preventDefault(); open(link); });
  });

  imgEl.addEventListener("load", fitMeta);
  window.addEventListener("resize", fitMeta);

  overlay.querySelector(".lb-close").addEventListener("click", function (e) { e.stopPropagation(); close(); });
  prevBtn.addEventListener("click", function (e) { e.stopPropagation(); show(index - 1); });
  nextBtn.addEventListener("click", function (e) { e.stopPropagation(); show(index + 1); });
  overlay.querySelector(".lb-figure").addEventListener("click", function (e) { e.stopPropagation(); });
  overlay.addEventListener("click", close);

  document.addEventListener("keydown", function (e) {
    if (overlay.hidden) return;
    if (e.key === "Escape") close();
    else if (e.key === "ArrowRight") show(index + 1);
    else if (e.key === "ArrowLeft") show(index - 1);
  });
})();
