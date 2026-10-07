/* ═══════════════════════════════════════════════════════════
   Controle Pré-Moldado — site institucional
   Aviso de cookies + medição do Google Ads.

   O que mede (só se o visitante clicar em "Aceitar"):
     • Conversão principal: clicar em qualquer "Testar agora" / "Começar com 14 dias grátis"
       (links pra /login?cadastro=1) ou enviar o formulário "Falar com a gente" que leva
       pro cadastro do app.
     • Secundário (só informativo): clicar no WhatsApp.
   NÃO mede: cliques em "Entrar" (quem já é cliente), nem o que a pessoa digita nos formulários.

   Sem GOOGLE_ADS_ID preenchido, este arquivo não faz nada: não mostra aviso e não carrega o
   Google. Quem recusa também não é medido.
   ═══════════════════════════════════════════════════════════ */

(function () {
  "use strict";

  /* Preencher depois de criar a conversão no Google Ads:
       GOOGLE_ADS_ID      → "AW-XXXXXXXXX"
       GOOGLE_ADS_ROTULO  → o rótulo da conversão "Testar o app" (ex: "AbC-D_efG-h12_34-567") */
  var GOOGLE_ADS_ID = "AW-458501349";
  var GOOGLE_ADS_ROTULO = "PSE4CJeu4JQdEOXZ0NoB";

  if (!GOOGLE_ADS_ID) return;

  var CHAVE = "cpm_cookies_consentimento"; // "aceito" | "recusado"

  function lerEscolha() {
    try { return localStorage.getItem(CHAVE); } catch (e) { return null; }
  }
  function guardarEscolha(valor) {
    try { localStorage.setItem(CHAVE, valor); } catch (e) { /* sem armazenamento: pergunta de novo na próxima */ }
  }

  /* ───────────── Google (só depois de aceitar) ───────────── */
  var carregado = false;
  function carregarGoogle() {
    if (carregado) return;
    carregado = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag("js", new Date());
    window.gtag("config", GOOGLE_ADS_ID);
    var s = document.createElement("script");
    s.async = true;
    s.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(GOOGLE_ADS_ID);
    document.head.appendChild(s);
    ligarEventos();
  }

  function conversaoTestar() {
    if (!window.gtag) return;
    if (GOOGLE_ADS_ROTULO) {
      window.gtag("event", "conversion", { send_to: GOOGLE_ADS_ID + "/" + GOOGLE_ADS_ROTULO, transport_type: "beacon" });
    } else {
      window.gtag("event", "testar_app", { transport_type: "beacon" });
    }
  }

  var eventosLigados = false;
  function ligarEventos() {
    if (eventosLigados) return;
    eventosLigados = true;

    document.addEventListener("click", function (e) {
      var a = e.target && e.target.closest ? e.target.closest("a[href]") : null;
      if (!a) return;
      var href = a.getAttribute("href") || "";
      if (/\/login\?cadastro=1/.test(href)) conversaoTestar();
      else if (/wa\.me\//.test(href) && window.gtag) window.gtag("event", "whatsapp_click", { transport_type: "beacon" });
    }, true);

    // O formulário "Falar com a gente" valida e leva direto pro cadastro (ver main.js) — conta como
    // "testar o app" só quando os campos estão preenchidos, igual ao que main.js exige.
    var form = document.getElementById("leadForm");
    if (form) {
      form.addEventListener("submit", function () {
        if (form.nome.value.trim() && form.empresa.value.trim() && form.contato.value.trim()) conversaoTestar();
      }, true);
    }
  }

  /* ───────────── aviso ───────────── */
  var aviso = null;
  function fecharAviso() {
    if (aviso && aviso.parentNode) aviso.parentNode.removeChild(aviso);
    aviso = null;
  }
  function escolher(valor) {
    guardarEscolha(valor);
    fecharAviso();
    if (valor === "aceito") carregarGoogle();
  }
  function mostrarAviso() {
    if (aviso) return;
    aviso = document.createElement("div");
    aviso.className = "cookie-aviso";
    aviso.setAttribute("role", "dialog");
    aviso.setAttribute("aria-label", "Aviso de cookies");
    aviso.innerHTML =
      '<p>Usamos cookies do Google para medir se nossos anúncios estão funcionando. ' +
      'Só ativamos se você aceitar. <a href="privacidade.html#cookies">Saiba mais</a></p>' +
      '<div class="cookie-aviso-acoes">' +
      '<button type="button" class="btn btn-outline btn-sm" data-cookies="recusado">Recusar</button>' +
      '<button type="button" class="btn btn-primary btn-sm" data-cookies="aceito">Aceitar</button>' +
      "</div>";
    aviso.addEventListener("click", function (e) {
      var b = e.target.closest ? e.target.closest("[data-cookies]") : null;
      if (b) escolher(b.getAttribute("data-cookies"));
    });
    document.body.appendChild(aviso);
  }

  /* Links "Preferências de cookies" (rodapé) reabrem o aviso pra mudar de ideia. */
  document.addEventListener("click", function (e) {
    var l = e.target.closest ? e.target.closest("[data-cookies-preferencias]") : null;
    if (!l) return;
    e.preventDefault();
    mostrarAviso();
  });

  var escolha = lerEscolha();
  if (escolha === "aceito") carregarGoogle();
  else if (!escolha) mostrarAviso();
})();
