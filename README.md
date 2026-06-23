<h1 align="center">
  <img src="https://img.shields.io/badge/TaskFlow-Gestor%20de%20Tarefas-blue?style=for-the-badge" alt="TaskFlow" />
</h1>

<p align="center">
  Sistema de gerenciamento de tarefas desenvolvido com <strong>Next.js 15</strong>, <strong>Firebase</strong> e <strong>Tailwind CSS</strong>.
  <br />
  Trabalho 3 — Disciplina de Desenvolvimento Web · UniSENAI
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-15-black?logo=next.js" />
  <img src="https://img.shields.io/badge/TypeScript-5-blue?logo=typescript" />
  <img src="https://img.shields.io/badge/Firebase-11-orange?logo=firebase" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-3-38bdf8?logo=tailwindcss" />
  <img src="https://img.shields.io/badge/Tremor-3-purple" />
</p>

---

## Sumário

- [Sobre o Projeto](#sobre-o-projeto)
- [Funcionalidades](#funcionalidades)
- [Stack Tecnológico](#stack-tecnológico)
- [Pré-requisitos](#pré-requisitos)
- [Instalação e Execução Local](#instalação-e-execução-local)
- [Configuração do Firebase](#configuração-do-firebase)
- [Estrutura de Pastas](#estrutura-de-pastas)
- [Deploy](#deploy)

---

## Sobre o Projeto

O **TaskFlow** é uma aplicação web completa de gerenciamento de tarefas que permite aos usuários organizar seu trabalho através de um dashboard com métricas, quadro Kanban interativo, visualização em calendário e sistema de sub-tarefas com barra de progresso.

---

## Funcionalidades

- **Autenticação** — Login com e-mail/senha, Google e GitHub via Firebase Auth, com verificação de e-mail obrigatória
- **Dashboard** — Métricas em tempo real (tarefas pendentes, concluídas na semana, vencidas) com 3 gráficos Tremor
- **CRUD de Tarefas** — Criar, editar, visualizar e deletar tarefas com título, descrição, prioridade e data de vencimento
- **Sub-tarefas** — Cada tarefa pode ter sub-tarefas com barra de progresso calculada automaticamente
- **Kanban Interativo** — Drag-and-drop entre colunas "A Fazer", "Fazendo" e "Concluído" com Dnd Kit
- **Calendário** — Visualização de tarefas por data de vencimento com FullCalendar e modal de detalhes
- **Página de Detalhes** — Edição completa, gerenciamento de sub-tarefas, alteração de status e log de trabalho
- **Acessibilidade** — VLibras, temas dark/light/alto contraste, aria-labels, roles semânticos e HTML semântico

---

## Stack Tecnológico

| Categoria | Tecnologia |
|---|---|
| Framework | Next.js 15 (App Router) |
| Linguagem | TypeScript 5 |
| Banco de Dados | Firebase Firestore |
| Autenticação | Firebase Authentication |
| API | Next.js Route Handlers |
| Estilização | Tailwind CSS 3 |
| Componentes Landing | Aceternity UI |
| Componentes Dashboard | Tremor 3 |
| Animação | Framer Motion |
| Ícones | Lucide React |
| Temas | Next-Themes |
| Formulários | React Hook Form + Zod (zodResolver) |
| Calendário | FullCalendar 6 |
| Drag-and-Drop | Dnd Kit |
| Notificações | Sonner |

---

## Pré-requisitos

Antes de começar, certifique-se de ter instalado na sua máquina:

- [Node.js](https://nodejs.org/) — versão **18.17 ou superior**
- [npm](https://www.npmjs.com/) (já incluído no Node.js)
- [Git](https://git-scm.com/)
- Uma conta no [Firebase](https://firebase.google.com/) (gratuita)

Para verificar se o Node.js está instalado:

```bash
node -v   # deve exibir v18.x.x ou superior
npm -v    # deve exibir a versão do npm
```

---

## Instalação e Execução Local

### 1. Clone o repositório

```bash
git clone https://github.com/<seu-usuario>/taskflow.git
cd taskflow
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente

Copie o arquivo de exemplo e preencha com as suas credenciais do Firebase:

```bash
cp .env.example .env.local
```

Abra o arquivo `.env.local` e preencha os valores (veja a seção [Configuração do Firebase](#configuração-do-firebase) para saber onde encontrar cada valor):

```env
NEXT_PUBLIC_FIREBASE_API_KEY=sua_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=seu_projeto.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=seu_projeto_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=seu_projeto.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=seu_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=seu_app_id
```

### 4. Execute o projeto em modo de desenvolvimento

```bash
npm run dev
```

Acesse **http://localhost:3000** no navegador.

### Outros comandos disponíveis

```bash
npm run build    # gera build de produção
npm run start    # inicia o servidor de produção (requer build antes)
npm run lint     # executa o linter ESLint
```

---

## Configuração do Firebase

### 1. Crie um projeto no Firebase

1. Acesse [console.firebase.google.com](https://console.firebase.google.com/)
2. Clique em **"Adicionar projeto"** e siga os passos
3. Após criar, clique em **"Web"** (`</>`) para registrar um app web
4. Copie as credenciais exibidas — elas correspondem às variáveis do `.env.local`

### 2. Ative o Firestore Database

1. No console do Firebase, acesse **"Firestore Database"**
2. Clique em **"Criar banco de dados"**
3. Escolha o modo **"Produção"** e selecione uma região (ex: `southamerica-east1`)
4. Nas **Regras**, substitua pelo seguinte para autenticação obrigatória:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/tasks/{taskId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### 3. Ative a Autenticação

1. No console, acesse **"Authentication"** → **"Sign-in method"**
2. Habilite os seguintes provedores:
   - **E-mail/senha** — ative e marque "E-mail link"
   - **Google** — ative e configure o e-mail de suporte
   - **GitHub** — ative, acesse [github.com/settings/developers](https://github.com/settings/developers), crie um OAuth App com a URL de callback fornecida pelo Firebase e cole o Client ID e Client Secret

### 4. Adicione o domínio do Vercel aos domínios autorizados

1. No console, acesse **"Authentication"** → **"Settings"** → **"Authorized domains"**
2. Adicione o domínio do seu deploy no Vercel (ex: `taskflow-xi.vercel.app`)

---

## Estrutura de Pastas

```
taskflow/
├── src/
│   ├── app/                        # Páginas (Next.js App Router)
│   │   ├── page.tsx                # Landing page
│   │   ├── layout.tsx              # Layout raiz
│   │   ├── login/page.tsx          # Tela de login
│   │   ├── register/page.tsx       # Tela de cadastro
│   │   ├── dashboard/page.tsx      # Dashboard com métricas e gráficos
│   │   ├── tasks/
│   │   │   ├── page.tsx            # Lista de tarefas
│   │   │   └── [id]/page.tsx       # Detalhes da tarefa
│   │   ├── kanban/page.tsx         # Quadro Kanban com drag-and-drop
│   │   ├── calendar/page.tsx       # Calendário com FullCalendar
│   │   ├── profile/page.tsx        # Perfil do usuário
│   │   └── api/                    # Route Handlers (Next.js API)
│   │       ├── dashboard/route.ts
│   │       ├── tasks/route.ts
│   │       └── tasks/[id]/route.ts
│   │
│   ├── components/
│   │   ├── atoms/                  # Componentes básicos (Badge, ProgressBar)
│   │   ├── molecules/              # Componentes compostos (TaskCard, TaskForm)
│   │   ├── organisms/              # Componentes complexos (AppNav, CalendarView)
│   │   ├── templates/              # Layouts de página (AppLayout)
│   │   ├── aceternity/             # Componentes Aceternity UI (Landing Page)
│   │   ├── ClientProviders.tsx     # Providers globais (Theme, Auth, Toast)
│   │   ├── ProtectedRoute.tsx      # HOC de proteção de rota
│   │   ├── LoginForm.tsx
│   │   ├── RegisterForm.tsx
│   │   └── VLibras.tsx             # Widget de acessibilidade VLibras
│   │
│   ├── contexts/
│   │   └── AuthContext.tsx         # Contexto global de autenticação
│   │
│   ├── hooks/
│   │   ├── useAuth.ts              # Hook de autenticação
│   │   └── useTasks.ts             # Hook de tarefas (listener Firestore)
│   │
│   ├── lib/
│   │   ├── firebase.ts             # Configuração do Firebase
│   │   ├── validations.ts          # Schemas Zod (login, registro)
│   │   └── utils.ts                # Utilitários gerais
│   │
│   ├── services/
│   │   ├── auth.service.ts         # Operações de autenticação
│   │   └── task.service.ts         # Operações CRUD de tarefas
│   │
│   ├── types/
│   │   ├── task.ts                 # Interfaces Task, Subtask, WorkLog
│   │   └── user.ts                 # Interface AppUser
│   │
│   └── middleware.ts               # Proteção de rotas autenticadas
│
├── .env.example                    # Modelo de variáveis de ambiente
├── .env.local                      # Variáveis locais (não versionado)
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## Deploy

A aplicação está publicada no **Vercel**:

🔗 **[taskflow-app.vercel.app](https://taskflow-app.vercel.app)** ← _substitua pelo link real_

Para fazer seu próprio deploy no Vercel:

1. Faça push do projeto para o GitHub
2. Acesse [vercel.com](https://vercel.com) e importe o repositório
3. Na etapa de configuração, adicione todas as variáveis de ambiente do `.env.local`
4. Clique em **Deploy**

---

<p align="center">
  Desenvolvido por <strong>Gabriel Lima de Oliveira e Guilherme Aniel</strong> · UniSENAI 2025
</p>
