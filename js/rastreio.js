/* ══════════════════════════════════════════════════════════════
   Controle Pré-Moldado — site institucional
   Rastreio de visita: 1 registro por carregamento de página, sem cookie
   de terceiro nem formulário nenhum — só conta acesso e de onde veio
   (cidade aproximada por IP, resolvida no navegador de quem acessa).
   Mesma ideia já usada no link público de cliente do app (ver
   controle-pre-moldado/src/lib/rastreioLinkPublico.ts), reaproveitada
   aqui em JS puro porque este site não tem o app nem build nenhum.
   ══════════════════════════════════════════════════════════════ */

(function () {
  "use strict";

  var SUPABASE_URL = "https://cspgbiewlxahnjqehjso.supabase.co";
  // Chave pública ("publishable"), feita pra ir embarcada em código que roda no navegador do
  // visitante — o que protege os dados não é escondê-la, é a RLS no banco (ver migração
  // 20260922150000_rastreio_site_institucional.sql: a tabela nem tem policy de leitura).
  var SUPABASE_ANON_KEY = "sb_publishable_pCI6gwGBpDcDvjNQX1ytnA_bFU6IRjX";

  var CHAVE_DISPOSITIVO_ID = "cpm_site_dispositivo_id";

  function obterDispositivoId() {
    try {
      var existente = localStorage.getItem(CHAVE_DISPOSITIVO_ID);
      if (existente) return existente;
      var novo = crypto.randomUUID();
      localStorage.setItem(CHAVE_DISPOSITIVO_ID, novo);
      return novo;
    } catch (e) {
      return null;
    }
  }

  // Mesma lógica de controle-pre-moldado/src/lib/deviceDetection.ts, copiada em JS puro (este
  // site não importa nada do app).
  function detectarDispositivo(userAgent) {
    var ehTablet = /iPad/i.test(userAgent) || (/Android/i.test(userAgent) && !/Mobile/i.test(userAgent));
    var ehCelular = !ehTablet && /Mobile|iPhone|Android/i.test(userAgent);
    var tipo = ehTablet ? "tablet" : ehCelular ? "celular" : "computador";

    var sistema = "Outro";
    if (/iPhone|iPad|iPod/i.test(userAgent)) sistema = "iOS";
    else if (/Android/i.test(userAgent)) sistema = "Android";
    else if (/Windows/i.test(userAgent)) sistema = "Windows";
    else if (/Mac OS X/i.test(userAgent)) sistema = "macOS";
    else if (/Linux/i.test(userAgent)) sistema = "Linux";

    var navegador = "Outro";
    if (/WhatsApp/i.test(userAgent)) navegador = "WhatsApp";
    else if (/Instagram/i.test(userAgent)) navegador = "Instagram";
    else if (/FBAN|FBAV/i.test(userAgent)) navegador = "Facebook";
    else if (/EdgA|EdgiOS|Edg\//i.test(userAgent)) navegador = "Edge";
    else if (/Chrome/i.test(userAgent) && !/Chromium/i.test(userAgent)) navegador = "Chrome";
    else if (/Firefox/i.test(userAgent)) navegador = "Firefox";
    else if (/Safari/i.test(userAgent) && !/Chrome/i.test(userAgent)) navegador = "Safari";

    return { tipo: tipo, sistema: sistema, navegador: navegador };
  }

  // Cidade aproximada pelo IP de quem acessa, resolvida no PRÓPRIO navegador do visitante (o
  // serviço externo vê o IP dele, não o nosso). Nunca atrasa nem quebra a página: 2.5s de prazo,
  // qualquer falha devolve tudo em branco.
  function obterLocalizacaoAproximada() {
    return new Promise(function (resolve) {
      var vazio = { cidade: null, regiao: null, pais: null };
      var controlador = new AbortController();
      var tempoLimite = setTimeout(function () {
        controlador.abort();
        resolve(vazio);
      }, 2500);

      fetch("https://ipapi.co/json/", { signal: controlador.signal })
        .then(function (resposta) {
          clearTimeout(tempoLimite);
          if (!resposta.ok) return resolve(vazio);
          return resposta.json().then(function (dados) {
            resolve({
              cidade: typeof dados.city === "string" ? dados.city : null,
              regiao: typeof dados.region === "string" ? dados.region : null,
              pais: typeof dados.country_name === "string" ? dados.country_name : null,
            });
          });
        })
        .catch(function () {
          clearTimeout(tempoLimite);
          resolve(vazio);
        });
    });
  }

  var dispositivoId = obterDispositivoId();
  if (!dispositivoId) return;

  var info = detectarDispositivo(navigator.userAgent || "");

  obterLocalizacaoAproximada().then(function (loc) {
    fetch(SUPABASE_URL + "/rest/v1/rpc/registrar_acesso_site_institucional", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: SUPABASE_ANON_KEY,
        Authorization: "Bearer " + SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({
        p_dispositivo_id: dispositivoId,
        p_pagina: window.location.pathname + window.location.hash,
        p_dispositivo_tipo: info.tipo,
        p_sistema: info.sistema,
        p_navegador: info.navegador,
        p_referrer: document.referrer || null,
        p_cidade: loc.cidade,
        p_regiao: loc.regiao,
        p_pais: loc.pais,
      }),
    }).catch(function () {
      // Silencioso de propósito — rastreio nunca deve atrapalhar a navegação de quem acessa.
    });
  });
})();
