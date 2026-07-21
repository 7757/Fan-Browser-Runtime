export interface JsonRpcRequest<TParams = unknown> {
  jsonrpc: "2.0";
  id: string | number;
  method: string;
  params?: TParams;
}

export interface JsonRpcSuccess<TResult = unknown> {
  jsonrpc: "2.0";
  id: string | number;
  result: TResult;
}

export interface JsonRpcFailure {
  jsonrpc: "2.0";
  id: string | number | null;
  error: {
    code: number;
    message: string;
    data?: unknown;
  };
}

export type JsonRpcResponse<TResult = unknown> =
  | JsonRpcSuccess<TResult>
  | JsonRpcFailure;

export const JsonRpcErrorCode = {
  ParseError: -32700,
  InvalidRequest: -32600,
  MethodNotFound: -32601,
  InvalidParams: -32602,
  InternalError: -32603,
  StaleSnapshot: -32001,
  PolicyRejected: -32002,
  UnknownSession: -32003
} as const;
