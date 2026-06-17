# ReleaseBOT

Este projeto é uma app web para gerir lançamentos de música.

A ideia é ter um bot com AI que ajuda a criar releases, editar dados, apagar releases, ver calendário e criar campanhas/plano de promoção para um lançamento.

O projeto tem:

- frontend em React + Tailwind
- backend em Node.js + Express
- base de dados MySQL
- integração com Gemini API
- chat com streaming
- dashboard, releases, calendário, campanhas e definições de admin

## Como iniciar

Instalar dependências:

```bash
npm install

No MySQL Workbench, correr o script:

```txt
backend/schema.sql
```

Iniciar o backend:

```bash
npm run server
```

Iniciar o frontend:

```bash
npm run dev
```

Depois abrir:

```txt
http://localhost:5173
```
