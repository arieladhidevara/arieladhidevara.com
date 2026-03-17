const ABSOLUTE_URL_PATTERN = /^https?:\/\//i;
const LOCAL_ASSET_PREFIX = "/api/assets";

function stripTrailingSlashes(value: string): string {
  return value.replace(/\/+$/, "");
}

export function resolveAssetUrl(input?: string): string {
  const raw = (input ?? "").trim();
  if (!raw) return "";
  if (ABSOLUTE_URL_PATTERN.test(raw)) return raw;

  const normalized = raw.replace(/\\/g, "/");
  const configuredBase = stripTrailingSlashes((process.env.NEXT_PUBLIC_ASSET_BASE_URL ?? "").trim());

  let relativePath = normalized;
  if (normalized.startsWith(`${LOCAL_ASSET_PREFIX}/`)) {
    relativePath = normalized.slice(LOCAL_ASSET_PREFIX.length + 1);
  } else if (normalized.startsWith(LOCAL_ASSET_PREFIX)) {
    relativePath = normalized.slice(LOCAL_ASSET_PREFIX.length);
  }

  relativePath = relativePath.replace(/^\/+/, "");
  if (!relativePath) return configuredBase ? `${configuredBase}/` : `${LOCAL_ASSET_PREFIX}/`;

  if (configuredBase) {
    return `${configuredBase}/${relativePath}`;
  }

  return `${LOCAL_ASSET_PREFIX}/${relativePath}`;
}
