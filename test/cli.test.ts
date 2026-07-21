import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { execa } from "execa";

const cliPath = join(process.cwd(), "apps/cli/src/index.ts");

test("cli runs open, observe, click, and screenshot", async () => {
  const cwd = await mkdtemp(join(tmpdir(), "fan-browser-runtime-cli-"));
  const screenshotPath = join(cwd, "artifacts", "shot.png");
  await mkdir(join(cwd, "artifacts"), { recursive: true });

  const open = await execa("tsx", [cliPath, "open", "https://example.com", "--json"], {
    cwd
  });
  const opened = JSON.parse(open.stdout);
  assert.equal(opened.snapshot.url, "https://example.com");

  const observe = await execa("tsx", [cliPath, "observe", "--json"], { cwd });
  const observed = JSON.parse(observe.stdout);
  assert.equal(observed.snapshotId, opened.snapshotId);

  const click = await execa(
    "tsx",
    [cliPath, "click", "1", "--snapshot", observed.snapshotId, "--json"],
    { cwd }
  );
  const clicked = JSON.parse(click.stdout);
  assert.match(clicked.snapshot.text, /Clicked element 1/);

  await execa("tsx", [cliPath, "screenshot", "--out", screenshotPath, "--json"], {
    cwd
  });
  const png = await readFile(screenshotPath);
  assert.ok(png.length > 0);
});
