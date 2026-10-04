/* ══════════════════════════════════════════════════════════════
   Controle Pré-Moldado — site institucional
   Sem dependências externas: tudo em JS puro pra página carregar rápido.
   ══════════════════════════════════════════════════════════════ */

(function () {
  "use strict";

  var reduz = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ───────────── ano no rodapé ───────────── */
  var ano = document.getElementById("ano");
  if (ano) ano.textContent = new Date().getFullYear();

  /* ───────────── nav: fundo ao rolar + menu mobile ───────────── */
  var nav = document.getElementById("nav");
  var toggle = document.getElementById("navToggle");
  var drawer = document.getElementById("navDrawer");

  function aoRolarNav() {
    if (!nav) return;
    nav.classList.toggle("stuck", window.scrollY > 12);
  }
  aoRolarNav();

  if (toggle && drawer) {
    toggle.addEventListener("click", function () {
      var aberto = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!aberto));
      drawer.hidden = aberto;
      toggle.setAttribute("aria-label", aberto ? "Abrir menu" : "Fechar menu");
    });
    drawer.addEventListener("click", function (e) {
      if (e.target.tagName === "A") {
        toggle.setAttribute("aria-expanded", "false");
        drawer.hidden = true;
      }
    });
  }

  /* ───────────── reveal ao entrar na tela ─────────────
     Além do observer, existe uma varredura de segurança a cada scroll:
     um salto grande (link com âncora, rolagem muito rápida, F5 no meio
     da página) pode não gerar evento de interseção, e sem essa rede o
     bloco ficaria invisível pra sempre. */
  var porRevelar = [].slice.call(document.querySelectorAll(".reveal"));

  function revela(el) {
    el.classList.add("in");
    var i = porRevelar.indexOf(el);
    if (i > -1) porRevelar.splice(i, 1);
  }

  function revelaVisiveis() {
    if (!porRevelar.length) return;
    var limite = window.innerHeight * 0.92;
    porRevelar.slice().forEach(function (el) {
      if (el.getBoundingClientRect().top < limite) revela(el);
    });
  }

  if (reduz || !("IntersectionObserver" in window)) {
    porRevelar.slice().forEach(revela);
  } else {
    var obs = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (ent) {
        if (ent.isIntersecting || ent.boundingClientRect.top < 0) {
          revela(ent.target);
          obs.unobserve(ent.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    porRevelar.forEach(function (el) { obs.observe(el); });
  }

  /* ───────────── rastreio: linha horizontal com os 8 status — uma barra
     verde anda da esquerda pra direita conforme a seção (mais alta que a
     tela) rola por trás do bloco fixo, e o painel troca de etapa quando a
     barra alcança cada nó ───────────── */
  var trilhaRastreio = document.querySelector(".rastreio-track");
  var nosRastreio = document.querySelectorAll(".rt-node");
  var elFillRastreio = document.getElementById("rtFill");
  var elPainelStep = document.getElementById("rtPanelStep");
  var elPainelTitulo = document.getElementById("rtPanelTitle");
  var elPainelDesc = document.getElementById("rtPanelDesc");

  if (trilhaRastreio && nosRastreio.length) {
    var totalNos = nosRastreio.length;
    var ultimoIndiceRastreio = -1;

    function aplicaEtapa(indice) {
      if (indice === ultimoIndiceRastreio) return;
      ultimoIndiceRastreio = indice;
      nosRastreio.forEach(function (el, i) {
        el.classList.toggle("done", i < indice);
        el.classList.toggle("active", i === indice);
      });
      // A barra pula direto pra posição do nó alcançado (não acompanha o
      // scroll contínuo) — é a transição do CSS que faz ela "andar" até lá
      // e acender o ponto, em vez de crescer junto com o dedo na tela.
      if (elFillRastreio) elFillRastreio.style.setProperty("--rt-progress", String(indice / (totalNos - 1)));
      var atual = nosRastreio[indice];
      if (elPainelStep) elPainelStep.textContent = "Etapa " + (indice + 1) + " de " + totalNos;
      if (elPainelTitulo) elPainelTitulo.textContent = atual.getAttribute("data-titulo");
      if (elPainelDesc) elPainelDesc.textContent = atual.getAttribute("data-desc");
    }

    // Celular: a seção não é mais fixada na tela (ver CSS), então não há rolagem pra "dirigir" a
    // animação — as etapas avançam sozinhas, uma por vez, quando a seção aparece na tela.
    var mqCelular = window.matchMedia("(max-width: 860px)");
    var rodouAutoRastreio = false;
    function rodaAutoRastreio() {
      if (rodouAutoRastreio) return;
      rodouAutoRastreio = true;
      var i = 0;
      aplicaEtapa(0);
      var t = setInterval(function () {
        i += 1;
        aplicaEtapa(i);
        if (i >= totalNos - 1) clearInterval(t);
      }, 900);
    }
    if (!reduz && "IntersectionObserver" in window) {
      new IntersectionObserver(function (ents, ob) {
        ents.forEach(function (e) {
          if (e.isIntersecting && mqCelular.matches) { rodaAutoRastreio(); ob.disconnect(); }
        });
      }, { threshold: 0.45 }).observe(trilhaRastreio);
    }

    if (reduz) {
      aplicaEtapa(totalNos - 1);
    } else {
      var atualizandoRastreio = false;
      function atualizaRastreio() {
        atualizandoRastreio = false;
        if (mqCelular.matches) { // no celular quem anima é rodaAutoRastreio()
          if (ultimoIndiceRastreio < 0) aplicaEtapa(0);
          return;
        }
        var rect = trilhaRastreio.getBoundingClientRect();
        var percursoTotal = rect.height - window.innerHeight;
        var progresso = percursoTotal > 0 ? Math.min(1, Math.max(0, -rect.top / percursoTotal)) : 0;
        var indice = Math.min(totalNos - 1, Math.floor(progresso * totalNos));
        aplicaEtapa(indice);
      }
      function agendaRastreio() {
        if (!atualizandoRastreio) {
          atualizandoRastreio = true;
          requestAnimationFrame(atualizaRastreio);
        }
      }
      atualizaRastreio();
      window.addEventListener("scroll", agendaRastreio, { passive: true });
      window.addEventListener("resize", agendaRastreio);
    }
  }

  /* ───────────── carrossel de telas dentro do notebook ───────────── */
  var slides = document.querySelectorAll("#carrossel .slide");
  var botoesSlide = document.querySelectorAll(".cn-btn");

  if (slides.length && botoesSlide.length) {
    var atual = 0;
    var timer = null;
    var TROCA = 5000;

    function mostra(indice) {
      atual = indice;
      slides.forEach(function (s, i) { s.classList.toggle("on", i === indice); });
      botoesSlide.forEach(function (b, i) {
        b.classList.toggle("on", i === indice);
        b.setAttribute("aria-selected", String(i === indice));
      });
    }

    function reagenda() {
      if (reduz) return;
      clearInterval(timer);
      timer = setInterval(function () {
        if (document.visibilityState === "visible") mostra((atual + 1) % slides.length);
      }, TROCA);
    }

    botoesSlide.forEach(function (b) {
      b.addEventListener("click", function () {
        mostra(Number(b.getAttribute("data-slide")));
        reagenda(); // clicar reinicia a contagem, pra não trocar logo em seguida
      });
    });

    reagenda();
  }

  /* ───────────── parallax leve nos prints ───────────── */
  var paras = document.querySelectorAll("[data-parallax]");
  function atualizaParallax() {
    if (reduz) return;
    var vh = window.innerHeight;
    paras.forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.bottom < -200 || r.top > vh + 200) return;
      var fator = parseFloat(el.getAttribute("data-parallax")) || 0.05;
      var centro = r.top + r.height / 2 - vh / 2;
      el.style.transform = "translate3d(0," + (-centro * fator).toFixed(1) + "px,0)";
    });
  }

  /* ───────────── um único listener de scroll ───────────── */
  var agendado = false;
  function aoRolar() {
    if (agendado) return;
    agendado = true;
    requestAnimationFrame(function () {
      aoRolarNav();
      revelaVisiveis();
      atualizaParallax();
      agendado = false;
    });
  }
  window.addEventListener("scroll", aoRolar, { passive: true });
  window.addEventListener("resize", aoRolar);
  atualizaParallax();

  /* ───────────── holofote que segue o mouse nos cards ───────────── */
  if (!reduz && window.matchMedia("(hover: hover)").matches) {
    document.querySelectorAll(".spot").forEach(function (card) {
      card.addEventListener("pointermove", function (e) {
        var r = card.getBoundingClientRect();
        card.style.setProperty("--mx", (e.clientX - r.left) + "px");
        card.style.setProperty("--my", (e.clientY - r.top) + "px");
      });
    });
  }

  /* ───────────── calculadora de plano ─────────────
     Mesma regra da proposta comercial:
       Produção  R$249/mês + R$1,50/m³   (sempre incluso)
       Qualidade R$149/mês + R$1,50/m³   (opcional)
       Comercial R$179/mês fixo          (opcional)
       Anual à vista: -15%                                     */
  var FIXO_PRODUCAO = 249, FIXO_QUALIDADE = 149, POR_M3 = 1.5, COMERCIAL = 179, DESC_ANUAL = 0.15;

  var volume = document.getElementById("volume");
  var volOut = document.getElementById("volOut");
  var mQual = document.getElementById("mQual");
  var mCom = document.getElementById("mCom");
  var anual = document.getElementById("anual");
  var crValue = document.getElementById("crValue");
  var crDetail = document.getElementById("crDetail");

  function moeda(v) {
    return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
  }

  function recalcula() {
    if (!volume) return;
    var m3 = parseInt(volume.value, 10);

    volume.style.setProperty("--fill", (m3 / parseInt(volume.max, 10) * 100) + "%");
    if (volOut) volOut.textContent = m3 + " m³";

    var total = FIXO_PRODUCAO + m3 * POR_M3;
    var modulos = ["Produção"];

    if (mQual && mQual.checked) { total += FIXO_QUALIDADE + m3 * POR_M3; modulos.push("Qualidade"); }
    if (mCom && mCom.checked) { total += COMERCIAL; modulos.push("Comercial"); }

    var comDesconto = anual && anual.checked;
    if (comDesconto) total *= (1 - DESC_ANUAL);

    if (crValue) crValue.textContent = moeda(total);
    if (crDetail) {
      crDetail.textContent = modulos.join(" + ") + " · " + m3 + " m³" +
        (comDesconto ? " · anual à vista" : "");
    }
  }

  [volume, mQual, mCom, anual].forEach(function (el) {
    if (el) el.addEventListener("input", recalcula);
  });
  recalcula();

  /* ───────────── formulário de contato ─────────────
     Não grava nada aqui — só leva pro cadastro do app já com nome, empresa
     e telefone/e-mail preenchidos (ver app/(auth)/login.tsx, useEffect que
     lê ?nome=&empresa=&contato= e decide se contato vai pro campo telefone
     ou e-mail dependendo se tem "@"). */
  /* Endereço do app: em produção, o Vercel; abrindo o site em localhost (teste local), o app
     local na porta 8082 — assim dá pra testar o cadastro com o código que ainda não foi publicado. */
  var APP_PROD = "https://sistema.controlepremoldado.com.br";
  var APP_URL = /^(localhost|127.0.0.1)$/.test(location.hostname) ? "http://localhost:8082" : APP_PROD;
  if (APP_URL !== APP_PROD) {
    document.querySelectorAll('a[href^="' + APP_PROD + '"]').forEach(function (a) {
      a.href = a.href.replace(APP_PROD, APP_URL);
    });
  }

  var form = document.getElementById("leadForm");
  var erro = document.getElementById("formError");

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (erro) erro.hidden = true;

      var nome = form.nome.value.trim();
      var empresa = form.empresa.value.trim();
      var contato = form.contato.value.trim();

      [["nome", nome], ["empresa", empresa], ["contato", contato]].forEach(function (par) {
        form[par[0]].classList.toggle("invalid", !par[1]);
      });

      if (!nome || !empresa || !contato) {
        if (erro) {
          erro.textContent = "Preencha nome, empresa e um contato pra gente continuar seu cadastro.";
          erro.hidden = false;
        }
        return;
      }

      // "Contato" aceita telefone OU e-mail — valida só o formato geral (dígitos suficientes pra
      // parecer telefone, ou tem "@" com algo depois pra parecer e-mail), sem regra rígida demais
      // que rejeite um número/e-mail real por formatação diferente.
      var pareceTelefone = contato.replace(/\D/g, "").length >= 10;
      var pareceEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contato);
      if (!pareceTelefone && !pareceEmail) {
        form.contato.classList.add("invalid");
        if (erro) {
          erro.textContent = "Informe um telefone com DDD ou um e-mail válido em \"Contato\".";
          erro.hidden = false;
        }
        return;
      }

      // "cadastro=1" vai na query string normal (não é dado sensível, só controla a aba). Nome e
      // contato vão no fragmento (depois do #) em vez da query string — o navegador NUNCA manda o
      // fragmento pro servidor (não aparece em log nenhum) e ele também não vai no cabeçalho
      // Referer ao trocar de página, então não vaza pra nenhum script de terceiro que esteja na
      // tela de login. Continua lido pelo app (ver login.tsx) porque o próprio navegador entrega
      // o fragmento pro JavaScript da página de destino. "Empresa" fica de fora: o cadastro do
      // app pede CNPJ primeiro e preenche o nome da empresa sozinho a partir dele.
      var dadosSensiveis = new URLSearchParams({ nome: nome, contato: contato });
      window.location.href = APP_URL + "/login?cadastro=1#" + dadosSensiveis.toString();
    });
  }

  /* ───────────── janela "Falar com a gente" ─────────────
     Manda a mensagem pra Edge Function site-mensagem (guarda no banco e avisa por e-mail).
     Sem JavaScript o link continua levando pra seção #contato. */
  var SUPABASE_URL = "https://cspgbiewlxahnjqehjso.supabase.co";
  var SUPABASE_ANON_KEY = "sb_publishable_pCI6gwGBpDcDvjNQX1ytnA_bFU6IRjX";
  var modal = document.getElementById("msgModal");
  var msgForm = document.getElementById("msgForm");

  if (modal && msgForm) {
    var msgErro = document.getElementById("msgErro");
    var msgEnviar = document.getElementById("msgEnviar");
    var formBox = document.getElementById("msgFormBox");
    var okBox = document.getElementById("msgOk");
    var ultimoFoco = null;

    var abrir = function () {
      ultimoFoco = document.activeElement;
      formBox.hidden = false;
      okBox.hidden = true;
      msgErro.hidden = true;
      modal.hidden = false;
      document.body.classList.add("msg-aberta");
      setTimeout(function () { msgForm.nome.focus(); }, 30);
    };
    var fechar = function () {
      modal.hidden = true;
      document.body.classList.remove("msg-aberta");
      if (ultimoFoco && ultimoFoco.focus) ultimoFoco.focus();
    };

    document.querySelectorAll("[data-abrir-contato]").forEach(function (a) {
      a.addEventListener("click", function (e) { e.preventDefault(); abrir(); });
    });
    modal.querySelectorAll("[data-fechar-contato]").forEach(function (el) {
      el.addEventListener("click", fechar);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !modal.hidden) fechar();
    });

    var mostrarErro = function (texto) { msgErro.textContent = texto; msgErro.hidden = false; };

    msgForm.addEventListener("submit", function (e) {
      e.preventDefault();
      msgErro.hidden = true;
      var nome = msgForm.nome.value.trim();
      var contato = msgForm.contato.value.trim();
      var mensagem = msgForm.mensagem.value.trim();

      [["nome", nome], ["contato", contato], ["mensagem", mensagem]].forEach(function (par) {
        msgForm[par[0]].classList.toggle("invalid", !par[1]);
      });
      if (!nome || !contato || !mensagem) return mostrarErro("Preencha nome, contato e mensagem.");

      var pareceTelefone = contato.replace(/\D/g, "").length >= 10;
      var pareceEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contato);
      if (!pareceTelefone && !pareceEmail) {
        msgForm.contato.classList.add("invalid");
        return mostrarErro("Informe um telefone com DDD ou um e-mail válido.");
      }

      msgEnviar.disabled = true;
      msgEnviar.textContent = "Enviando…";
      fetch(SUPABASE_URL + "/functions/v1/site-mensagem", {
        method: "POST",
        headers: { "Content-Type": "application/json", apikey: SUPABASE_ANON_KEY },
        body: JSON.stringify({ nome: nome, contato: contato, mensagem: mensagem, site: msgForm.site.value }),
      })
        .then(function (r) {
          return r.json().catch(function () { return {}; }).then(function (dados) { return { ok: r.ok, dados: dados }; });
        })
        .then(function (res) {
          if (!res.ok) throw new Error(res.dados && res.dados.erro ? res.dados.erro : "");
          msgForm.reset();
          formBox.hidden = true;
          okBox.hidden = false;
        })
        .catch(function (err) {
          mostrarErro(err && err.message ? err.message : "Não foi possível enviar agora. Tente de novo em instantes ou escreva para contato@controlepremoldado.com.br.");
        })
        .then(function () {
          msgEnviar.disabled = false;
          msgEnviar.textContent = "Enviar mensagem";
        });
    });
  }
})();
