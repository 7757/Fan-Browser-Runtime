import type {
  BrowserObservation,
  BrowserRuntime,
  BrowserRuntimeOptions,
  BrowserScreenshot,
  BrowserSession,
  BrowserSnapshot,
  CreateSessionOptions,
  RuntimePolicy
} from "@fan-browser-runtime/protocol";
import { BrowserRuntimeError } from "./errors.js";
import { createDefaultPolicies } from "./policy.js";

interface RuntimeRecord {
  session: BrowserSession;
  snapshot: BrowserSnapshot;
}

export interface MemoryBrowserRuntimeState {
  records: RuntimeRecord[];
}

export class MemoryBrowserRuntime implements BrowserRuntime {
  private readonly sessions = new Map<string, RuntimeRecord>();
  private readonly policies: RuntimePolicy[];

  constructor(options: BrowserRuntimeOptions = {}) {
    this.policies = [...createDefaultPolicies(options), ...(options.policies ?? [])];
  }

  async createSession(
    options: CreateSessionOptions = {}
  ): Promise<BrowserSession> {
    const now = new Date().toISOString();
    const session: BrowserSession = {
      sessionId: crypto.randomUUID(),
      state: "ready",
      createdAt: now,
      currentUrl: null
    };

    const snapshot = this.createSnapshot(session, "Blank page", [
      {
        index: 0,
        role: "document",
        name: options.visible === false ? "hidden session" : "visible session",
        text: "Blank page"
      }
    ]);
    this.sessions.set(session.sessionId, { session, snapshot });
    return session;
  }

  async getSession(sessionId: string): Promise<BrowserSession | null> {
    return this.sessions.get(sessionId)?.session ?? null;
  }

  async navigate(
    sessionId: string,
    url: string
  ): Promise<BrowserObservation> {
    const record = this.requireRecord(sessionId);
    await this.evaluatePolicies(record.session, { type: "navigate", url });
    record.session.currentUrl = url;
    record.snapshot = this.createSnapshot(record.session, `Navigated to ${url}`, [
      {
        index: 0,
        role: "link",
        name: "Example link",
        text: `Example link on ${url}`,
        selector: "a"
      },
      {
        index: 1,
        role: "button",
        name: "Continue",
        text: "Continue",
        selector: "button"
      }
    ]);
    return this.toObservation(sessionId, record.snapshot);
  }

  async observe(sessionId: string): Promise<BrowserObservation> {
    const record = this.requireRecord(sessionId);
    return this.toObservation(sessionId, record.snapshot);
  }

  async click(
    sessionId: string,
    input: { index: number; snapshotId: string }
  ): Promise<BrowserObservation> {
    const record = this.requireRecord(sessionId);
    this.requireFreshSnapshot(record.snapshot, input.snapshotId);
    this.requireElement(record.snapshot, input.index);
    await this.evaluatePolicies(record.session, {
      type: "click",
      index: input.index,
      requireSnapshotId: input.snapshotId
    });
    record.snapshot = this.createSnapshot(
      record.session,
      `Clicked element ${input.index}`,
      record.snapshot.elements
    );
    return this.toObservation(sessionId, record.snapshot);
  }

  async type(
    sessionId: string,
    input: { index: number; text: string; snapshotId: string }
  ): Promise<BrowserObservation> {
    const record = this.requireRecord(sessionId);
    this.requireFreshSnapshot(record.snapshot, input.snapshotId);
    this.requireElement(record.snapshot, input.index);
    await this.evaluatePolicies(record.session, {
      type: "type",
      index: input.index,
      text: input.text,
      requireSnapshotId: input.snapshotId
    });
    record.snapshot = this.createSnapshot(
      record.session,
      `Typed into element ${input.index}`,
      record.snapshot.elements
    );
    return this.toObservation(sessionId, record.snapshot);
  }

  async screenshot(sessionId: string): Promise<BrowserScreenshot> {
    this.requireRecord(sessionId);
    return {
      sessionId,
      mimeType: "image/png",
      dataBase64:
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII="
    };
  }

  async closeSession(sessionId: string): Promise<void> {
    const record = this.sessions.get(sessionId);
    if (record) {
      record.session.state = "closed";
      this.sessions.delete(sessionId);
    }
  }

  importState(state: MemoryBrowserRuntimeState): void {
    this.sessions.clear();
    for (const record of state.records) {
      this.sessions.set(record.session.sessionId, record);
    }
  }

  exportState(): MemoryBrowserRuntimeState {
    return {
      records: Array.from(this.sessions.values())
    };
  }

  private async evaluatePolicies(
    session: BrowserSession,
    action: Parameters<RuntimePolicy["beforeAction"]>[0]["action"]
  ): Promise<void> {
    for (const policy of this.policies) {
      const decision = await policy.beforeAction({ session, action });
      if (!decision.allowed) {
        throw new BrowserRuntimeError(
          `Action rejected by ${policy.name}: ${decision.reason}`,
          "POLICY_REJECTED"
        );
      }
    }
  }

  private requireRecord(sessionId: string): RuntimeRecord {
    const record = this.sessions.get(sessionId);
    if (!record) {
      throw new BrowserRuntimeError(
        `Unknown browser session: ${sessionId}`,
        "UNKNOWN_SESSION"
      );
    }
    return record;
  }

  private requireFreshSnapshot(
    snapshot: BrowserSnapshot,
    snapshotId: string
  ): void {
    if (snapshot.snapshotId !== snapshotId) {
      throw new BrowserRuntimeError(
        `Stale snapshot: expected ${snapshot.snapshotId}, got ${snapshotId}`,
        "STALE_SNAPSHOT"
      );
    }
  }

  private requireElement(snapshot: BrowserSnapshot, index: number): void {
    if (!snapshot.elements.some((element) => element.index === index)) {
      throw new BrowserRuntimeError(`Unknown element index: ${index}`, "UNSUPPORTED");
    }
  }

  private createSnapshot(
    session: BrowserSession,
    text: string,
    elements: BrowserSnapshot["elements"]
  ): BrowserSnapshot {
    return {
      snapshotId: crypto.randomUUID(),
      capturedAt: new Date().toISOString(),
      url: session.currentUrl,
      title: session.currentUrl ? new URL(session.currentUrl).hostname : null,
      text,
      elements
    };
  }

  private toObservation(
    sessionId: string,
    snapshot: BrowserSnapshot
  ): BrowserObservation {
    return {
      sessionId,
      snapshotId: snapshot.snapshotId,
      snapshot
    };
  }
}

export function createMemoryBrowserRuntime(
  options?: BrowserRuntimeOptions
): BrowserRuntime {
  return new MemoryBrowserRuntime(options);
}

export const createBrowserRuntime = createMemoryBrowserRuntime;
