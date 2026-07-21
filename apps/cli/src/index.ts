#!/usr/bin/env node
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { BrowserRuntimeClient, createInProcessTransport } from "@fan-browser-runtime/node-client";
import {
  MemoryBrowserRuntime,
  createBrowserRpcHandler,
  type MemoryBrowserRuntimeState
} from "fan-browser-runtime";

interface CliState {
  sessionId: string;
  runtime: MemoryBrowserRuntimeState;
}

const statePath = join(process.cwd(), ".fan-browser-runtime-session.json");
const args = process.argv.slice(2);
const command = args[0] ?? "help";
const json = args.includes("--json");

const runtime = new MemoryBrowserRuntime({
  allowPrivateNetwork: args.includes("--allow-private-network")
});
const client = new BrowserRuntimeClient(
  createInProcessTransport(createBrowserRpcHandler(runtime))
);

try {
  switch (command) {
    case "serve":
      print(
        {
          status: "ready",
          transport: "in-process",
          note: "HTTP/stdio server transport will be added with the Electron runtime."
        },
        json
      );
      break;
    case "open":
      await openCommand(args, json);
      break;
    case "observe":
      await observeCommand(json);
      break;
    case "click":
      await clickCommand(args, json);
      break;
    case "type":
      await typeCommand(args, json);
      break;
    case "screenshot":
      await screenshotCommand(args, json);
      break;
    case "help":
    case "--help":
    case "-h":
      printHelp();
      break;
    default:
      throw new Error(`Unknown command: ${command}`);
  }
} catch (error) {
  const message = error instanceof Error ? error.message : "Unknown error";
  if (json) {
    print({ error: message }, true);
  } else {
    console.error(message);
  }
  process.exitCode = 1;
}

async function openCommand(argv: string[], asJson: boolean): Promise<void> {
  const url = argv[1];
  if (!url) {
    throw new Error("Usage: fan-browser-runtime open <url>");
  }
  const session = await client.createSession();
  const observation = await client.navigate(session.sessionId, url);
  await writeState({ sessionId: session.sessionId, runtime: runtime.exportState() });
  print(observation, asJson);
}

async function observeCommand(asJson: boolean): Promise<void> {
  const state = await readState();
  runtime.importState(state.runtime);
  const observation = await client.observe(state.sessionId);
  await writeState({ sessionId: state.sessionId, runtime: runtime.exportState() });
  print(observation, asJson);
}

async function clickCommand(argv: string[], asJson: boolean): Promise<void> {
  const index = Number(argv[1]);
  const snapshotId = getOption(argv, "--snapshot");
  if (!Number.isFinite(index) || !snapshotId) {
    throw new Error("Usage: fan-browser-runtime click <index> --snapshot <snapshotId>");
  }
  const state = await readState();
  runtime.importState(state.runtime);
  const observation = await client.click(state.sessionId, { index, snapshotId });
  await writeState({ sessionId: state.sessionId, runtime: runtime.exportState() });
  print(observation, asJson);
}

async function typeCommand(argv: string[], asJson: boolean): Promise<void> {
  const index = Number(argv[1]);
  const text = argv[2];
  const snapshotId = getOption(argv, "--snapshot");
  if (!Number.isFinite(index) || !text || !snapshotId) {
    throw new Error(
      "Usage: fan-browser-runtime type <index> <text> --snapshot <snapshotId>"
    );
  }
  const state = await readState();
  runtime.importState(state.runtime);
  const observation = await client.type(state.sessionId, {
    index,
    text,
    snapshotId
  });
  await writeState({ sessionId: state.sessionId, runtime: runtime.exportState() });
  print(observation, asJson);
}

async function screenshotCommand(argv: string[], asJson: boolean): Promise<void> {
  const out = getOption(argv, "--out");
  const state = await readState();
  runtime.importState(state.runtime);
  const screenshot = await client.screenshot(state.sessionId);
  if (out) {
    await mkdir(dirname(out), { recursive: true });
    await writeFile(out, Buffer.from(screenshot.dataBase64, "base64"));
    print({ ...screenshot, out }, asJson);
    return;
  }
  print(screenshot, asJson);
}

async function readState(): Promise<CliState> {
  try {
    return JSON.parse(await readFile(statePath, "utf8")) as CliState;
  } catch {
    throw new Error("No active session. Run `fan-browser-runtime open <url>` first.");
  }
}

async function writeState(state: CliState): Promise<void> {
  await writeFile(statePath, JSON.stringify(state, null, 2));
}

function getOption(argv: string[], name: string): string | null {
  const index = argv.indexOf(name);
  if (index === -1) {
    return null;
  }
  return argv[index + 1] ?? null;
}

function print(value: unknown, asJson: boolean): void {
  if (asJson) {
    console.log(JSON.stringify(value, null, 2));
    return;
  }

  if (isObservation(value)) {
    console.log(`session: ${value.sessionId}`);
    console.log(`snapshot: ${value.snapshotId}`);
    console.log(`url: ${value.snapshot.url ?? ""}`);
    console.log(`title: ${value.snapshot.title ?? ""}`);
    console.log("");
    for (const element of value.snapshot.elements) {
      console.log(
        `[${element.index}] ${element.role ?? "element"} ${element.name ?? element.text}`
      );
    }
    console.log("");
    console.log(value.snapshot.text);
    return;
  }

  console.log(JSON.stringify(value, null, 2));
}

function isObservation(value: unknown): value is {
  sessionId: string;
  snapshotId: string;
  snapshot: {
    url: string | null;
    title: string | null;
    text: string;
    elements: Array<{ index: number; role: string | null; name: string | null; text: string }>;
  };
} {
  return Boolean(
    value &&
      typeof value === "object" &&
      "snapshotId" in value &&
      "snapshot" in value
  );
}

function printHelp(): void {
  const bin = fileURLToPath(import.meta.url).endsWith("index.ts")
    ? "npm run dev --"
    : "fan-browser-runtime";
  console.log(`Usage:
  ${bin} serve
  ${bin} open <url> [--allow-private-network] [--json]
  ${bin} observe [--json]
  ${bin} click <index> --snapshot <snapshotId> [--json]
  ${bin} type <index> <text> --snapshot <snapshotId> [--json]
  ${bin} screenshot [--out <path>] [--json]`);
}
