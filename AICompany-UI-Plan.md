# AICompany UI Dashboard - Implementation Plan

## Context

The AICompany project is a CLI-based agent orchestration system powered by Claude Code. Users currently interact via terminal commands (`@orchestrator`, `/workflow-mapper`), and all state lives in filesystem files (`results/shared.md`, `workflows/*.yaml`, `.claude/agents/*.md`). There is no visual interface to see agents being created, monitor OKR progress, or guide workflow creation interactively.

The goal is to wrap this system with a web UI that provides:
- A guided workflow builder (replacing the CLI Q&A flow)
- A live agent dashboard showing spawned agents and their dependency graph
- Real-time OKR tracking with validation criteria
- An output viewer for files produced in `results/`
- Workflow execution triggering and monitoring

---

## Recommended Tech Stack

### Frontend: React 18 + TypeScript + Vite + Tailwind CSS + shadcn/ui
- Already the established pattern in the project (used by `web-artifacts-builder` skill)
- shadcn/ui provides 40+ production-grade components (cards, tables, tabs, progress bars, dialogs)
- Vite for fast HMR during development
- No SSR needed (local dashboard) - no Next.js overhead

### Additional Frontend Libraries
| Library | Purpose |
|---------|---------|
| `@xyflow/react` (React Flow) | Interactive dependency graph visualization |
| `react-router-dom` v6 | Client-side routing |
| `zustand` | Lightweight state management |
| `react-markdown` + `remark-gfm` | Render markdown previews (shared.md, outputs) |
| `@tanstack/react-query` | REST API data fetching with caching |
| `@monaco-editor/react` | YAML editor for workflow builder review step |
| `yaml` (npm) | Client-side YAML parsing/generation |

### Backend: FastAPI + WebSockets + watchdog (Python)
- **All already in `requirements.txt`** - zero new Python dependencies
- FastAPI serves REST API + WebSocket endpoint
- `watchdog` monitors filesystem for real-time change detection
- `aiofiles` for async file I/O
- Pydantic models for data validation (reuses existing Pydantic dep)

### Real-Time Data Flow
```
Agents write → results/shared.md → watchdog detects change →
  FastAPI parses → WebSocket push → Zustand store update → React re-render
```
Sub-second latency from file write to UI update.

---

## Architecture

```
┌─────────────────────────────────────────────────┐
│  Browser (React SPA)                            │
│  ┌──────────┐ ┌──────────┐ ┌─────────────────┐ │
│  │ Workflow  │ │  Agent   │ │  OKR Tracker /  │ │
│  │ Builder   │ │ Dashboard│ │  Output Viewer  │ │
│  └─────┬────┘ └────┬─────┘ └───────┬─────────┘ │
│        │           │               │            │
│  ┌─────┴───────────┴───────────────┴──────────┐ │
│  │  Zustand Stores + WebSocket Hook           │ │
│  └─────────────────┬──────────────────────────┘ │
└────────────────────┼────────────────────────────┘
                     │ REST + WebSocket
┌────────────────────┼────────────────────────────┐
│  FastAPI Backend    │                            │
│  ┌─────────────────┴──────────────────────────┐ │
│  │  API Routes     │  WebSocket Handler       │ │
│  └─────────────────┬──────────────────────────┘ │
│  ┌─────────────────┴──────────────────────────┐ │
│  │  Services Layer                            │ │
│  │  ├── shared_md_parser.py (reuses regex     │ │
│  │  │   patterns from check_okrs.py)          │ │
│  │  ├── workflow_parser.py (PyYAML)           │ │
│  │  ├── file_watcher.py (watchdog)            │ │
│  │  └── execution_service.py (subprocess)     │ │
│  └────────────────────────────────────────────┘ │
└──────────────────────┬──────────────────────────┘
                       │ filesystem
    ┌──────────────────┼──────────────────────┐
    │  results/shared.md                      │
    │  results/* (output files)               │
    │  workflows/*.yaml                       │
    │  .claude/agents/*.md                    │
    └─────────────────────────────────────────┘
```

### Key Design Decisions

1. **Passive observation model** - The UI watches the filesystem; it never injects into the agent execution loop. Zero changes to existing orchestrator/agent-factory/check_okrs.py code.

2. **Client-side YAML generation** - The workflow builder replicates workflow-mapper's 3-round Q&A as a web form and generates YAML directly. Better UX than wrapping a CLI conversation.

3. **No database** - All state is on the filesystem (matching existing architecture). Workflow history persisted in `dashboard/history.json`.

4. **Shared regex parsing** - Backend parser reuses the exact patterns from `check_okrs.py` (lines 18, 24) to ensure the UI and stop hook always agree on agent/OKR status.

5. **Full execution control** - UI can trigger workflow execution by spawning the Claude Code orchestrator as a subprocess. Create + execute + monitor all from the browser.

---

## Directory Structure

```
AICompany/
  dashboard/                          # NEW - all UI code
    server.py                         # FastAPI entry point
    config.py                         # Path configuration
    api/
      routes/
        workflows.py                  # CRUD for workflow YAMLs
        agents.py                     # List/read agent definitions
        status.py                     # Parse shared.md → JSON
        results.py                    # List/read/download output files
        history.py                    # Past workflow runs
        execute.py                    # Trigger workflow execution
      websocket.py                    # WebSocket handler + connection mgr
    services/
      shared_md_parser.py             # Parse shared.md (reuses check_okrs.py patterns)
      workflow_parser.py              # Parse workflow YAML → Pydantic models
      file_watcher.py                 # watchdog filesystem monitoring
      history_service.py              # Snapshot completed workflows
      execution_service.py            # Spawn Claude Code subprocess
    models/
      schemas.py                      # All Pydantic models
    history.json                      # Persisted run history

    frontend/                         # React SPA (Vite)
      package.json
      vite.config.ts
      tailwind.config.js
      src/
        App.tsx                       # Router + layout
        pages/
          DashboardPage.tsx           # Home: stats + agent grid + graph
          WorkflowBuilderPage.tsx     # Multi-step form → YAML
          WorkflowListPage.tsx        # Browse workflows
          ExecutionMonitorPage.tsx    # Live timeline + graph
          AgentDetailPage.tsx         # OKR tracker + outputs
          OutputViewerPage.tsx        # File browser + previews
          HistoryPage.tsx             # Past runs
        components/
          ui/                         # shadcn/ui components
          layout/                     # Sidebar, Header, Layout
          dashboard/                  # StatsRow, AgentCard
          workflow-builder/           # StepIndicator, QuestionRound, YamlPreview
          monitor/                    # DependencyGraph, AgentNode, Timeline
          okr/                        # OKRTracker, KeyResultItem, ValidationCriterion
          results/                    # FileExplorer, FilePreview
          common/                     # StatusBadge, ProgressRing
        stores/
          workflowStore.ts            # Current execution state
          websocketStore.ts           # WS connection
          workflowBuilderStore.ts     # Form state
        hooks/
          useWebSocket.ts
        lib/
          api.ts                      # REST client
          yaml-generator.ts           # Form answers → YAML
          constants.ts                # Questions, status colors
        types/
          index.ts
```

---

## UI Views

### 1. Dashboard Home (`/`)
- **Stats row**: Total agents, completed count, KR achievement rate, overall progress %
- **Agent status grid**: Cards per agent with name, status badge, progress bar
- **Dependency graph**: Interactive React Flow visualization of agent relationships
- Click any agent card → navigate to agent detail

### 2. Workflow Builder (`/workflows/new`)
- **4-step stepper**: Goal & Scope → Success Criteria → Delivery & Dependencies → Review
- Replicates workflow-mapper's 11 questions across 3 rounds
- **Live YAML preview** panel updates as user fills out questions
- **Monaco YAML editor** in Review step for manual tweaks
- Skill auto-suggestion based on output types (`.docx` → docx skill, etc.)
- Save → `POST /api/workflows` → writes to `workflows/`

### 3. Execution Monitor (`/monitor`)
- **Dependency graph** (React Flow) with live status colors on nodes
- **Agent timeline**: horizontal bars showing PENDING→RUNNING→COMPLETED lifecycle
- **Elapsed time counter**
- "Execute" button triggers workflow via subprocess

### 4. Agent Detail (`/monitor/agents/:name`)
- **OKR Tracker**: Objectives with nested key results
- Status badges: PENDING (amber) / ACHIEVED (green) / NOT ACHIEVED (red)
- Validation criteria checkboxes (read-only, reflecting shared.md `[x]`/`[ ]`)
- **Stop hook indicator**: green/red showing if agent would pass check_okrs.py

### 5. Output Viewer (`/results`)
- File list with icons by extension, size, modified date
- Preview panel: markdown renderer for `.md`, syntax highlighting for `.json`/`.yaml`, download for binaries
- Auto-refreshes on WebSocket `file_created` events

### 6. Workflow History (`/history`)
- Table: workflow name, date, duration, status, agent count, KR achievement rate
- Click row → detail dialog with full summary

---

## Backend API Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/api/workflows` | List all workflow YAMLs |
| `GET` | `/api/workflows/{name}` | Parse specific workflow YAML → JSON |
| `POST` | `/api/workflows` | Save new workflow YAML |
| `DELETE` | `/api/workflows/{name}` | Delete workflow |
| `GET` | `/api/agents` | List agent `.md` files |
| `GET` | `/api/agents/{name}` | Read agent definition |
| `GET` | `/api/status` | Parse `results/shared.md` → structured JSON |
| `GET` | `/api/results` | List files in `results/` |
| `GET` | `/api/results/{filename}` | Download/read result file |
| `GET` | `/api/history` | Past workflow runs |
| `POST` | `/api/workflows/{name}/execute` | Trigger workflow execution |
| `GET` | `/api/skills` | List available skills |
| `WS` | `/ws` | Real-time status updates |

---

## Design Direction: Dark Minimal

- **Theme**: Dark background (`zinc-950`/`slate-950`), subtle borders (`zinc-800`)
- **Status glows**: Green glow for ACHIEVED/COMPLETED, amber pulse for PENDING/running, red for NOT ACHIEVED
- **Graph nodes**: Dark cards with colored left border indicating status, soft glow on active agents
- **Typography**: Inter for UI, JetBrains Mono for YAML/code
- **Inspiration**: GitHub Actions workflow view, Vercel deployment dashboard
- **Accents**: Emerald for success, amber for in-progress, rose for failure, sky-blue for informational
- **Animations**: Subtle transitions on status changes, pulsing dots for running agents, animated edges in dependency graph when data flows between agents
- shadcn/ui's dark theme as the base, customized with these accent colors

---

## Critical Files to Reuse

| File | What to Reuse |
|------|---------------|
| `.claude/scripts/check_okrs.py` | Regex patterns (lines 18, 24) for parsing shared.md agent sections and key results |
| `workflows/workflow-template.yaml` | YAML schema for the workflow builder's output generation |
| `.claude/skills/workflow-mapper/SKILL.md` | The 11 questions and skill-discovery logic to replicate in the builder form |
| `.claude/agents/orchestrator.md` | shared.md structure specification (dependency graph, agent status format) |

---

## Implementation Phases

### Phase 1: Backend Foundation
- Create `dashboard/` directory structure
- Implement Pydantic models (`schemas.py`)
- Implement `shared_md_parser.py` (port regex from `check_okrs.py`)
- Implement `workflow_parser.py` (PyYAML → Pydantic)
- Implement REST API routes: `/api/status`, `/api/workflows`, `/api/agents`, `/api/results`
- Implement `server.py` with FastAPI app + CORS
- **Verify**: `curl localhost:8080/api/status` returns parsed shared.md as JSON

### Phase 2: Real-Time WebSocket Layer
- Implement `file_watcher.py` using watchdog
- Implement WebSocket handler with connection manager + broadcast
- Wire file watcher events → parse → WebSocket push
- **Verify**: Edit shared.md manually → WebSocket client receives update

### Phase 3: Frontend Scaffold
- Init React + Vite + Tailwind + shadcn/ui project in `dashboard/frontend/`
- Set up routing, layout components (Sidebar, Header)
- Set up Zustand stores and WebSocket hook
- Configure Vite proxy to FastAPI for development
- **Verify**: Navigate between pages, WebSocket connects

### Phase 4: Dashboard + Agent Cards
- Implement DashboardPage with stats and agent grid
- Implement StatusBadge and AgentCard components
- Wire to Zustand store + WebSocket for live updates
- **Verify**: Dashboard updates in real-time as shared.md changes

### Phase 5: Dependency Graph
- Integrate React Flow (`@xyflow/react`)
- Custom AgentNode with status colors + progress ring
- Auto-layout with dagre/elkjs
- **Verify**: Graph renders from shared.md dependency data, nodes update live

### Phase 6: OKR Tracker + Agent Detail
- Implement AgentDetailPage with OKR tracker
- Key result items with status badges + validation criteria checkboxes
- Stop-hook-pass indicator
- **Verify**: All OKR states render correctly

### Phase 7: Workflow Builder
- Define question constants from workflow-mapper's 11 questions
- Multi-step form with stepper UI
- Client-side YAML generator from answers
- Live YAML preview + Monaco editor for review step
- Skill auto-suggestion
- **Verify**: Complete form → valid YAML saved to `workflows/`

### Phase 8: Output Viewer + Execution Monitor
- File browser for `results/` with preview panel
- Execution timeline with agent lifecycle bars
- `execution_service.py` to trigger Claude Code subprocess
- **Verify**: Trigger workflow → watch timeline populate → view outputs

### Phase 9: History + Polish
- History service snapshots completed workflows
- Dark mode theming, toasts, loading skeletons, error boundaries
- Production build config (Vite → static files served by FastAPI)
- Startup script (`dashboard/run.sh` or npm script)
- **Verify**: End-to-end: create → execute → monitor → view results → see history

---

## How to Run (Target)

```bash
# Development mode (two terminals)
cd dashboard && uvicorn server:app --reload --port 8080    # Backend
cd dashboard/frontend && npm run dev                        # Frontend (Vite, port 5173)

# Production mode
cd dashboard/frontend && npm run build                      # Build React SPA
cd dashboard && uvicorn server:app --port 8080              # Serves API + static SPA
```

---

## Verification Plan

1. **Backend**: Run FastAPI, create a sample `results/shared.md` with agent statuses, hit `/api/status` → confirm JSON output matches
2. **WebSocket**: Connect wscat to `/ws`, modify shared.md → confirm event received
3. **Frontend**: Navigate all pages, verify data loads from API
4. **Live updates**: Run a real workflow with `@orchestrator`, watch dashboard update in real-time
5. **Workflow builder**: Complete all 3 rounds, verify generated YAML is valid and matches template schema
6. **End-to-end**: Create workflow via UI → execute → monitor agents → check OKRs → view outputs → see in history
