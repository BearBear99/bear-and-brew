const PRODUCTS = [
  { id: "e250", name: "Elements Blend 250g", price: 14.21, cat: "beans", img: "images/products/elements-250.webp" },
  { id: "e500", name: "Elements Blend 500g", price: 17.77, cat: "beans", img: "images/products/elements-500.webp" },
  { id: "e1kg", name: "Elements Blend 1kg", price: 28.46, cat: "beans", img: "images/products/elements-1kg.png" },
  { id: "d250", name: "After Dark 250g", price: 14.21, cat: "beans", img: "images/products/after-dark-250.webp" },
  { id: "d500", name: "After Dark 500g", price: 17.77, cat: "beans", img: "images/products/after-dark-250.webp" },
  { id: "b250", name: "By The Bay 250g", price: 14.21, cat: "beans", img: "images/products/by-the-bay-250.webp" },
  { id: "choc", name: "Drinking Chocolate 1kg", price: 11.36, cat: "chocolate", img: "images/products/drinking-chocolate.webp", sale: true },
  { id: "sample", name: "Sample pack 4 x 250g", price: 28.40, cat: "beans", img: "images/products/sample-pack.webp" },
  { id: "ark", name: "Arkadia Chocolate 1kg", price: 15.35, cat: "chocolate", img: "images/products/arkadia.png" }
];

const KEY = "bearbrew-cart";
const load = () => JSON.parse(localStorage.getItem(KEY) || "[]");
const save = (items) => localStorage.setItem(KEY, JSON.stringify(items));
const money = (n) => "$" + n.toFixed(2);
const count = (items) => items.reduce((n, i) => n + i.qty, 0);
const subtotal = (items) => items.reduce((n, i) => n + i.price * i.qty, 0);

function toast(text) {
  const el = document.querySelector(".toast");
  if (!el) return;
  el.textContent = text;
  el.hidden = false;
  clearTimeout(toast._t);
  toast._t = setTimeout(() => { el.hidden = true; }, 1800);
}

function updateBadge() {
  const n = count(load());
  document.querySelectorAll(".badge").forEach((b) => {
    b.textContent = n;
    b.hidden = n === 0;
  });
}

function renderCart() {
  const list = document.querySelector(".cart-list");
  if (!list) return;
  const items = load();
  list.innerHTML = items.length
    ? items.map((i) => `
      <div class="cart-item">
        <img src="${i.img}" alt="">
        <div>
          <strong>${i.name}</strong>
          <div class="qty">
            <button data-dec="${i.id}">−</button>
            <span>${i.qty}</span>
            <button data-inc="${i.id}">+</button>
          </div>
        </div>
        <div>${money(i.price * i.qty)}</div>
      </div>`).join("")
    : "<p>Your cart is empty.</p>";
  const total = subtotal(items);
  const ship = total === 0 ? 0 : total >= 100 ? 0 : 8;
  document.querySelector(".subtotal").textContent = money(total);
  document.querySelector(".shipping").textContent = ship === 0 ? "Free" : money(ship);
  document.querySelector(".total").textContent = money(total + ship);
  document.querySelector(".ship-note").hidden = total >= 100 || total === 0;
}

function addToCart(id) {
  const product = PRODUCTS.find((p) => p.id === id);
  if (!product) return;
  const items = load();
  const found = items.find((i) => i.id === id);
  if (found) found.qty += 1;
  else items.push({ ...product, qty: 1 });
  save(items);
  updateBadge();
  renderCart();
  toast("Added " + product.name);
}

function changeQty(id, delta) {
  let items = load().map((i) => i.id === id ? { ...i, qty: i.qty + delta } : i).filter((i) => i.qty > 0);
  save(items);
  updateBadge();
  renderCart();
}

function openCart() {
  renderCart();
  document.querySelector(".drawer").hidden = false;
}
function closeCart() { document.querySelector(".drawer").hidden = true; }

function checkout() {
  const items = load();
  if (!items.length) {
    toast("Your cart is empty");
    return;
  }
  const total = document.querySelector(".total").textContent;
  document.querySelector(".order-total").textContent = total;
  document.querySelector(".modal").hidden = false;
}

function confirmDemo() {
  save([]);
  updateBadge();
  renderCart();
  document.querySelector(".modal").hidden = true;
  closeCart();
  toast("Demo order placed. No payment taken.");
}

function renderProducts(filter) {
  const grid = document.querySelector(".products");
  if (!grid) return;
  const list = filter === "all" ? PRODUCTS : PRODUCTS.filter((p) => p.cat === filter);
  document.querySelector(".showing").textContent = "Showing " + list.length + " products";
  grid.innerHTML = list.map((p) => `
    <article class="product">
      ${p.sale ? '<span class="tag">Sale</span>' : ""}
      <img src="${p.img}" alt="${p.name}">
      <h3>${p.name}</h3>
      <div class="row">
        <strong>${money(p.price)}</strong>
        <button class="add" data-add="${p.id}" aria-label="Add ${p.name}">+</button>
      </div>
    </article>`).join("");
}

document.addEventListener("click", (e) => {
  const add = e.target.closest("[data-add]");
  const open = e.target.closest("[data-open-cart]");
  const close = e.target.closest("[data-close-cart]");
  const inc = e.target.closest("[data-inc]");
  const dec = e.target.closest("[data-dec]");
  const cat = e.target.closest("[data-cat]");
  if (add) addToCart(add.dataset.add);
  if (open) openCart();
  if (close) closeCart();
  if (inc) changeQty(inc.dataset.inc, 1);
  if (dec) changeQty(dec.dataset.dec, -1);
  if (e.target.closest("[data-checkout]")) checkout();
  if (e.target.closest("[data-confirm]")) confirmDemo();
  if (e.target.closest("[data-close-modal]")) document.querySelector(".modal").hidden = true;
  if (cat) {
    document.querySelectorAll("[data-cat]").forEach((b) => b.classList.toggle("active", b === cat));
    renderProducts(cat.dataset.cat);
  }
});

document.addEventListener("submit", (e) => {
  if (e.target.matches(".feedback form")) {
    e.preventDefault();
    e.target.reset();
    toast("Thanks. Feedback received.");
  }
});

updateBadge();
renderProducts("all");
renderCart();

const track = document.querySelector("#reviews .carousel-track");
const originals = [...document.querySelectorAll("#reviews .review")];
const dots = document.getElementById("review-dots");
let index = 0;
let timer;
function step() {
  if (!originals.length || !track) return 0;
  return originals[0].getBoundingClientRect().width + 18;
}
function setDots() {
  if (!dots) return;
  [...dots.children].forEach((d, n) => d.classList.toggle("on", n === index % originals.length % 3));
}
function go(i, animate = true) {
  if (!originals.length || !track) return;
  index = i;
  track.style.transition = animate ? "transform 0.7s ease" : "none";
  track.style.transform = `translateX(-${index * step()}px)`;
  setDots();
  if (index >= originals.length) {
    setTimeout(() => go(index - originals.length, false), 720);
  }
}
if (originals.length && dots && track) {
  originals.slice(0, 3).forEach((card) => track.appendChild(card.cloneNode(true)));
  dots.innerHTML = `<button aria-label="Set 1"></button><button aria-label="Set 2"></button><button aria-label="Set 3"></button>`;
  dots.addEventListener("click", (e) => {
    const i = [...dots.children].indexOf(e.target);
    if (i >= 0) go(i);
  });
  go(0, false);
  timer = setInterval(() => go(index + 1), 6000);
  window.addEventListener("resize", () => go(index, false));
}

const lightbox = document.getElementById("lightbox");
const lightboxImg = lightbox?.querySelector("img");
const lightboxClose = lightbox?.querySelector("button");
document.querySelectorAll(".offer-grid img").forEach((img) => {
  img.style.cursor = "zoom-in";
  img.addEventListener("click", () => {
    if (!lightbox || !lightboxImg) return;
    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt || "";
    lightbox.classList.add("open");
  });
});
function openLightbox(src, alt) {
  if (!lightbox || !lightboxImg) return;
  lightboxImg.src = src;
  lightboxImg.alt = alt || "";
  lightbox.classList.add("open");
}
function closeLightbox() {
  lightbox?.classList.remove("open");
}
lightboxClose?.addEventListener("click", (e) => { e.stopPropagation(); closeLightbox(); });
lightbox?.addEventListener("click", closeLightbox);

const stageItems = [
  { title: "Packaging", src: "images/about-carousel/packaging.jpg" },
  { title: "From the kitchen", src: "images/about-carousel/food-spread.jpg" },
  { title: "Butter Croissant", src: "images/about-carousel/croissant.jpg" },
  { title: "The sign", src: "images/about-carousel/sign.jpg" },
  { title: "Takeaway Cup", src: "images/about-carousel/cup-sleeve.jpg" },
  { title: "Latte", src: "images/about-carousel/latte.jpg" }
];
const stageTrack = document.getElementById("stage-track");
const stageTitle = document.getElementById("stage-title");
const stageDots = document.getElementById("about-dots");
if (stageTrack) {
  let stageIndex = 0;
  const n = stageItems.length;
  let busy = false;

  function card(i, center) {
    const item = stageItems[(i + n) % n];
    const el = document.createElement("div");
    el.className = "stage-card" + (center ? " center" : "");
    el.innerHTML = `<img src="${item.src}" alt="${item.title}">`;
    el.querySelector("img").addEventListener("click", () => openLightbox(item.src, item.title));
    return el;
  }
  function render(animate) {
    const prev = (stageIndex - 1 + n) % n;
    const next = (stageIndex + 1) % n;
    stageTrack.style.transition = animate ? "transform 0.55s ease" : "none";
    stageTrack.innerHTML = "";
    stageTrack.append(card(prev, false), card(stageIndex, true), card(next, false));
    stageTitle.textContent = stageItems[stageIndex].title;
    if (stageDots) {
      stageDots.innerHTML = stageItems.map((_, i) => `<button type="button" data-i="${i}" class="${i === stageIndex ? "on" : ""}"></button>`).join("");
    }
  }
  function move(dir) {
    if (busy) return;
    busy = true;
    stageTrack.style.transition = "transform 0.55s ease";
    stageTrack.style.transform = `translateX(${dir > 0 ? -120 : 120}px)`;
    setTimeout(() => {
      stageIndex = (stageIndex + dir + n) % n;
      stageTrack.style.transition = "none";
      stageTrack.style.transform = "translateX(0)";
      render(false);
      busy = false;
    }, 550);
  }
  document.querySelector(".about-nav.prev").addEventListener("click", () => move(-1));
  document.querySelector(".about-nav.next").addEventListener("click", () => move(1));
  if (stageDots) stageDots.addEventListener("click", e => {
    const i = e.target.dataset.i;
    if (i != null && !busy) { stageIndex = +i; render(false); }
  });
  render(false);
  setInterval(() => move(1), 5000);
}
