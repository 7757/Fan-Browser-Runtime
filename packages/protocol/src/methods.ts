export const BrowserRpcMethod = {
  CreateSession: "browser.createSession",
  Navigate: "browser.navigate",
  Observe: "browser.observe",
  Click: "browser.click",
  Type: "browser.type",
  Screenshot: "browser.screenshot",
  CloseSession: "browser.closeSession"
} as const;

export type BrowserRpcMethod =
  (typeof BrowserRpcMethod)[keyof typeof BrowserRpcMethod];
