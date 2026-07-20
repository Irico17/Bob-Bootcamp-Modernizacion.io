(() => {
  document.querySelectorAll(".prewrap").forEach((box) => {
    if (box.querySelector(".copy")) return;
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "copy";
    btn.textContent = "Copiar";
    btn.addEventListener("click", async () => {
      const pre = box.querySelector("pre");
      try {
        await navigator.clipboard.writeText(pre.innerText);
        btn.textContent = "Copiado";
        setTimeout(() => (btn.textContent = "Copiar"), 1400);
      } catch {
        btn.textContent = "Error";
        setTimeout(() => (btn.textContent = "Copiar"), 1400);
      }
    });
    box.style.position = "relative";
    box.appendChild(btn);
  });
})();
