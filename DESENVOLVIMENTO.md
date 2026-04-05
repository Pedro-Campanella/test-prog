# Documentação da implementação

Este arquivo complementa o [README.md](README.md), que permanece como **enunciado e requisitos** do teste. Aqui está descrito **o que foi construído**, **como está organizado** e **como executar** o projeto.

---

## O que foi implementado

| Requisito (README) | Implementação |
|--------------------|---------------|
| Cadastro (e-mail e senha) | Rota `/registro`; `POST /api/register` com hash de senha (bcrypt). |
| Login (e-mail e senha) | Rota `/login`; `POST /api/login`; resposta com JWT. |
| Área logada (Minhas vagas / Minhas candidaturas) | Rota `/painel` com abas; `GET /api/jobs/mine` e `GET /api/applications/mine`. |
| Registro de vagas | Rota `/painel/vagas/nova`; `POST /api/jobs` (autenticado). |
| Cadastro em vaga | Na busca, botão **Candidatar-se**; `POST /api/jobs/:id/apply` (não permite candidatura na própria vaga nem duplicata). |
| Busca de vagas | Rota `/painel/buscar`; `GET /api/jobs?q=...` (filtro no título e descrição). |
| Não perder login ao atualizar | Token e dados do usuário em `localStorage` (`rs_token`, `rs_user`); estado inicial do React lê esses valores. |
| Logado não acessa login/cadastro | `GuestOnlyRoute` redireciona para `/painel` se já houver sessão. |
| Sem Next.js | Apenas React + Vite + TypeScript. |

---

## Arquitetura resumida

- **Backend** (`backend/`): API REST em Go com Gin; persistência com GORM em PostgreSQL; JWT no header `Authorization: Bearer <token>`.
- **Frontend** (`frontend/`): SPA com React Router; Axios com interceptor para anexar o token; em produção ou ambientes específicos pode-se definir `VITE_API_URL`; em desenvolvimento o Vite faz **proxy** de `/api` para o servidor Go (padrão `localhost:8080`).

---

## Estrutura de pastas (principal)

```
backend/
  cmd/server/main.go          # Entrada HTTP, CORS, rotas
  internal/
    auth/                     # JWT
    database/                 # Conexão e migrações GORM
    handlers/                 # Registro, login, vagas, candidaturas
    middleware/               # Validação do JWT
    models/                   # User, Job, Application
  .env.example

frontend/
  src/
    api/client.ts             # Axios + persistência do token
    context/AuthContext.tsx   # Sessão global
    pages/                    # Telas (login, registro, painel, busca, nova vaga)
    routes/                   # Rotas protegidas / só visitantes
  vite.config.ts              # Proxy /api → backend
```

Na raiz: `docker-compose.yml` sobe um PostgreSQL alinhado ao `.env.example` do backend.

---

## Como executar

### Pré-requisitos

- Go (para o backend) e Node.js (para o frontend).
- PostgreSQL em execução (por exemplo com `docker compose up -d` na raiz do repositório).

### Backend

1. Copie `backend/.env.example` para `backend/.env` e ajuste `DATABASE_URL` e `JWT_SECRET` se necessário.
2. Na pasta `backend`: `go mod tidy` e `go run ./cmd/server`.

### Frontend

1. Na pasta `frontend`: `npm install` (se ainda não fez) e `npm run dev`.

### Variáveis de ambiente (referência)

| Onde | Variável | Uso |
|------|----------|-----|
| Backend | `DATABASE_URL` | DSN do PostgreSQL |
| Backend | `JWT_SECRET` | Chave de assinatura do JWT |
| Backend | `PORT` | Porta HTTP (padrão `8080`) |
| Backend | `CORS_ORIGIN` | Origem permitida (padrão `http://localhost:5173`) |
| Frontend | `VITE_API_URL` | URL base da API (vazio = mesma origem + proxy em dev) |

---

## Observações para quem avalia o teste

- O `README.md` original não foi substituído, para manter o texto do desafio intacto.
- Documentos deste tipo (**SETUP**, **IMPLEMENTATION**, **DESENVOLVIMENTO**) são habituais em entregas técnicas: facilitam revisão e execução local sem misturar enunciado com notas de implementação.
