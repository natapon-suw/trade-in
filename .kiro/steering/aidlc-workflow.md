---
inclusion: always
---

# AI-DLC Workflow Active — trade-in-platform

## Recovery (read this after context compaction)

If you've lost context or are unsure what to do next:
1. Read `.aidlc/workflow/trade-in-platform/workflow-state.json` for current phase and next action
2. Activate the skill: `Use the aidlc skill to continue working on trade-in-platform`
3. The skill will resume from the correct phase

**CRITICAL**: After context compaction, treat ALL previously-read files as lost. Re-read phase instructions, templates, guides, and artifacts from disk before generating anything. Do NOT rely on conversation history.

## Current State

- **Feature**: trade-in-platform
- **Language**: en
- **Specs**: `.kiro/specs/trade-in-platform/`
- **Workflow state**: `.aidlc/workflow/trade-in-platform/workflow-state.json`
- **Skill**: `~/.kiro/skills/aidlc/SKILL.md`
- **Phase prompts**: `~/.kiro/skills/aidlc/references/phase-prompts/`
- **Templates**: `~/.kiro/skills/aidlc/assets/`

## How to Continue

Activate the `aidlc` skill:

    Use the aidlc skill to continue working on trade-in-platform

The skill handles all workflow state, phase routing, and artifact management.

## Implementation Context

When implementing tasks directly (outside the full skill workflow), read the design documents first:

### Determine Context Folder

- Unit workstream: task file at `.kiro/specs/trade-in-platform-<unit>/tasks.md` → design docs at same folder
- Main feature: task file at `.kiro/specs/trade-in-platform/tasks.md` → design docs at same folder
- Always also read `.kiro/specs/trade-in-platform/foundation.md` (if exists) for shared conventions

### Design Documents (follow precisely)

- `design.md` — architecture overview
- `design/components.md` — component specs
- `design/data-model.md` — entities and schemas
- `design/api-spec.md` — endpoints and contracts
- `design/integration.md` — external services and event schemas
- `design/implementation.md` — directory structure and conventions

### Key Rules

- ALWAYS read templates from `~/.kiro/skills/aidlc/assets/` before generating artifacts — do NOT guess formats
- Follow technology stack and patterns from design decisions — do not deviate
- Follow testing approach from D4 decisions (TDD, test-after, outside-in)
- Mark tasks complete after all tests pass: `- [ ]` → `- [x]` on task checkboxes
