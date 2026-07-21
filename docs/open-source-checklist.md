# Open Source Checklist

Use this checklist before importing code from Fan or publishing this repository.

## Provenance

- Confirm every imported file is owned by the project owner or approved for
  inclusion.
- Do not add author or copyright notices for anyone other than the project
  owner.
- Keep a record of imported source files without adding public author branding.

## Product Separation

- Remove private account, subscription, deployment, telemetry, server, and model
  routing dependencies.
- Remove private domains, internal endpoints, and operational scripts.
- Remove private product names unless they are intentionally part of the open
  source project identity.

## Security

- Scan for secrets and environment values.
- Ensure policy defaults deny risky behavior such as arbitrary downloads,
  clipboard writes, file uploads, and cross-origin credential leakage.
- Document the threat model for local browser automation.

## Release Readiness

- Add CI for type-checking, linting, tests, and package publishing dry runs.
- Add examples for TypeScript, Python, and MCP.
- Add a minimal Electron implementation behind the `BrowserRuntime` interface.
- Add JSON Schema for protocol compatibility testing.
