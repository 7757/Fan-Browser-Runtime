export class BrowserRuntimeError extends Error {
  constructor(
    message: string,
    readonly code:
      | "UNKNOWN_SESSION"
      | "STALE_SNAPSHOT"
      | "POLICY_REJECTED"
      | "UNSUPPORTED"
  ) {
    super(message);
    this.name = "BrowserRuntimeError";
  }
}
