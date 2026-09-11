# Site institucional — Controle Pré-Moldado

Landing page de captação de clientes para o app **Controle Pré-Moldado**.
Site estático (HTML/CSS/JS puro, sem build), pronto pra publicar no domínio
`www.controlepremoldado.com.br`.

## Estrutura

```
site-institucional/
  index.html      página única (hero, funcionalidades, como funciona, planos, contato)
  css/style.css    estilos (paleta navy + verde, igual ao app)
  js/main.js       menu mobile, form de contato
  assets/          favicon
```

## Rodar localmente

Não precisa de build. Abra `index.html` direto no navegador, ou sirva com
qualquer servidor estático, por exemplo:

```bash
npx serve .
```

## Deploy

Estático puro — funciona em qualquer host (Vercel, Netlify, Cloudflare Pages).
Sugestão simples: subir esta pasta como projeto separado na Vercel e apontar
o domínio `www.controlepremoldado.com.br` pra ele.

## Próximos passos (pendências combinadas)

- **Logo**: hoje o cabeçalho usa um logotipo simples em texto/SVG (círculos
  navy + verde). Trocar pelo arquivo de logo real assim que estiver disponível.
- **Formulário de contato**: por enquanto é só captura visual — os dados ficam
  salvos no `localStorage` do navegador de quem preenche (não chegam a lugar
  nenhum além do próprio navegador). Falta ligar a um envio de verdade, por
  exemplo:
  - inserir os leads numa tabela nova no Supabase que já é usado pelo app
    (`controle-pre-moldado/supabase`), via função serverless; ou
  - enviar por e-mail (Resend, SendGrid) ou notificar por WhatsApp.
