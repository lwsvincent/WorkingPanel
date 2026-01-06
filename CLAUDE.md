# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a monorepo containing the **Eisenhower Matrix Task Manager** - a web-based task management tool using the 4-quadrant prioritization matrix (Urgent/Important). Built with React 18 + TypeScript.

## Common Commands

All commands should be run from the `eisenhower-matrix/` directory:

```bash
cd eisenhower-matrix

# Install dependencies
npm install

# Development server (http://localhost:5173)
npm run dev

# Production build
npm run build

# Preview production build
npm run preview

# Lint
npm run lint
```

## Architecture

### Tech Stack
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Drag & Drop**: @dnd-kit/core + @dnd-kit/sortable
- **Styling**: Tailwind CSS
- **State Management**: React Context + useReducer

### Key Directories

```
eisenhower-matrix/src/
├── components/     # React UI components
├── contexts/       # Global state (TaskContext.tsx)
├── types/          # TypeScript interfaces (task.ts)
└── utils/          # Storage and date utilities
```

### State Management Pattern

State flows through `TaskContext.tsx` using a reducer pattern:
- `useTasks()` hook provides `{ state, dispatch }`
- Actions defined in `types/task.ts` as `TaskAction` union type
- Auto-persists to localStorage with 500ms debounce

### Quadrant Types

The `QuadrantType` enum defines task placement:
- `urgent-important` (DO)
- `not-urgent-important` (SCHEDULE)
- `urgent-not-important` (DELEGATE)
- `not-urgent-not-important` (ELIMINATE)
- `completed`

### Drag & Drop

Uses @dnd-kit with `DndContext` in App.tsx. Tasks have percentage-based positions (0-100) within each quadrant. Cross-quadrant drops assign random positions; same-quadrant drags preserve relative positioning.

## Data Persistence

- **localStorage key**: `eisenhower-matrix-tasks`
- **Export/Import**: JSON format via FilterBar component
- Tasks include UUID, title, content, tags[], deadline, quadrant, position {x, y}, isCompleted
