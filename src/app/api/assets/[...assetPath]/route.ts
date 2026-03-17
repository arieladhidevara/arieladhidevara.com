import { createReadStream, promises as fs } from "node:fs";
import path from "node:path";
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

type RouteContext = {
  params: {
    assetPath?: string[];
  };
};

type ResponseMeta = {
  contentType: string;
  contentEncoding?: string;
};

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
    return NextResponse.json({ error: "Asset not found" }, { status: 404 });
  }

  if (!stat.isFile()) {
    return NextResponse.json({ error: "Asset not found" }, { status: 404 });
  }

  const meta = responseMetaFor(assetPath);
  const headers: Record<string, string> = {
    "Content-Type": meta.contentType,
    "Cache-Control": "public, max-age=60, stale-while-revalidate=300"
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