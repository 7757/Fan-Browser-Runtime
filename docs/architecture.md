# Architecture

Fan Browser Runtime is organized around four layers. The current MVP implements
the protocol, memory runtime, JSON-RPC handler, Node client, and CLI. The
Electron/CDP runtime is represented by an adapter boundary until source
provenance is cleared.

## Runtime Core

The runtime owns browser sessions, page observations, input, navigation,
storage, screenshots, and policy checks. The intended production implementation
is Electron plus Chrome DevTools Protocol.

The MVP ships a memory runtime so the public API, CLI, and tests can run without
private Fan code.

## Protocol

The protocol is the stable contract between the runtime and agent-facing
clients. TypeScript types and first-pass JSON Schema live in
`@fan-browser-runtime/protocol`.

## Adapters

Adapters expose the protocol to external systems such as MCP, Python, direct
TypeScript clients, or product-specific bridges. The MVP includes a Node client
and an in-process JSON-RPC transport for tests and CLI smoke checks.

## Workbench

A workbench can be added as a thin demo application. Product UI, account logic,
cloud orchestration, billing, model routing, and Fan branding should stay out of
this repository unless explicitly open-sourced.

## Snapshot-Bound Actions

Agents should act against the page state they observed. Actions that change the
page can include `requireSnapshotId`; the runtime rejects the action if the page
has moved on. This prevents stale clicks and stale text entry after redirects,
popups, or human intervention.

## Human Handoff

Human handoff is a runtime state transition, not a UI-only convention. The
runtime must be able to move a session into `human-control`, reject agent input
while appropriate, and later resume agent control with a fresh observation.
