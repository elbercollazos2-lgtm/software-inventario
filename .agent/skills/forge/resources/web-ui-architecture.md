# FORGE Architecture Template: Modern Web UI (Next.js/Vite focus)

This template follows the "Maestro Artesano" philosophy: minimalist and segregated.

## Principles
- **0 Circular Dependencies**: Enforced by strict layer separation.
- **Micro-apps**: Each feature is independent.
- **Logic Purity**: The `core/` layer knows nothing about UI frameworks.

## Structure
```text
src/
├── app/                  # Application Shell & Integration
│   ├── providers/        # Context Providers, Query Client, etc.
│   └── routes/           # Page definitions and routing logic
├── core/                 # Pure Business Logic (The Intelligence)
│   ├── domain/           # Entities and interfaces
│   ├── use-cases/        # Logic orchestrators (Interactors)
│   └── utils/            # Logic-related utilities
├── features/             # Feature-based Modules (The Muscles)
│   ├── [feature-name]/
│   │   ├── api/          # Feature-specific API calls
│   │   ├── components/   # Internal UI components
│   │   ├── hooks/        # Feature-specific state logic
│   │   └── types/        # Internal types
├── shared/               # Reusable Cross-cutting Concerns (The Skeleton)
│   ├── ui/               # Design System / Design Language atoms
│   ├── hooks/            # Global utilities (useDebounce, etc.)
│   └── assets/           # Global icons, fonts, etc.
└── infrastructure/       # Data Access & External Services (The Nerves)
    ├── api/              # Centralized API client (Axios, Fetch)
    └── store/            # Global state management if absolutely needed
```
