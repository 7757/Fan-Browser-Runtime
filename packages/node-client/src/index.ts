import {
  BrowserRpcMethod,
  type BrowserObservation,
  type BrowserScreenshot,
  type BrowserSession,
  type JsonRpcRequest,
  type JsonRpcResponse
} from "@fan-browser-runtime/protocol";

export interface BrowserRpcTransport {
  request<T>(request: JsonRpcRequest): Promise<JsonRpcResponse<T>>;
}

export class BrowserRuntimeClient {
  private nextId = 1;

  constructor(private readonly transport: BrowserRpcTransport) {}

  async createSession(): Promise<BrowserSession> {
    return this.call(BrowserRpcMethod.CreateSession);
  }

  async navigate(
    sessionId: string,
    url: string
  ): Promise<BrowserObservation> {
    return this.call(BrowserRpcMethod.Navigate, { sessionId, url });
  }

  async observe(sessionId: string): Promise<BrowserObservation> {
    return this.call(BrowserRpcMethod.Observe, { sessionId });
  }

  async click(
    sessionId: string,
    input: { index: number; snapshotId: string }
  ): Promise<BrowserObservation> {
    return this.call(BrowserRpcMethod.Click, { sessionId, ...input });
  }

  async type(
    sessionId: string,
    input: { index: number; snapshotId: string; text: string }
  ): Promise<BrowserObservation> {
    return this.call(BrowserRpcMethod.Type, { sessionId, ...input });
  }

  async screenshot(sessionId: string): Promise<BrowserScreenshot> {
    return this.call(BrowserRpcMethod.Screenshot, { sessionId });
  }

  async closeSession(sessionId: string): Promise<void> {
    await this.call(BrowserRpcMethod.CloseSession, { sessionId });
  }

  private async call<T>(method: string, params?: unknown): Promise<T> {
    const response = await this.transport.request<T>({
      jsonrpc: "2.0",
      id: this.nextId++,
      method,
      params
    });

    if ("error" in response) {
      throw new Error(response.error.message);
    }

    return response.result;
  }
}

export function createInProcessTransport(
  handler: (request: JsonRpcRequest) => Promise<JsonRpcResponse>
): BrowserRpcTransport {
  return {
    async request<T>(request: JsonRpcRequest): Promise<JsonRpcResponse<T>> {
      return handler(request) as Promise<JsonRpcResponse<T>>;
    }
  };
}
