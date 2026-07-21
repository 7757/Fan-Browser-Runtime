export const browserProtocolSchemas = {
  BrowserSession: {
    type: "object",
    required: ["sessionId", "state", "createdAt", "currentUrl"],
    properties: {
      sessionId: { type: "string" },
      state: {
        enum: ["creating", "ready", "paused", "human-control", "closed"]
      },
      createdAt: { type: "string" },
      currentUrl: { type: ["string", "null"] }
    }
  },
  BrowserObservation: {
    type: "object",
    required: ["sessionId", "snapshotId", "snapshot"],
    properties: {
      sessionId: { type: "string" },
      snapshotId: { type: "string" },
      snapshot: { $ref: "#/$defs/BrowserSnapshot" }
    }
  },
  BrowserSnapshot: {
    type: "object",
    required: ["snapshotId", "capturedAt", "url", "title", "text", "elements"],
    properties: {
      snapshotId: { type: "string" },
      capturedAt: { type: "string" },
      url: { type: ["string", "null"] },
      title: { type: ["string", "null"] },
      text: { type: "string" },
      elements: {
        type: "array",
        items: { $ref: "#/$defs/BrowserElement" }
      }
    }
  },
  BrowserElement: {
    type: "object",
    required: ["index", "role", "name", "text"],
    properties: {
      index: { type: "number" },
      role: { type: ["string", "null"] },
      name: { type: ["string", "null"] },
      text: { type: "string" },
      selector: { type: "string" }
    }
  }
} as const;
