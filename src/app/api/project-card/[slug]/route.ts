import { NextResponse } from "next/server";
import { loadPortfolioProjectBySlug } from "@/lib/portfolio-projects";

type RouteContext = {
  params: {
    slug?: string;
  };
};

function normalizeSlug(rawSlug: string): string {
  return rawSlug.toLowerCase().trim();
}

function isValidSlug(slug: string): boolean {
  return /^[a-z0-9-]+$/.test(slug);
}

export async function GET(_request: Request, { params }: RouteContext) {
  const slug = normalizeSlug(params.slug ?? "");
  if (!slug || !isValidSlug(slug)) {
    return NextResponse.json({ error: "Invalid project slug." }, { status: 400 });
  }

  const project = await loadPortfolioProjectBySlug(slug);
  if (!project) {
    return NextResponse.json({ error: "Project not found." }, { status: 404 });
  }

  return NextResponse.json({
    project
  });
}
