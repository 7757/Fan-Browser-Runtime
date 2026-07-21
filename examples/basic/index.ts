import { createMemoryBrowserRuntime } from "fan-browser-runtime";

const runtime = createMemoryBrowserRuntime();
const session = await runtime.createSession();
const firstObservation = await runtime.observe(session.sessionId);

const secondObservation = await runtime.navigate(
  session.sessionId,
  "https://example.com"
);

await runtime.click(session.sessionId, {
  index: 1,
  snapshotId: secondObservation.snapshotId
});

console.log(JSON.stringify({ session, firstObservation, secondObservation }, null, 2));
