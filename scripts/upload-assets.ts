import { promises as fs } from "node:fs";
import path from "node:path";

const ASSETS_ROOT = path.resolve("assets-local");
const DEFAULT_MAX_INLINE_SIZE_BYTES = 2 * 1024 * 1024;

type UploadRecord = {
  localPath: string;
  blobPath: string;
  sizeBytes: number;
  uploaded: boolean;
  url?: string;
};

async function walk(dir: string): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walk(full)));
    } else {
      files.push(full);
    }
  }

  return files;
}

function toBlobPath(projectSlug: string, absoluteFilePath: string): string {
  const projectRoot = path.join(ASSETS_ROOT, projectSlug);
  const relative = path.relative(projectRoot, absoluteFilePath).replace(/\\/g, "/");
  return `${projectSlug}/${relative}`;
}

async function uploadFileStub(blobPath: string, fileBuffer: Buffer): Promise<string> {
  const blobBaseUrl = process.env.BLOB_BASE_URL;

  if (!blobBaseUrl) {
    throw new Error("BLOB_BASE_URL is not set. Configure your Blob provider before real uploads.");
  }

  // Placeholder for provider-specific upload call.
  // This keeps foundation code in place without coupling to a vendor SDK yet.
  void fileBuffer;

  return `${blobBaseUrl.replace(/\/$/, "")}/${blobPath}`;
}

export async function uploadProjectAssets(projectSlug: string): Promise<UploadRecord[]> {
  const projectDir = path.join(ASSETS_ROOT, projectSlug);

  await fs.access(projectDir);

  const filePaths = await walk(projectDir);
  const results: UploadRecord[] = [];

  for (const filePath of filePaths) {
    const stat = await fs.stat(filePath);
    const blobPath = toBlobPath(projectSlug, filePath);

    const shouldUpload = stat.size > DEFAULT_MAX_INLINE_SIZE_BYTES || /\.(mp4|mov|mkv|webm|png|jpg|jpeg)$/i.test(filePath);

    if (!shouldUpload) {
      results.push({
        localPath: filePath,
        blobPath,
        sizeBytes: stat.size,
        uploaded: false,
      });
      continue;
    }

    const buffer = await fs.readFile(filePath);
    const url = await uploadFileStub(blobPath, buffer);

    results.push({
      localPath: filePath,
      blobPath,
      sizeBytes: stat.size,
      uploaded: true,
      url,
    });
  }

  return results;
}

async function main(): Promise<void> {
  const projectSlug = process.argv[2];

  if (!projectSlug) {
    throw new Error("Usage: ts-node scripts/upload-assets.ts <project-slug>");
  }

  const results = await uploadProjectAssets(projectSlug);
  console.log(JSON.stringify(results, null, 2));
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
