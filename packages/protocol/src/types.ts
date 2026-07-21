export type BrowserSessionState =
  | "creating"
  | "ready"
  | "paused"
  | "human-control"
  | "closed";

export interface CreateSessionOptions {
  visible?: boolean;
  partition?: string;
}

export interface BrowserRuntimeOptions {
  visible?: boolean;
  partition?: string;
  allowPrivateNetwork?: boolean;
  policies?: RuntimePolicy[];
}

export interface BrowserSession {
  sessionId: string;
  state: BrowserSessionState;
  createdAt: string;
  currentUrl: string | null;
}

export interface BrowserElement {
  index: number;
  role: string | null;
  name: string | null;
  text: string;
  selector?: string;
}

export interface BrowserSnapshot {
  snapshotId: string;
  capturedAt: string;
  url: string | null;
  title: string | null;
  text: string;
  elements: BrowserElement[];
}

export interface BrowserObservation {
  sessionId: string;
  snapshotId: string;
  snapshot: BrowserSnapshot;
}

export type BrowserAction =
  | {
      type: "navigate";
      url: string;
      requireSnapshotId?: string;
    }
  | {
      type: "click";
      index: number;
      requireSnapshotId: string;
    }
  | {
      type: "type";
      index: number;
      text: string;
      requireSnapshotId: string;
    }
  | {
      type: "handoff";
      reason: string;
      requireSnapshotId?: string;
    };

export type RuntimePolicyDecision =
  | {
      allowed: true;
    }
  | {
      allowed: false;
      reason: string;
    };

export interface RuntimePolicyContext {
  session: BrowserSession;
  action: BrowserAction;
}

export interface RuntimePolicy {
  name: string;
  beforeAction(
    context: RuntimePolicyContext
  ): Promise<RuntimePolicyDecision> | RuntimePolicyDecision;
}

export type BrowserEvent =
  | {
      type: "session.created";
      session: BrowserSession;
    }
  | {
      type: "session.updated";
      session: BrowserSession;
    }
  | {
      type: "observation.created";
      observation: BrowserObservation;
    }
  | {
      type: "action.completed";
      sessionId: string;
      action: BrowserAction;
    }
  | {
      type: "action.rejected";
      sessionId: string;
      action: BrowserAction;
      reason: string;
    };

export interface BrowserRuntime {
  createSession(options?: CreateSessionOptions): Promise<BrowserSession>;
  getSession(sessionId: string): Promise<BrowserSession | null>;
  navigate(sessionId: string, url: string): Promise<BrowserObservation>;
  observe(sessionId: string): Promise<BrowserObservation>;
  click(
    sessionId: string,
    input: { index: number; snapshotId: string }
  ): Promise<BrowserObservation>;
  type(
    sessionId: string,
    input: { index: number; text: string; snapshotId: string }
  ): Promise<BrowserObservation>;
  screenshot(sessionId: string): Promise<BrowserScreenshot>;
  closeSession(sessionId: string): Promise<void>;
}

export interface BrowserScreenshot {
  sessionId: string;
  mimeType: "image/png";
  dataBase64: string;
}
