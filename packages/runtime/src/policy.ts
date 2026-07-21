import type {
  BrowserAction,
  BrowserRuntimeOptions,
  RuntimePolicy,
  RuntimePolicyDecision
} from "@fan-browser-runtime/protocol";

const defaultAllowedProtocols = new Set(["http:", "https:"]);

export function createDefaultPolicies(
  options: BrowserRuntimeOptions = {}
): RuntimePolicy[] {
  return [
    {
      name: "default-url-policy",
      beforeAction({ action }) {
        if (action.type !== "navigate") {
          return { allowed: true };
        }
        return evaluateNavigate(action, options);
      }
    }
  ];
}

function evaluateNavigate(
  action: Extract<BrowserAction, { type: "navigate" }>,
  options: BrowserRuntimeOptions
): RuntimePolicyDecision {
  let parsed: URL;
  try {
    parsed = new URL(action.url);
  } catch {
    return { allowed: false, reason: `Invalid URL: ${action.url}` };
  }

  if (!defaultAllowedProtocols.has(parsed.protocol)) {
    return {
      allowed: false,
      reason: `Blocked protocol: ${parsed.protocol}`
    };
  }

  if (!options.allowPrivateNetwork && isPrivateHost(parsed.hostname)) {
    return {
      allowed: false,
      reason: `Blocked private network host: ${parsed.hostname}`
    };
  }

  return { allowed: true };
}

function isPrivateHost(hostname: string): boolean {
  const normalized = hostname.toLowerCase();
  if (
    normalized === "localhost" ||
    normalized.endsWith(".localhost") ||
    normalized === "0.0.0.0"
  ) {
    return true;
  }

  if (normalized.startsWith("127.") || normalized.startsWith("10.")) {
    return true;
  }

  if (normalized.startsWith("192.168.")) {
    return true;
  }

  const match = /^172\.(\d+)\./.exec(normalized);
  if (match) {
    const secondOctet = Number(match[1]);
    return secondOctet >= 16 && secondOctet <= 31;
  }

  return false;
}
