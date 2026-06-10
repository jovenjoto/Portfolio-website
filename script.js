/* script.js — clean corporate, calm motion */
(function () {
  "use strict";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var yr = document.getElementById("year");
  if (yr) yr.textContent = new Date().getFullYear();

  var header = document.querySelector(".site-header");
  function onScroll() {
    var top = window.scrollY || document.documentElement.scrollTop;
    if (header) header.classList.toggle("scrolled", top > 8);
  }
  window.addEventListener("scroll", function () { requestAnimationFrame(onScroll); }, { passive: true });
  onScroll();

  var items = document.querySelectorAll(".reveal");
  if (items.length && "IntersectionObserver" in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
    }, { threshold: 0.14 });
    items.forEach(function (el) { io.observe(el); });
  } else { items.forEach(function (el) { el.classList.add("in"); }); }

  var nums = document.querySelectorAll(".stat-num[data-target]");
  if (nums.length && "IntersectionObserver" in window) {
    var no = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target; no.unobserve(el);
        var t = parseFloat(el.dataset.target);
        var dec = parseInt(el.dataset.decimals || "0", 10);
        var pre = el.dataset.prefix || "", suf = el.dataset.suffix || "";
        if (reduce) { el.textContent = pre + t.toFixed(dec) + suf; return; }
        var dur = 1400, s = performance.now();
        (function tick(now) {
          var p = Math.min((now - s) / dur, 1);
          var e = 1 - Math.pow(1 - p, 3);
          el.textContent = pre + (t * e).toFixed(dec) + suf;
          if (p < 1) requestAnimationFrame(tick);
          else el.textContent = pre + t.toFixed(dec) + suf;
        })(s);
      });
    }, { threshold: 0.5 });
    nums.forEach(function (n) { no.observe(n); });
  }

  document.querySelectorAll(".ticker-track").forEach(function (t) { t.innerHTML += t.innerHTML; });

  var form = document.getElementById("contact-form");
  if (form) {
    var status = document.getElementById("form-status");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var btn = form.querySelector("button[type=submit]");
      var label = btn.textContent;
      btn.disabled = true; btn.textContent = "Sending…";
      status.className = "form-status"; status.textContent = "";
      fetch(form.action, { method: "POST", body: new FormData(form), headers: { "Accept": "application/json" } })
        .then(function (res) {
          if (res.ok) {
            form.reset();
            status.className = "form-status ok";
            status.textContent = "Thanks — your message has been sent. I’ll be in touch soon.";
          } else {
            return res.json().then(function (d) {
              status.className = "form-status err";
              status.textContent = (d.errors && d.errors.map(function (x) { return x.message; }).join(", ")) ||
                "Something went wrong. Please email me directly instead.";
            });
          }
        })
        .catch(function () {
          status.className = "form-status err";
          status.textContent = "Network error — please try again, or email me directly.";
        })
        .finally(function () { btn.disabled = false; btn.textContent = label; });
    });
  }
})();
