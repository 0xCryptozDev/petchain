# Vet/Admin implementation plan

Scope: Team.md §5, §13. Work only in features/vet, features/admin, test/e2e and docs. Independent Vite entry avoids changing Owner/Public routing or shared adapter. Baseline fast-forwarded to main a309b08; contract source is read-only for this task.

Design: a Thai operations workspace, dark green navigation, light reading surface, compact searchable queues and an inline detail panel. Vet inspections and owner reviews are separate decisions. Disputes, committee proposals, role management and audit history have dedicated navigation. Responsive layout stacks on phones. Demonstration is explicitly opted into and never produces explorer links or pretends to be Sepolia.

Architecture: React components consume an injected service. In-memory demo service validates transitions and permissions; live service uses authenticated API preparation plus the existing contract methods. UI restrictions are convenience; backend and contract must independently enforce permissions. No Owner/Public implementation, backend routes, database migration or contract changes.

- [x] Write workflow and transaction tests; implement service boundaries.
- [x] Implement Vet queue, inspection and history; Admin review, cards and suspension.
- [x] Implement disputes, 2-of-3 voting, governance, roles and audit.
- [x] Run browser workflows and mobile checks; build the separate entry.
- [x] Document proposed API payloads, test evidence, demo and outstanding live integration.

Verification: Node tests for workflow/transaction boundaries; Playwright for user journeys with simulated owner registration/transfer fixtures (not an Owner UI implementation). Live backend/Sepolia runs require other members' deliverables and must remain marked unverified.
