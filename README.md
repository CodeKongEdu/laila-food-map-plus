# Laila — Nosso Mapa de Comidas · versão final com imagens

Projeto pessoal e mobile-first feito para a Laila responder preferências alimentares de um jeito leve, íntimo e visual.

## O que mudou nesta versão

- catálogo revisado de **221 itens** (antes eram 256);
- foram removidas **45 repetições/variações desnecessárias**;
- frutas passaram a representar também sucos e vitaminas da mesma fruta;
- leite aparece uma vez;
- iogurte aparece uma vez;
- ovo aparece uma vez;
- peixe aparece uma vez, mantendo peixes realmente diferentes como atum, sardinha e salmão;
- frango aparece de forma geral, sem repetir grelhado/desfiado/frito;
- arroz, feijão e macarrão foram simplificados para itens gerais;
- queijo foi simplificado para `Queijo`, mantendo alguns derivados realmente diferentes;
- refrigerantes foram agrupados como `Refrigerante`;
- chá quente/gelado foi agrupado como `Chá`;
- duplicatas como hambúrguer artesanal, paçoca doce, arroz e feijão e farofa pronta foram removidas do catálogo principal;
- **211 imagens WebP locais**, recortadas e organizadas por categoria;
- nenhuma imagem do catálogo depende de URL externa.

Se alguma versão específica fizer diferença para a Laila, ela pode explicar no campo de detalhes ou adicionar como alimento personalizado.

## Estrutura

```text
laila-food-map-final/
├── index.html
├── styles.css
├── app.js
├── foods.js
├── food-media.js
├── config.js
├── config.example.js
├── analisar.html
├── 404.html
├── CATALOGO_FINAL.txt
├── IMAGENS_MAPEAMENTO.csv
├── assets/
│   └── foods/
│       ├── 01-frutas/
│       ├── 02-verduras-e-legumes/
│       ├── 03-graos-massas-e-paes/
│       ├── 04-carnes-e-proteinas/
│       ├── 05-laticinios-e-cafe-da-manha/
│       ├── 06-pratos-e-refeicoes/
│       ├── 07-doces-e-sobremesas/
│       ├── 08-bebidas/
│       └── 09-temperos-e-extras/
└── supabase/
    └── schema.sql
```

## Como testar localmente

Na pasta do projeto:

```bash
python -m http.server 5500
```

Abra:

```text
http://localhost:5500
```

Sem Supabase configurado, o questionário continua funcionando e permite baixar o JSON de backup.

## Configurar o Supabase

1. Crie um projeto no Supabase.
2. Abra o **SQL Editor**.
3. Execute `supabase/schema.sql`.
4. Pegue a `Project URL` e a chave pública/publishable (`anon` em projetos mais antigos).
5. Preencha `config.js`:

```js
window.APP_CONFIG = {
  SUPABASE_URL: 'https://SEU-PROJETO.supabase.co',
  SUPABASE_ANON_KEY: 'SUA_CHAVE_PUBLICA',
  TABLE_NAME: 'food_responses'
};
```

**Nunca coloque `service_role` no projeto ou no GitHub.**

## Publicar no GitHub Pages

1. Crie um repositório.
2. Envie o conteúdo desta pasta para a raiz do repositório.
3. Vá em `Settings > Pages`.
4. Escolha `Deploy from a branch`.
5. Selecione `main` e `/ (root)`.

## Arquivos de apoio

- `CATALOGO_FINAL.txt`: lista exata dos itens que aparecem no site.
- `IMAGENS_MAPEAMENTO.csv`: mostra qual imagem de origem gerou cada arquivo final.
- `analisar.html`: abre um JSON exportado e organiza as respostas localmente.

## Fluxo

```text
Laila
  ↓
GitHub Pages
  ↓
Mapa de comidas
  ↓
Supabase
  ↓
food_responses.payload (JSONB)
  ↓
Análise posterior
```

Feito para meu amor — **Laila, te amo.**


## Atualização extra — lanchinhos de mercado

Esta versão recebeu mais 10 itens rápidos e fáceis de comprar no mercado, incluindo Fini, bombom, pirulito, marshmallow, pão de mel, wafer, rosquinha, amendoim japonês, salgadinho de queijo e cracker de queijo.
