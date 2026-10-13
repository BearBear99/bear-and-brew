const lightbox = document.getElementById("lightbox");
const lightboxImg = lightbox?.querySelector("img");
const lightboxClose = lightbox?.querySelector("button");
document.querySelectorAll("img").forEach((img) => {
  img.style.cursor = "zoom-in";
  img.addEventListener("click", () => {
    if (!lightbox || !lightboxImg) return;
    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt || "";
    lightbox.classList.add("open");
  });
});
function closeLightbox() {
  lightbox?.classList.remove("open");
}
lightboxClose?.addEventListener("click", (e) => { e.stopPropagation(); closeLightbox(); });
lightbox?.addEventListener("click", closeLightbox);