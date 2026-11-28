---
version: 1
slug: "web-src-features-admin-workspace-jsx"
primary_target: "web/src/features/admin/Workspace.jsx"
related_targets: ["web/src/features/admin/WorkspaceChrome.jsx","web/src/features/vet/VetPanel.jsx","web/src/features/admin/ReviewPanel.jsx"]
---

# Vet/Admin — Warm Care replacement

Mode: Operate. Scope: rattanapon Vet/Admin, all seven destinations. The user requested complete visual replacement, preserving capabilities; desktop first, then mobile; custom controls and purposeful animation. User selected Warm Care on the decision page, code-led, no path flip.

## Direction contract
THESIS: A welcoming certification workspace with horizontal navigation and open reading surfaces, replacing the navy sidebar and cold card grid completely.
OWN-WORLD: Warm ivory #fff7ed, brown ink #392e28, clay action #c64f29, white work surfaces, Noto Sans Thai, soft controls and quiet separators. Color strategy: restrained, clay reserved for actions. Reviewers read for sustained periods in normally lit workrooms, so the document surface stays light.
STORY: Find a registry, compare its authorized evidence with the actual inspection, record a reason and review the consequence before signing. Existing Vet/Reviewer/Dispute/Committee/Roles/Audit/History workflows remain.
FIRST VIEWPORT: At1440px, a floating white horizontal navigation bar; a compact demo/account area; a32px task heading; an open queue at left and a generous white case sheet with identity, side-by-side evidence and decision, and an obvious action. Signature: selecting a case moves the queue selection and gently opens its evidence sheet; readiness updates give quiet confirmation. No marketing hero or fabricated metrics.
FORM: Warm Consumer App challenger, translated to desktop product conventions; seed:ee57e6bcd5b22311. Chosen HTML sketch .impeccable/mocks/decision/warm.html is the composition reference. The board and hero were opened after selection. Preview-only unsupported identities/chip values are removed; production uses existing service data exclusively.
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Motion thesis
Case selection is a bounded220ms reveal, canceled on rapid reselection. Disclosure and select use180/140ms opening; controls acknowledge press and checked state. No loops or page-load choreography. Reduced motion removes spatial effects while retaining color/state feedback. No motion dependency.
