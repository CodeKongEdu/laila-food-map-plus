# Publicar o site da Laila — passo a passo

## Ordem recomendada

1. Criar o projeto no Supabase.
2. Executar `supabase/schema.sql`.
3. Copiar Project URL + Publishable Key para `config.js`.
4. Testar um envio localmente.
5. Criar o repositório no GitHub e enviar os arquivos.
6. Ativar GitHub Pages pela branch `main`, pasta `/ (root)`.
7. Abrir a URL pública e fazer um segundo teste.

## config.js

```js
window.APP_CONFIG = {
  SUPABASE_URL: 'https://SEU-PROJETO.supabase.co',
  SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_SUA_CHAVE_PUBLICA',
  TABLE_NAME: 'food_responses'
};
```

A Publishable Key é feita para uso no navegador. Nunca coloque Secret Key ou `service_role` no projeto público.

## Teste local

Na pasta do projeto:

```bash
python -m http.server 5500
```

Abra `http://localhost:5500`, marque algumas comidas e clique em **Enviar respostas**. Depois confira a tabela `food_responses` no Supabase.

## GitHub Pages

Crie um repositório (ex.: `laila-food-map`), envie o conteúdo desta pasta para a raiz do repositório e depois vá em:

`Settings → Pages → Build and deployment → Deploy from a branch → main → /(root)`

O endereço normalmente ficará no formato `https://SEU-USUARIO.github.io/laila-food-map/`.

## Favicon

O projeto já inclui:

- `assets/brand/favicon.svg`
- `assets/brand/favicon-32.png`
- `assets/brand/apple-touch-icon.png`

O ícone atual mistura a Lua de Morango com um detalhe verde de kiwi.
