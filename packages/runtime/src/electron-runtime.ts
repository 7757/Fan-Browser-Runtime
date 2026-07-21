import type {
  BrowserRuntime,
  BrowserRuntimeOptions
} from "@fan-browser-runtime/protocol";

export async function createElectronBrowserRuntime(
  _options: BrowserRuntimeOptions = {}
): Promise<BrowserRuntime> {
  throw new Error(
    "Electron runtime is not bundled yet. Import only provenance-cleared code before enabling this adapter."
  );
}
