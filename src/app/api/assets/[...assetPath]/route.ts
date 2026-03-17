import { createReadStream, promises as fs } from "node:fs";
import path from "node:path";
import { gunzipSync } from "node:zlib";
import { NextResponse } from "next/server";

const ASSETS_ROOT = path.resolve(process.cwd(), "assets-local");

const CONTENT_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".avif": "image/avif",
  ".svg": "image/svg+xml",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".mov": "video/quicktime",
  ".mkv": "video/x-matroska",
  ".js": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".wasm": "application/wasm",
  ".wav": "audio/wav",
  ".ico": "image/x-icon",
  ".html": "text/html; charset=utf-8"
};

const SAFE_SEGMENT_PATTERN = /^[a-zA-Z0-9 _().%+-]+$/;
const DEFAULT_CACHE_CONTROL = "public, max-age=60, stale-while-revalidate=300";

type RouteContext = {
  params: {
    assetPath?: string[];
  };
};

type ResponseMeta = {
  contentType: string;
  contentEncoding?: string;
};

function stripTrailingSlashes(value: string): string {
  return value.replace(/\/+$/, "");
}

function resolveRemoteBaseUrls(): string[] {
  // Prefer explicitly public URL first, then optional fallback.
  const candidates = [process.env.NEXT_PUBLIC_ASSET_BASE_URL, process.env.BLOB_BASE_URL];
  const unique = new Set<string>();
  const baseUrls: string[] = [];

  for (const candidate of candidates) {
    const normalized = stripTrailingSlashes((candidate ?? "").trim());
    if (!normalized || unique.has(normalized)) continue;

    try {
      const parsed = new URL(normalized);
      // This is the S3 API endpoint, not a public asset origin.
      if (parsed.hostname.endsWith(".r2.cloudflarestorage.com")) {
        continue;
      }
    } catch {
      continue;
    }

    unique.add(normalized);
    baseUrls.push(normalized);
  }

  return baseUrls;
}

function buildRemoteAssetUrl(baseUrl: string, segments: string[]): string {
  const encodedPath = segments.map((segment) => encodeURIComponent(segment)).join("/");
  return `${baseUrl}/${encodedPath}`;
}

function resolveRemoteSegments(segments: string[]): { targetSegments: string[]; isVirtualFramework: boolean } {
  if (segments.length === 0) {
    return { targetSegments: segments, isVirtualFramework: false };
  }

  const targetSegments = [...segments];
  const lastIndex = targetSegments.length - 1;
  const lastSegment = targetSegments[lastIndex]?.toLowerCase() ?? "";

  if (lastSegment.endsWith(".framework.js")) {
    targetSegments[lastIndex] = `${targetSegments[lastIndex]}.gz`;
    return { targetSegments, isVirtualFramework: true };
  }

  return { targetSegments, isVirtualFramework: false };
}

function isInMySkinUnityIndex(segments: string[]): boolean {
  if (segments.length === 0) return false;
  const joined = segments.join("/").toLowerCase();
  return joined.endsWith("inmyskin-webgl/index.html");
}

function rewriteInMySkinIndex(html: string): string {
  // Use virtual framework path (without .gz) to avoid gzip-header dependency
  // on script loading while keeping other asset URLs intact.
  return html.replace(
    /frameworkUrl:\s*buildUrl\s*\+\s*"\/inmyskin\.framework\.js\.gz"/g,
    'frameworkUrl: buildUrl + "/inmyskin.framework.js"'
  );
}

function buildAssetPath(segments: string[]): string | null {
  let currentPath = ASSETS_ROOT;

  for (const rawSegment of segments) {
    const segment = rawSegment.trim();
    if (!segment || segment === "." || segment === "..") return null;
    if (segment.includes("/") || segment.includes("\\")) return null;
    if (!SAFE_SEGMENT_PATTERN.test(segment)) return null;

    currentPath = path.join(currentPath, segment);
  }

  return path.normalize(currentPath);
}

function isWithinRoot(root: string, candidatePath: string): boolean {
  const relative = path.relative(root, candidatePath);
  return relative === "" || (!relative.startsWith("..") && !path.isAbsolute(relative));
}

function responseMetaFor(filePath: string): ResponseMeta {
  const lowerPath = filePath.toLowerCase();

  if (lowerPath.endsWith(".js.gz")) {
    return { contentType: CONTENT_TYPES[".js"], contentEncoding: "gzip" };
  }
  if (lowerPath.endsWith(".wasm.gz")) {
    return { contentType: CONTENT_TYPES[".wasm"], contentEncoding: "gzip" };
  }
  if (lowerPath.endsWith(".json.gz")) {
    return { contentType: CONTENT_TYPES[".json"], contentEncoding: "gzip" };
  }
  if (lowerPath.endsWith(".data.gz")) {
    return { contentType: "application/octet-stream", contentEncoding: "gzip" };
  }
  if (lowerPath.endsWith(".gz")) {
    return { contentType: "application/octet-stream", contentEncoding: "gzip" };
  }

  const extension = path.extname(lowerPath);
  return { contentType: CONTENT_TYPES[extension] ?? "application/octet-stream" };
}

function toSafeWebStream(stream: ReturnType<typeof createReadStream>): ReadableStream<Uint8Array> {
  let controller: ReadableStreamDefaultController<Uint8Array> | null = null;
  let finished = false;

  const cleanup = () => {
    stream.off("data", onData);
    stream.off("end", onEnd);
    stream.off("error", onError);
  };

  const closeSafely = () => {
    if (finished) return;
    finished = true;
    cleanup();
    try {
      controller?.close();
    } catch {
      // Ignore close races.
    }
  };

  const errorSafely = (error: unknown) => {
    if (finished) return;
    finished = true;
    cleanup();
    try {
      controller?.error(error);
    } catch {
      // Ignore error races.
    }
  };

  const abortSafely = () => {
    if (finished) return;
    finished = true;
    cleanup();
    stream.destroy();
    try {
      controller?.close();
    } catch {
      // Ignore close races.
    }
  };

  const onData = (chunk: string | Buffer) => {
    if (finished) return;

    const bytes = typeof chunk === "string" ? new TextEncoder().encode(chunk) : new Uint8Array(chunk);

    try {
      controller?.enqueue(bytes);
    } catch {
      abortSafely();
    }
  };

  const onEnd = () => {
    closeSafely();
  };

  const onError = (error: unknown) => {
    errorSafely(error);
  };

  return new ReadableStream<Uint8Array>({
    start(webController) {
      controller = webController;
      stream.on("data", onData);
      stream.once("end", onEnd);
      stream.once("error", onError);
    },
    cancel() {
      abortSafely();
    }
  });
}

function startsWithGzip(bytes: Uint8Array): boolean {
  return bytes.length >= 2 && bytes[0] === 0x1f && bytes[1] === 0x8b;
}

function looksLikeUnityFrameworkScript(bytes: Uint8Array): boolean {
  const previewLength = Math.min(bytes.length, 512);
  if (previewLength === 0) return false;

  const preview = new TextDecoder().decode(bytes.subarray(0, previewLength));
  return preview.includes("unityFramework");
}

async function inspectAndRebuildBody(
  body: ReadableStream<Uint8Array>
): Promise<{ stream: ReadableStream<Uint8Array>; looksGzipped: boolean }> {
  const reader = body.getReader();
  const buffered: Uint8Array[] = [];
  let bufferedBytes = 0;

  // Read enough bytes for a reliable gzip signature check.
  while (bufferedBytes < 2) {
    const { done, value } = await reader.read();
    if (done) break;
    if (!value || value.length === 0) continue;
    buffered.push(value);
    bufferedBytes += value.length;
  }

  const probeBytes = new Uint8Array(Math.min(bufferedBytes, 2));
  if (probeBytes.length > 0) {
    let offset = 0;
    for (const chunk of buffered) {
      const remaining = probeBytes.length - offset;
      if (remaining <= 0) break;
      const take = Math.min(remaining, chunk.length);
      probeBytes.set(chunk.subarray(0, take), offset);
      offset += take;
    }
  }

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for (const chunk of buffered) {
          controller.enqueue(chunk);
        }

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          if (!value || value.length === 0) continue;
          controller.enqueue(value);
        }

        controller.close();
      } catch (error) {
        controller.error(error);
      }
    },
    cancel(reason) {
      return reader.cancel(reason);
    }
  });

  return { stream, looksGzipped: startsWithGzip(probeBytes) };
}

async function serveRemoteAsset(segments: string[], assetPath: string): Promise<NextResponse | null> {
  const baseUrls = resolveRemoteBaseUrls();
  if (baseUrls.length === 0) return null;

  const remoteResolution = resolveRemoteSegments(segments);

  for (const baseUrl of baseUrls) {
    const remoteUrl = buildRemoteAssetUrl(baseUrl, remoteResolution.targetSegments);

    let upstreamResponse: Response;
    try {
      upstreamResponse = await fetch(remoteUrl, {
        method: "GET",
        cache: "no-store"
      });
    } catch {
      continue;
    }

    if (!upstreamResponse.ok || !upstreamResponse.body) {
      continue;
    }

    if (isInMySkinUnityIndex(segments)) {
      const html = await upstreamResponse.text();
      const rewritten = rewriteInMySkinIndex(html);

      return new NextResponse(rewritten, {
        status: upstreamResponse.status,
        headers: {
          "Content-Type": CONTENT_TYPES[".html"],
          "Cache-Control": DEFAULT_CACHE_CONTROL
        }
      });
    }

    const meta = responseMetaFor(assetPath);
    if (remoteResolution.isVirtualFramework) {
      const rawBytes = new Uint8Array(await upstreamResponse.arrayBuffer());
      if (rawBytes.length === 0) {
        continue;
      }

      let scriptBytes = rawBytes;
      if (startsWithGzip(rawBytes)) {
        try {
          scriptBytes = new Uint8Array(gunzipSync(rawBytes));
        } catch {
          continue;
        }
      }

      if (!looksLikeUnityFrameworkScript(scriptBytes)) {
        continue;
      }

      return new NextResponse(scriptBytes, {
        status: upstreamResponse.status,
        headers: {
          "Content-Type": CONTENT_TYPES[".js"],
          "Cache-Control": DEFAULT_CACHE_CONTROL,
          "Content-Length": String(scriptBytes.byteLength)
        }
      });
    }

    const isGzipAsset = assetPath.toLowerCase().endsWith(".gz");
    const isFrameworkGzip = assetPath.toLowerCase().endsWith(".framework.js.gz");

    if (isFrameworkGzip) {
      const bytes = new Uint8Array(await upstreamResponse.arrayBuffer());
      if (bytes.length === 0) {
        continue;
      }

      const looksGzipped = startsWithGzip(bytes);
      if (!looksGzipped && !looksLikeUnityFrameworkScript(bytes)) {
        continue;
      }

      const headers: Record<string, string> = {
        "Content-Type": meta.contentType,
        "Cache-Control": upstreamResponse.headers.get("cache-control") ?? DEFAULT_CACHE_CONTROL,
        "Content-Length": String(bytes.byteLength)
      };

      if (looksGzipped) {
        headers["Content-Encoding"] = "gzip";
        headers["Vary"] = "Accept-Encoding";
      }

      return new NextResponse(bytes, {
        status: upstreamResponse.status,
        headers
      });
    }

    const bodyResult = isGzipAsset
      ? await inspectAndRebuildBody(upstreamResponse.body)
      : { stream: upstreamResponse.body, looksGzipped: false };

    const headers: Record<string, string> = {
      "Content-Type": isGzipAsset ? meta.contentType : upstreamResponse.headers.get("content-type") ?? meta.contentType,
      "Cache-Control": upstreamResponse.headers.get("cache-control") ?? DEFAULT_CACHE_CONTROL
    };

    const upstreamEncoding = (upstreamResponse.headers.get("content-encoding") ?? "").toLowerCase();

    if (isGzipAsset) {
      if (bodyResult.looksGzipped) {
        headers["Content-Encoding"] = "gzip";
        headers["Vary"] = "Accept-Encoding";
      }
    } else if (upstreamEncoding) {
      headers["Content-Encoding"] = upstreamEncoding;
      headers["Vary"] = "Accept-Encoding";
    }

    return new NextResponse(bodyResult.stream, {
      status: upstreamResponse.status,
      headers
    });
  }

  return null;
}

export async function GET(_request: Request, { params }: RouteContext) {
  const segments = params.assetPath ?? [];

  if (segments.length === 0) {
    return NextResponse.json({ error: "Asset not found" }, { status: 404 });
  }

  const assetPath = buildAssetPath(segments);

  if (!assetPath || !isWithinRoot(ASSETS_ROOT, assetPath)) {
    return NextResponse.json({ error: "Invalid asset path" }, { status: 400 });
  }

  let stat;
  try {
    stat = await fs.stat(assetPath);
  } catch {
    const remoteResponse = await serveRemoteAsset(segments, assetPath);
    if (remoteResponse) {
      return remoteResponse;
    }

    return NextResponse.json({ error: "Asset not found" }, { status: 404 });
  }

  if (!stat.isFile()) {
    const remoteResponse = await serveRemoteAsset(segments, assetPath);
    if (remoteResponse) {
      return remoteResponse;
    }

    return NextResponse.json({ error: "Asset not found" }, { status: 404 });
  }

  const meta = responseMetaFor(assetPath);
  const headers: Record<string, string> = {
    "Content-Type": meta.contentType,
    "Cache-Control": DEFAULT_CACHE_CONTROL
  };

  if (meta.contentEncoding) {
    headers["Content-Encoding"] = meta.contentEncoding;
    headers["Vary"] = "Accept-Encoding";
  } else {
    headers["Content-Length"] = String(stat.size);
  }

  try {
    const nodeStream = createReadStream(assetPath);
    const webStream = toSafeWebStream(nodeStream);

    return new NextResponse(webStream, {
      status: 200,
      headers
    });
  } catch {
    return NextResponse.json({ error: "Unable to read asset" }, { status: 500 });
  }
}
