document.getElementById("year").textContent = new Date().getFullYear();

// Mobile menu toggle
const menuToggle = document.getElementById("menuToggle");
const siteHeader = document.querySelector(".site-header");

menuToggle.addEventListener("click", () => {
  const isOpen = siteHeader.classList.toggle("nav-open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
});

document.querySelectorAll(".nav-mobile a").forEach((link) => {
  link.addEventListener("click", () => {
    siteHeader.classList.remove("nav-open");
    menuToggle.setAttribute("aria-expanded", "false");
  });
});

// Contact form — captura visual por enquanto (sem backend ligado ainda).
// Os dados ficam salvos localmente no navegador (localStorage) até integrarmos
// um envio real (e-mail, WhatsApp ou Supabase). Ver README.md > "Próximos passos".
const contactForm = document.getElementById("contactForm");
const formStatus = document.getElementById("formStatus");
const contactSubmit = document.getElementById("contactSubmit");

contactForm.addEventListener("submit", (event) => {
  event.preventDefault();

  if (!contactForm.checkValidity()) {
    contactForm.reportValidity();
    return;
  }

  const data = Object.fromEntries(new FormData(contactForm).entries());
  data.enviadoEm = new Date().toISOString();

  try {
    const leads = JSON.parse(localStorage.getItem("cpm_leads") || "[]");
    leads.push(data);
    localStorage.setItem("cpm_leads", JSON.stringify(leads));
  } catch (err) {
    // localStorage indisponível — segue sem bloquear o usuário.
  }

  formStatus.textContent = "Recebemos seu contato! Em breve alguém da nossa equipe fala com você.";
  formStatus.className = "form-status success";
  contactSubmit.disabled = true;
  contactForm.reset();

  setTimeout(() => {
    contactSubmit.disabled = false;
  }, 3000);
});
