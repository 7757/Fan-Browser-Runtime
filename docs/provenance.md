# Provenance

This file tracks source candidates before code is imported into the open-source
runtime.

## Current Repository

The initial `Fan-Browser-Runtime` implementation is clean-room TypeScript code
created directly in this repository.

## Candidate Modules

Candidate files must be reviewed before import.

| Area | Candidate path | Initial decision |
| --- | --- | --- |
| Browser runtime | `fan-browser-agent/apps/desktop/electron/browser-runtime` | Review file-by-file |
| Session controllers | `fan-browser-agent/apps/desktop/electron/browser-session-controller.cjs` | Review file-by-file |
| Navigation controller | `fan-browser-agent/apps/desktop/electron/browser-navigation-controller.cjs` | Review file-by-file |
| Popup controller | `fan-browser-agent/apps/desktop/electron/browser-popup-controller.cjs` | Review file-by-file |
| Resource governor | `fan-browser-agent/apps/desktop/electron/browser-resource-governor.cjs` | Review file-by-file |

## Import Rules

- Import only files approved for this repository.
- Exclude account, subscription, cloud, telemetry, model routing, private
  deployment, and product UI code.
- Add a row for every imported file with origin, review status, and import
  commit.
