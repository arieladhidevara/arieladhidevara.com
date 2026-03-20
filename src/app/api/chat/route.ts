import { NextResponse } from "next/server";
import { loadPortfolioProjects } from "@/lib/portfolio-projects";

export const runtime = "nodejs";

type ChatRole = "user" | "assistant";

type ChatHistoryTurn = {
  role: ChatRole;
  text: string;
};

type GeminiPart = {
  text?: string;
};

type GeminiCandidate = {
  content?: {
    parts?: GeminiPart[];
  };
};

type GeminiErrorPayload = {
  error?: {
    message?: string;
  };
};

const GEMINI_MODEL = (process.env.GEMINI_MODEL ?? "gemini-2.5-flash-lite").trim();
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;
const SITE_DOMAIN = "arieladhidevara.com";
const WORK_URL_PREFIX = `${SITE_DOMAIN}/work`;
const OUT_OF_SCOPE_REPLY = "Sorry, that information is not currently available on Ariel's website.";
const THINKING_QUESTION_PATTERN =
  /(how.*(ariel.*)?(think|thinking|approach|decide|decision|process|mindset|philosophy|strategy)|what is ariel'?s approach|cara.*berpikir|gimana.*berpikir)/i;
const STOP_WORDS = new Set([
  "the",
  "and",
  "for",
  "with",
  "from",
  "that",
  "this",
  "about",
  "what",
  "when",
  "where",
  "which",
  "whose",
  "does",
  "how",
  "who",
  "into",
  "onto",
  "your",
  "have",
  "has",
  "been",
  "were",
  "also",
  "just",
  "over",
  "more",
  "than",
  "into",
  "want",
  "need",
  "ariel"
]);

type EvidenceCandidate = {
  slug: string;
  title: string;
  oneLiner: string;
  score: number;
};

function sanitizeMessage(input: unknown, maxLength = 1200): string {
  if (typeof input !== "string") return "";
  return input.replace(/\s+/g, " ").trim().slice(0, maxLength);
}

function tokenize(value: string): string[] {
  return value
    .toLowerCase()
    .split(/[^a-z0-9]+/g)
    .map((part) => part.trim())
    .filter((part) => part.length > 2 && !STOP_WORDS.has(part));
}

function extractLinkedSlugs(reply: string): Set<string> {
  const matches = reply.matchAll(/(?:https?:\/\/)?(?:www\.)?arieladhidevara\.com\/work\/([a-z0-9-]+)|\/work\/([a-z0-9-]+)/gi);
  const slugs = new Set<string>();

  for (const match of matches) {
    const slug = (match[1] ?? match[2] ?? "").toLowerCase().trim();
    if (slug) slugs.add(slug);
  }

  return slugs;
}

function rankEvidenceProjects(
  question: string,
  projects: Awaited<ReturnType<typeof loadPortfolioProjects>>
): EvidenceCandidate[] {
  const questionTokens = tokenize(question);
  const scored = projects
    .map((project) => {
      const haystack = [
        project.title,
        project.oneLiner,
        project.summary,
        project.category,
        project.type,
        ...project.tags,
        ...project.tools
      ].join(" ");
      const haystackTokens = new Set(tokenize(haystack));

      let score = 0;
      for (const token of questionTokens) {
        if (haystackTokens.has(token)) score += 1;
      }

      const lowerQuestion = question.toLowerCase();
      if (lowerQuestion.includes("ai") && haystack.toLowerCase().includes("ai")) score += 1;
      if (lowerQuestion.includes("architecture") && haystack.toLowerCase().includes("architect")) score += 1;
      if (lowerQuestion.includes("interactive") && haystack.toLowerCase().includes("interactive")) score += 1;

      return {
        slug: project.slug,
        title: project.title,
        oneLiner: project.oneLiner,
        score
      };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title));

  if (scored.length > 0) {
    return scored.slice(0, 4);
  }

  return projects.slice(0, 3).map((project) => ({
    slug: project.slug,
    title: project.title,
    oneLiner: project.oneLiner,
    score: 0
  }));
}

function ensureEvidenceLinksForThinkingQuestion(
  reply: string,
  question: string,
  projects: Awaited<ReturnType<typeof loadPortfolioProjects>>
): string {
  if (!THINKING_QUESTION_PATTERN.test(question)) return reply;

  const linkedSlugs = extractLinkedSlugs(reply);
  if (linkedSlugs.size >= 2) return reply;

  const ranked = rankEvidenceProjects(question, projects);
  const candidates = ranked.filter((project) => !linkedSlugs.has(project.slug)).slice(0, 3);
  if (candidates.length === 0) return reply;

  const evidenceLines = candidates.map(
    (project) => `- ${project.title} (${project.oneLiner}) -> ${WORK_URL_PREFIX}/${project.slug}`
  );

  return `${reply.trim()}\n\nSupporting Projects:\n${evidenceLines.join("\n")}`;
}

function normalizeHistory(input: unknown): ChatHistoryTurn[] {
  if (!Array.isArray(input)) return [];

  const turns: ChatHistoryTurn[] = [];
  for (const item of input) {
    if (!item || typeof item !== "object") continue;

    const roleValue = (item as { role?: unknown }).role;
    const role: ChatRole | null = roleValue === "user" || roleValue === "assistant" ? roleValue : null;
    if (!role) continue;

    const text = sanitizeMessage((item as { text?: unknown }).text, 900);
    if (!text) continue;

    turns.push({ role, text });
  }

  return turns.slice(-10);
}

function buildSiteContext(projects: Awaited<ReturnType<typeof loadPortfolioProjects>>): string {
  const projectLines = projects.slice(0, 50).map((project) => {
    const tags = project.tags.slice(0, 5).join(", ");
    const tools = project.tools.slice(0, 5).join(", ");
    const details = [
      `title: ${project.title}`,
      `slug: ${project.slug}`,
      `url: ${WORK_URL_PREFIX}/${project.slug}`,
      `year: ${project.year}`,
      `category: ${project.category}`,
      `type: ${project.type}`,
      `one-liner: ${project.oneLiner}`,
      `summary: ${project.summary}`,
      tags ? `tags: ${tags}` : "",
      tools ? `tools: ${tools}` : ""
    ]
      .filter(Boolean)
      .join(" | ");

    return `- ${details}`;
  });

  return [
    "Website owner: Ariel Adhidevara.",
    "Website scope: portfolio projects, categories, project summaries, tools, and collaboration context.",
    `Primary domain: ${SITE_DOMAIN}`,
    `Internal pages: ${SITE_DOMAIN}/, ${SITE_DOMAIN}/work, ${SITE_DOMAIN}/about, ${SITE_DOMAIN}/work/<slug>.`,
    "Projects:",
    ...projectLines
  ].join("\n");
}

function formatHistoryForPrompt(history: ChatHistoryTurn[]): string {
  if (history.length === 0) return "(no prior messages)";

  return history
    .map((turn) => `${turn.role === "assistant" ? "assistant" : "user"}: ${turn.text}`)
    .join("\n");
}

function extractGeminiText(payload: unknown): string {
  const candidates = (payload as { candidates?: GeminiCandidate[] })?.candidates;
  if (!Array.isArray(candidates)) return "";

  for (const candidate of candidates) {
    const parts = candidate.content?.parts;
    if (!Array.isArray(parts)) continue;

    const text = parts
      .map((part) => (typeof part.text === "string" ? part.text : ""))
      .join("\n")
      .trim();

    if (text) return text;
  }

  return "";
}

function extractGeminiError(payload: unknown): string {
  const message = (payload as GeminiErrorPayload)?.error?.message;
  if (!message || typeof message !== "string") return "";
  return message.trim();
}

export async function POST(request: Request) {
  const apiKey = (process.env.GEMINI_API_KEY ?? process.env.GOOGLE_GENERATIVE_AI_API_KEY ?? "").trim();
  if (!apiKey) {
    return NextResponse.json(
      {
        error: "Gemini API key is missing. Add GEMINI_API_KEY to .env.local."
      },
      { status: 500 }
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  const message = sanitizeMessage((payload as { message?: unknown })?.message);
  if (!message) {
    return NextResponse.json({ error: "Message is required." }, { status: 400 });
  }

  const history = normalizeHistory((payload as { history?: unknown })?.history);
  const projects = await loadPortfolioProjects();
  const siteContext = buildSiteContext(projects);
  const historyBlock = formatHistoryForPrompt(history);

  const systemInstruction = [
    "You are Portfolio AI for arieladhidevara.com.",
    "Only answer from SITE_CONTEXT and the provided conversation history.",
    `If information is unavailable, reply exactly: "${OUT_OF_SCOPE_REPLY}"`,
    "Never invent projects, links, years, or tools.",
    "Always answer in English.",
    "Keep answers concise, practical, and friendly.",
    `For questions about Ariel's thinking style, mindset, approach, or decision-making, provide a short synthesis and include a section titled \`Supporting Projects\` with 2-4 links formatted as ${WORK_URL_PREFIX}/<slug>.`,
    `When mentioning any project, include a direct URL in the format ${WORK_URL_PREFIX}/<slug> whenever available.`
  ].join("\n");

  const userPrompt = [
    "SITE_CONTEXT:",
    siteContext,
    "",
    "CONVERSATION_HISTORY:",
    historyBlock,
    "",
    "USER_QUESTION:",
    message
  ].join("\n");

  const geminiRequestBody = {
    systemInstruction: {
      parts: [{ text: systemInstruction }]
    },
    contents: [
      {
        role: "user",
        parts: [{ text: userPrompt }]
      }
    ],
    generationConfig: {
      temperature: 0.2,
      topP: 0.9,
      maxOutputTokens: 420
    }
  };

  let upstreamResponse: Response;
  try {
    upstreamResponse = await fetch(GEMINI_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey
      },
      body: JSON.stringify(geminiRequestBody),
      cache: "no-store"
    });
  } catch {
    return NextResponse.json({ error: "Failed to connect to Gemini API." }, { status: 502 });
  }

  const geminiPayload = (await upstreamResponse.json().catch(() => null)) as unknown;
  if (!upstreamResponse.ok) {
    const geminiError = extractGeminiError(geminiPayload);
    return NextResponse.json(
      {
        error: geminiError || "Gemini API returned an error."
      },
      { status: upstreamResponse.status }
    );
  }

  let reply = extractGeminiText(geminiPayload);
  if (!reply) {
    return NextResponse.json({ error: "Gemini returned an empty response." }, { status: 502 });
  }

  reply = ensureEvidenceLinksForThinkingQuestion(reply, message, projects);

  return NextResponse.json({ reply });
}
