import assert from "node:assert/strict";
import test from "node:test";
import { createBrowserRpcHandler, createMemoryBrowserRuntime } from "fan-browser-runtime";
import { BrowserRpcMethod } from "@fan-browser-runtime/protocol";

test("memory runtime rejects stale snapshot actions", async () => {
  const runtime = createMemoryBrowserRuntime();
  const session = await runtime.createSession();
  const first = await runtime.navigate(session.sessionId, "https://example.com");
  const second = await runtime.click(session.sessionId, {
    index: 1,
    snapshotId: first.snapshotId
  });

  await assert.rejects(
    runtime.click(session.sessionId, {
      index: 1,
      snapshotId: first.snapshotId
    }),
    /Stale snapshot/
  );
  assert.notEqual(first.snapshotId, second.snapshotId);
});

test("default policy blocks unsafe protocols and private hosts", async () => {
  const runtime = createMemoryBrowserRuntime();
  const session = await runtime.createSession();

  await assert.rejects(
    runtime.navigate(session.sessionId, "file:///etc/passwd"),
    /Blocked protocol/
  );
  await assert.rejects(
    runtime.navigate(session.sessionId, "http://localhost:3000"),
    /Blocked private network/
  );
});

test("private network can be explicitly allowed", async () => {
  const runtime = createMemoryBrowserRuntime({ allowPrivateNetwork: true });
  const session = await runtime.createSession();
  const observation = await runtime.navigate(
    session.sessionId,
    "http://localhost:3000"
  );

  assert.equal(observation.snapshot.url, "http://localhost:3000");
});

test("json-rpc handler returns structured stale snapshot errors", async () => {
  const runtime = createMemoryBrowserRuntime();
  const handler = createBrowserRpcHandler(runtime);

  const created = await handler({
    jsonrpc: "2.0",
    id: 1,
    method: BrowserRpcMethod.CreateSession
  });
  assert.ok("result" in created);

  const sessionId = created.result.sessionId;
  const observed = await handler({
    jsonrpc: "2.0",
    id: 2,
    method: BrowserRpcMethod.Navigate,
    params: { sessionId, url: "https://example.com" }
  });
  assert.ok("result" in observed);

  await handler({
    jsonrpc: "2.0",
    id: 3,
    method: BrowserRpcMethod.Click,
    params: { sessionId, index: 1, snapshotId: observed.result.snapshotId }
  });

  const stale = await handler({
    jsonrpc: "2.0",
    id: 4,
    method: BrowserRpcMethod.Click,
    params: { sessionId, index: 1, snapshotId: observed.result.snapshotId }
  });

  assert.ok("error" in stale);
  assert.equal(stale.error.code, -32001);
});
