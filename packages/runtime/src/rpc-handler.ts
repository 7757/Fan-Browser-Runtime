import {
  BrowserRpcMethod,
  JsonRpcErrorCode,
  type BrowserRuntime,
  type JsonRpcFailure,
  type JsonRpcRequest,
  type JsonRpcResponse
} from "@fan-browser-runtime/protocol";
import { BrowserRuntimeError } from "./errors.js";

export function createBrowserRpcHandler(runtime: BrowserRuntime) {
  return async function handleBrowserRpc(
    request: JsonRpcRequest
  ): Promise<JsonRpcResponse> {
    try {
      const result = await dispatch(runtime, request);
      return {
        jsonrpc: "2.0",
        id: request.id,
        result
      };
    } catch (error) {
      return toRpcFailure(request.id, error);
    }
  };
}

async function dispatch(runtime: BrowserRuntime, request: JsonRpcRequest) {
  const params = request.params as Record<string, unknown> | undefined;
  switch (request.method) {
    case BrowserRpcMethod.CreateSession:
      return runtime.createSession();
    case BrowserRpcMethod.Navigate:
      return runtime.navigate(
        requireString(params, "sessionId"),
        requireString(params, "url")
      );
    case BrowserRpcMethod.Observe:
      return runtime.observe(requireString(params, "sessionId"));
    case BrowserRpcMethod.Click:
      return runtime.click(requireString(params, "sessionId"), {
        index: requireNumber(params, "index"),
        snapshotId: requireString(params, "snapshotId")
      });
    case BrowserRpcMethod.Type:
      return runtime.type(requireString(params, "sessionId"), {
        index: requireNumber(params, "index"),
        text: requireString(params, "text"),
        snapshotId: requireString(params, "snapshotId")
      });
    case BrowserRpcMethod.Screenshot:
      return runtime.screenshot(requireString(params, "sessionId"));
    case BrowserRpcMethod.CloseSession:
      await runtime.closeSession(requireString(params, "sessionId"));
      return { closed: true };
    default:
      throw new BrowserRuntimeError(
        `Unknown method: ${request.method}`,
        "UNSUPPORTED"
      );
  }
}

function requireString(
  params: Record<string, unknown> | undefined,
  key: string
): string {
  const value = params?.[key];
  if (typeof value !== "string" || value.length === 0) {
    throw new TypeError(`Expected string param: ${key}`);
  }
  return value;
}

function requireNumber(
  params: Record<string, unknown> | undefined,
  key: string
): number {
  const value = params?.[key];
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new TypeError(`Expected number param: ${key}`);
  }
  return value;
}

function toRpcFailure(id: string | number | null, error: unknown): JsonRpcFailure {
  if (error instanceof BrowserRuntimeError) {
    return {
      jsonrpc: "2.0",
      id,
      error: {
        code: toRpcCode(error.code),
        message: error.message
      }
    };
  }

  if (error instanceof TypeError) {
    return {
      jsonrpc: "2.0",
      id,
      error: {
        code: JsonRpcErrorCode.InvalidParams,
        message: error.message
      }
    };
  }

  return {
    jsonrpc: "2.0",
    id,
    error: {
      code: JsonRpcErrorCode.InternalError,
      message: error instanceof Error ? error.message : "Unknown runtime error"
    }
  };
}

function toRpcCode(code: BrowserRuntimeError["code"]): number {
  switch (code) {
    case "UNKNOWN_SESSION":
      return JsonRpcErrorCode.UnknownSession;
    case "STALE_SNAPSHOT":
      return JsonRpcErrorCode.StaleSnapshot;
    case "POLICY_REJECTED":
      return JsonRpcErrorCode.PolicyRejected;
    case "UNSUPPORTED":
      return JsonRpcErrorCode.MethodNotFound;
  }
}
