# 🎨 FlowOS Dashboard

> Next.js 16 user-facing dashboard cho FlowOS — Template marketplace, dynamic form execution, real-time SSE tracking, credential management, và billing.

---

## 📐 Architecture

```
flowos-dashboard (:3000)
  │
  ├── Auth Layer (JWT localStorage)
  │     ├── Login / Register
  │     └── Auto-redirect on 401
  │
  ├── Dashboard Layout (Sidebar + Content)
  │     ├── 📋 Templates Marketplace
  │     │     ├── Category filter + search
  │     │     └── Template detail → DynamicForm → Run
  │     │
  │     ├── 📊 Executions
  │     │     ├── History (stats, table, pagination)
  │     │     └── Detail (SSE live tracking, logs)
  │     │
  │     ├── 🔑 Credentials Management
  │     ├── 💳 Billing & Quota
  │     └── ⚙️ Settings
  │
  └── API Client (lib/api.ts) ──→ flowos-api (:4000)
```

---

## 📁 Cấu trúc thư mục

```
flowos-dashboard/
├── src/
│   ├── app/
│   │   ├── layout.tsx                     # Root layout + AuthProvider
│   │   ├── page.tsx                       # Redirect → /templates
│   │   ├── globals.css                    # 🎨 Design system (dark, glassmorphism)
│   │   │
│   │   ├── auth/
│   │   │   ├── auth.module.css            # Shared auth styles (gradient orbs)
│   │   │   ├── login/page.tsx             # Đăng nhập
│   │   │   └── register/page.tsx          # Đăng ký
│   │   │
│   │   └── (dashboard)/                   # Protected routes (auth guard)
│   │       ├── layout.tsx                 # Sidebar + auth check
│   │       ├── templates/
│   │       │   ├── page.tsx               # ★ Marketplace (grid, filter, search)
│   │       │   ├── page.module.css
│   │       │   └── [id]/
│   │       │       ├── page.tsx           # Template detail + DynamicForm → run
│   │       │       └── page.module.css
│   │       ├── executions/
│   │       │   ├── page.tsx               # History (stats cards, table)
│   │       │   ├── page.module.css
│   │       │   └── [id]/
│   │       │       ├── page.tsx           # ★ Live tracking (SSE, logs panel)
│   │       │       └── page.module.css
│   │       ├── credentials/
│   │       │   ├── page.tsx               # CRUD + type selection modal
│   │       │   └── page.module.css
│   │       ├── billing/
│   │       │   ├── page.tsx               # Quota bar + plan comparison
│   │       │   └── page.module.css
│   │       └── settings/
│   │           ├── page.tsx               # Profile, logout
│   │           └── page.module.css
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx                # Navigation sidebar
│   │   │   └── Sidebar.module.css
│   │   └── forms/
│   │       ├── DynamicForm.tsx            # ★ JSON Schema → UI renderer
│   │       └── DynamicForm.module.css
│   │
│   └── lib/
│       ├── api.ts                         # HTTP client + SSE factories
│       └── auth.tsx                       # Auth context (login, register, logout)
│
├── Dockerfile                             # Multi-stage production build (standalone)
└── package.json
```

---

## 📄 Pages & Chức năng

### 1. 📋 Template Marketplace (`/templates`)

| Feature | Mô tả |
|---------|--------|
| Category Filter | 7 categories chips (All, Social Media, AI Tools, ...) |
| Search | Realtime search by name / description / tags |
| Card Grid | Animated cards with glow hover, premium badges |
| Stagger Animation | Cards fade in sequentially |

### 2. 📄 Template Detail + Run (`/templates/:id`)

| Feature | Mô tả |
|---------|--------|
| DynamicForm | Renders form from `inputSchema` (JSON Schema) |
| Widget Hints | `x-ui` field hints: textarea, select, radio, checkbox |
| Validation | Required fields, Vietnamese error messages |
| Execution | Submit → API → Redirect to live tracking |

### 3. 📊 Execution History (`/executions`)

| Feature | Mô tả |
|---------|--------|
| Stats Cards | 4 cards: Total, Success, Error, Running |
| Data Table | Template name, status badge, duration, date |
| Pagination | Page navigation |
| Status Filter | Lọc theo PENDING, RUNNING, SUCCESS, ERROR |

### 4. 📡 Execution Detail + SSE (`/executions/:id`)

| Feature | Mô tả |
|---------|--------|
| **SSE Live Tracking** | EventSource real-time status updates |
| Live Logs Panel | Auto-scroll, node-level events |
| Status Header | Pulsing indicator, status badges |
| Input/Output | JSON data display |
| Actions | Cancel (running) / Retry (failed) |

### 5. 🔑 Credentials (`/credentials`)

| Feature | Mô tả |
|---------|--------|
| Type Selection | Modal with supported types (Telegram, OpenAI, ...) |
| CRUD | Create, edit, delete credentials |
| Security | Data encrypted AES-256-GCM server-side |

### 6. 💳 Billing (`/billing`)

| Feature | Mô tả |
|---------|--------|
| Quota Bar | Color-coded progress (green → yellow → red) |
| Plan Comparison | 3-column: Free / Pro / Business |
| Upgrade | CTA buttons per plan |

### 7. ⚙️ Settings (`/settings`)

| Feature | Mô tả |
|---------|--------|
| Profile | Email (readonly), fullName (editable) |
| Account | Role badge, logout button |

---

## 🎨 Design System

| Feature | Implementation |
|---------|---------------|
| **Theme** | Dark-first (`#0a0a0f` base, `#111118` cards) |
| **Typography** | Inter (Google Fonts), gradient headings |
| **Primary Color** | Indigo `#6366f1` |
| **Accent Color** | Green `#06d6a0` |
| **Cards** | Glassmorphism (`backdrop-filter: blur(12px)`) |
| **Buttons** | Gradient primary, ghost, danger variants |
| **Badges** | Status-colored (success/error/warning/info/premium) |
| **Animations** | fadeIn, slideUp, stagger, pulse-glow, shimmer |
| **Scrollbar** | Custom thin dark scrollbar |

---

## 🔄 Luồng hoạt động

### Authentication Flow

```
User → /auth/login
  │
  ├─ POST /api/auth/login { email, password }
  │   → Response: { accessToken, user }
  │
  ├─ localStorage.set('flowos_token', accessToken)
  ├─ localStorage.set('flowos_user', JSON.stringify(user))
  │
  └─ Redirect → /templates
  
  On 401 → Auto redirect → /auth/login
```

### Automation Run Flow

```
/templates → Select template → /templates/:id
  │
  ├─ Fetch template detail + inputSchema
  ├─ Render DynamicForm (from JSON Schema)
  ├─ User fills form → Submit
  │
  ├─ POST /api/automations/run { templateId, inputData }
  │   → Response: { executionId }
  │
  └─ Redirect → /executions/:executionId
       │
       ├─ GET /api/executions/:id (initial data)
       ├─ EventSource(/api/executions/:id/stream)
       │     → SSE events: status, node_started, node_finished, completed
       │     → Live logs panel updates
       │
       └─ Execution finishes → Display output data
```

---

## 🚀 Deployment

### Development

```bash
# 1. Prerequisites
# flowos-infra running (PostgreSQL + Redis)
# flowos-api running on :4000

# 2. Install
npm install

# 3. Configure API URL (optional, default: http://localhost:4000/api)
# Edit src/lib/api.ts → API_BASE

# 4. Start dev server
npm run dev
# → http://localhost:3000
```

### Production

```bash
# Option 1: Docker
docker build \
  --build-arg NEXT_PUBLIC_API_URL=https://api.flowos.io/api \
  -t flowos-dashboard:latest .

docker run -d -p 3000:3000 flowos-dashboard:latest

# Option 2: Standalone build
npm run build
node .next/standalone/server.js

# Option 3: docker-compose.prod.yml (recommended)
# Included in flowos-infra, handles all services
```

### Environment Variables

| Variable | Default | Mô tả |
|----------|---------|--------|
| `NEXT_PUBLIC_API_URL` | `http://localhost:4000/api` | FlowOS API base URL |

---

## 🔧 Key Components

### DynamicForm (`components/forms/DynamicForm.tsx`)

Renders forms from JSON Schema with `x-ui` extension:

```json
{
  "type": "object",
  "required": ["message"],
  "properties": {
    "message": {
      "type": "string",
      "title": "Nội dung tin nhắn",
      "x-ui": { "widget": "textarea", "rows": 5, "placeholder": "Nhập nội dung..." }
    },
    "channel": {
      "type": "string",
      "title": "Kênh",
      "x-ui": { "widget": "select", "options": ["general", "random"] }
    }
  }
}
```

### API Client (`lib/api.ts`)

```typescript
// HTTP requests with auto JWT injection
api.get('/templates');
api.post('/automations/run', { templateId, inputData });

// SSE factories
api.streamExecution(executionId);     // Returns EventSource
api.streamDashboard();                // Returns EventSource
```

### Auth Context (`lib/auth.tsx`)

```typescript
const { user, login, register, logout, isAuthenticated } = useAuth();
```
