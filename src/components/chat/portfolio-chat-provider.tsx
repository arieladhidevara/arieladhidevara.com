"use client";

import Link from "next/link";
import { createPortal } from "react-dom";
import {
  createContext,
  type FormEvent,
  type ReactNode,
  type TouchEvent as ReactTouchEvent,
  type WheelEvent as ReactWheelEvent,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";
import { MediaBlock } from "@/components/ui/media-block";
import { TagList } from "@/components/ui/tag-list";
import type { PlaceholderProject } from "@/lib/placeholder-data";

type ChatRole = "user" | "assistant";

type ChatMessage = {
  id: string;
  role: ChatRole;
  text: string;
};

type ChatApiResponse = {
  reply?: string;
  error?: string;
};

type SubmitPromptOptions = {
  open?: boolean;
};

type ProjectPreviewApiResponse = {
  project?: PlaceholderProject;
  error?: string;
};

type MessageSegment =
  | {
      type: "text";
      value: string;
    }
  | {
      type: "link";
      value: string;
      href: string;
      projectSlug: string | null;
    };

type PortfolioChatContextValue = {
  hasChattedEver: boolean;
  isSending: boolean;
  isOpen: boolean;
  openChat: () => void;
  closeChat: () => void;
  submitPrompt: (prompt: string, options?: SubmitPromptOptions) => Promise<void>;
};

const STARTER_ASSISTANT_TEXT =
  "Hi, I am Portfolio AI. You can ask about Ariel's projects, categories, process, and tools.";
const API_ERROR_FALLBACK = "Sorry, the AI connection is having an issue. Please try again in a few seconds.";
const PROJECT_LINK_PATTERN =
  /(?:https?:\/\/)?(?:www\.)?arieladhidevara\.com\/work\/([a-z0-9-]+)|\/work\/([a-z0-9-]+)/i;
const MESSAGE_LINK_PATTERN =
  /(https?:\/\/[^\s]+|(?:www\.)?arieladhidevara\.com\/work\/[a-z0-9-]+|\/work\/[a-z0-9-]+)/gi;

const PortfolioChatContext = createContext<PortfolioChatContextValue | null>(null);

function createMessageId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function trimTrailingPunctuation(value: string): string {
  return value.replace(/[),.;!?]+$/g, "");
}

function getProjectSlugFromHref(rawHref: string): string | null {
  const cleaned = trimTrailingPunctuation(rawHref.trim());
  const match = cleaned.match(PROJECT_LINK_PATTERN);
  const slug = (match?.[1] ?? match?.[2] ?? "").toLowerCase().trim();
  return slug || null;
}

function normalizeHref(rawHref: string): string {
  const projectSlug = getProjectSlugFromHref(rawHref);
  if (projectSlug) {
    return `/work/${projectSlug}`;
  }

  const cleaned = trimTrailingPunctuation(rawHref.trim());
  if (/^https?:\/\//i.test(cleaned)) {
    return cleaned;
  }
  return `https://${cleaned}`;
}

function splitMessageSegments(text: string): MessageSegment[] {
  const segments: MessageSegment[] = [];
  let cursor = 0;

  for (const match of text.matchAll(MESSAGE_LINK_PATTERN)) {
    const startIndex = match.index ?? 0;
    const rawValue = match[0] ?? "";
    if (!rawValue) continue;

    if (startIndex > cursor) {
      segments.push({
        type: "text",
        value: text.slice(cursor, startIndex)
      });
    }

    const href = normalizeHref(rawValue);
    segments.push({
      type: "link",
      value: trimTrailingPunctuation(rawValue),
      href,
      projectSlug: getProjectSlugFromHref(rawValue)
    });

    cursor = startIndex + rawValue.length;
  }

  if (cursor < text.length) {
    segments.push({
      type: "text",
      value: text.slice(cursor)
    });
  }

  if (segments.length === 0) {
    segments.push({
      type: "text",
      value: text
    });
  }

  return segments;
}

function toHistoryPayload(messages: ChatMessage[]): Array<{ role: ChatRole; text: string }> {
  return messages.slice(-10).map(({ role, text }) => ({ role, text }));
}

function PortfolioChatWidget({
  isOpen,
  hasChattedEver,
  isSending,
  messages,
  widgetDraft,
  setWidgetDraft,
  openChat,
  closeChat,
  submitPrompt,
  openProjectPreviewBySlug
}: {
  isOpen: boolean;
  hasChattedEver: boolean;
  isSending: boolean;
  messages: ChatMessage[];
  widgetDraft: string;
  setWidgetDraft: (value: string) => void;
  openChat: () => void;
  closeChat: () => void;
  submitPrompt: (prompt: string, options?: SubmitPromptOptions) => Promise<void>;
  openProjectPreviewBySlug: (slug: string) => Promise<void>;
}) {
  const widgetContainerRef = useRef<HTMLDivElement | null>(null);
  const widgetInputRef = useRef<HTMLInputElement | null>(null);
  const widgetMessagesRef = useRef<HTMLDivElement | null>(null);

  const renderMessageContent = (text: string) => {
    const lines = text.split("\n");

    return lines.map((line, lineIndex) => (
      <span key={`line-${lineIndex}`} className="block">
        {splitMessageSegments(line).map((segment, segmentIndex) => {
          if (segment.type === "text") {
            return <span key={`seg-${lineIndex}-${segmentIndex}`}>{segment.value}</span>;
          }

          if (segment.projectSlug) {
            return (
              <button
                key={`seg-${lineIndex}-${segmentIndex}`}
                type="button"
                onClick={() => void openProjectPreviewBySlug(segment.projectSlug as string)}
                className="underline decoration-[0.09em] underline-offset-2 transition-colors hover:text-[#0f1828]"
              >
                {segment.value}
              </button>
            );
          }

          return (
            <a
              key={`seg-${lineIndex}-${segmentIndex}`}
              href={segment.href}
              target="_blank"
              rel="noreferrer"
              className="underline decoration-[0.09em] underline-offset-2 transition-colors hover:text-[#0f1828]"
            >
              {segment.value}
            </a>
          );
        })}
      </span>
    ));
  };

  useEffect(() => {
    if (!isOpen) return;
    const scroller = widgetMessagesRef.current;
    if (!scroller) return;

    scroller.scrollTop = scroller.scrollHeight;
  }, [isOpen, isSending, messages]);

  useEffect(() => {
    if (!isOpen) return;

    const rafId = window.requestAnimationFrame(() => {
      widgetInputRef.current?.focus();
    });

    return () => {
      window.cancelAnimationFrame(rafId);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleOutsidePointer = (event: MouseEvent | TouchEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (widgetContainerRef.current?.contains(target)) return;
      closeChat();
    };

    document.addEventListener("mousedown", handleOutsidePointer);
    document.addEventListener("touchstart", handleOutsidePointer, { passive: true });

    return () => {
      document.removeEventListener("mousedown", handleOutsidePointer);
      document.removeEventListener("touchstart", handleOutsidePointer);
    };
  }, [closeChat, isOpen]);

  const handleWidgetSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void submitPrompt(widgetDraft, { open: true });
    setWidgetDraft("");
  };

  return (
    <>
      {!isOpen && (
        <button
          type="button"
          aria-label="Open portfolio chat"
          onClick={openChat}
          className="fixed bottom-5 right-5 z-[70] flex h-14 w-14 items-center justify-center rounded-full border border-white/[0.48] bg-white/[0.36] shadow-[inset_0_1px_0_rgba(255,255,255,0.76),0_22px_36px_-24px_rgba(10,14,22,0.48)] backdrop-blur-[16px] md:bottom-7 md:right-7"
          style={{
            opacity: hasChattedEver ? 1 : 0.95,
            pointerEvents: "auto"
          }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
              d="M7 8.5h10m-10 4h7m8-0.2c0 4.1-4.1 7.4-9.1 7.4-1.1 0-2.2-0.2-3.2-0.6L4 20l1.4-3.4c-1.5-1.2-2.4-2.8-2.4-4.6 0-4.1 4.1-7.4 9.1-7.4S22 8.2 22 12.3Z"
              stroke="#2b3444"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      )}

      {isOpen && (
        <div
          ref={widgetContainerRef}
          className="fixed bottom-5 right-5 z-[72] flex h-[min(31rem,calc(100svh-2.5rem))] w-[min(23rem,calc(100vw-1.25rem))] flex-col overflow-hidden rounded-2xl border border-white/[0.5] bg-[linear-gradient(140deg,rgba(255,255,255,0.54)_0%,rgba(255,255,255,0.24)_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.78),0_26px_42px_-26px_rgba(12,18,28,0.46)] backdrop-blur-[22px] md:bottom-7 md:right-7"
        >
          <div className="flex items-center justify-between border-b border-black/[0.08] px-3.5 py-2.5">
            <div>
              <p className="text-[10px] uppercase tracking-[0.14em] text-[#717b8c]">Portfolio AI</p>
              <p className="text-xs text-[#3b4658]">Ask only about Ariel&apos;s website</p>
            </div>
            <button
              type="button"
              onClick={closeChat}
              className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-black/[0.1] bg-white/[0.52] text-[#313b4c] transition-colors hover:bg-white/[0.84]"
              aria-label="Close chat widget"
            >
              x
            </button>
          </div>

          <div ref={widgetMessagesRef} className="flex-1 space-y-2 overflow-y-auto px-3.5 py-3">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[88%] rounded-2xl px-3 py-2 text-xs leading-relaxed ${
                    message.role === "user"
                      ? "rounded-br-md bg-[#172130] text-[#f5f7fb]"
                      : "rounded-bl-md border border-black/[0.08] bg-white/[0.72] text-[#1d2532]"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{renderMessageContent(message.text)}</p>
                </div>
              </div>
            ))}

            {isSending && (
              <div className="flex justify-start">
                <div className="rounded-2xl rounded-bl-md border border-black/[0.08] bg-white/[0.72] px-3 py-2 text-xs text-[#516077]">
                  AI is typing...
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleWidgetSubmit} className="border-t border-black/[0.08] p-3">
            <div className="flex items-center gap-2 rounded-full border border-black/[0.1] bg-white/[0.66] px-3 py-2">
              <label htmlFor="dock-chat-input" className="sr-only">
                Ask Portfolio AI
              </label>
              <input
                id="dock-chat-input"
                ref={widgetInputRef}
                value={widgetDraft}
                onChange={(event) => setWidgetDraft(event.target.value)}
                placeholder="Ask about Ariel's projects..."
                className="min-w-0 flex-1 bg-transparent text-xs text-[#1e2531] outline-none placeholder:text-[#7f8898]"
              />
              <button
                type="submit"
                disabled={widgetDraft.trim().length === 0 || isSending}
                className="shrink-0 rounded-full border border-black/[0.1] bg-black/[0.04] px-3 py-1 text-[10px] uppercase tracking-[0.14em] text-[#364154] transition-colors hover:bg-black/[0.09] disabled:cursor-not-allowed disabled:opacity-45"
              >
                Send
              </button>
            </div>
          </form>

        </div>
      )}
    </>
  );
}

function ProjectPreviewModal({
  project,
  loadingSlug,
  error,
  onClose
}: {
  project: PlaceholderProject | null;
  loadingSlug: string | null;
  error: string;
  onClose: () => void;
}) {
  const [mounted, setMounted] = useState(false);
  const [entered, setEntered] = useState(false);
  const isOpen = Boolean(project || loadingSlug || error);

  useEffect(() => {
    setMounted(true);
    return () => {
      setMounted(false);
    };
  }, []);

  useEffect(() => {
    if (!isOpen) {
      setEntered(false);
      return;
    }

    let rafTwo: number | null = null;
    const rafOne = window.requestAnimationFrame(() => {
      rafTwo = window.requestAnimationFrame(() => {
        setEntered(true);
      });
    });

    return () => {
      window.cancelAnimationFrame(rafOne);
      if (rafTwo != null) {
        window.cancelAnimationFrame(rafTwo);
      }
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen, onClose]);

  const popupMotionStyle = {
    opacity: entered ? 1 : 0.72,
    transform: entered ? "translate3d(0px, 0px, 0px) scale(1)" : "translate3d(0px, 16px, 0px) scale(0.95)",
    transition: "transform 420ms cubic-bezier(0.22,1,0.36,1), opacity 320ms cubic-bezier(0.22,1,0.36,1)",
    willChange: "transform, opacity"
  };

  const blockInsideScroll = (event: ReactWheelEvent<HTMLDivElement> | ReactTouchEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const previewKind = project?.heroMediaKind ?? "image";
  const previewMediaSrc =
    previewKind === "video" ? project?.heroMediaSrc : project?.heroMediaSrc ?? project?.cardMediaSrc;
  const previewMediaPoster =
    previewKind === "video" ? project?.heroMediaPoster ?? project?.heroMediaSrc ?? project?.cardMediaSrc : undefined;
  const previewRole = project?.roles[0] ?? "Independent contributor";
  const previewTeam = project?.team ?? "Solo project";
  const previewTimeline = project ? project.timeline ?? `${project.year}` : "";
  const previewTools = project ? project.tools.join(" ") : "";
  const previewHref = project ? `/work/${project.slug}` : "#";

  if (!mounted || !isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[220] flex items-center justify-center p-3 md:p-6" role="dialog" aria-modal="true">
      <button
        type="button"
        aria-label="Close project preview"
        className="no-glass-hover absolute inset-0 bg-black/[0.52] backdrop-blur-[3px]"
        style={{
          opacity: entered ? 1 : 0,
          transition: "opacity 320ms cubic-bezier(0.22,1,0.36,1)"
        }}
        onClick={onClose}
      />

      <div className="relative z-10 w-full max-w-4xl">
        <div
          className="relative z-10 overflow-hidden rounded-card border border-white/62 bg-white/[0.54] p-4 shadow-[0_28px_58px_-36px_rgba(0,0,0,0.56),inset_0_1px_0_rgba(255,255,255,0.7),inset_0_-1px_0_rgba(152,164,182,0.18)] backdrop-blur-[20px] md:p-6"
          style={popupMotionStyle}
          onWheelCapture={blockInsideScroll}
          onTouchMoveCapture={blockInsideScroll}
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(125%_100%_at_0%_0%,rgba(255,255,255,0.72)_0%,rgba(255,255,255,0.28)_48%,rgba(255,255,255,0.08)_100%),linear-gradient(156deg,rgba(255,255,255,0.56)_0%,rgba(244,248,253,0.38)_56%,rgba(228,235,245,0.3)_100%)]"
          />
          <button
            type="button"
            aria-label="Close project preview"
            className="absolute right-3 top-3 z-20 flex h-8 w-8 items-center justify-center rounded-full text-base text-[#4e5666] transition-colors hover:text-[#f8fafc] md:right-4 md:top-4"
            onClick={onClose}
          >
            X
          </button>

          {loadingSlug && (
            <div className="relative z-10 p-8 text-sm text-[#525d6f]">
              Loading project preview...
            </div>
          )}

          {error && !loadingSlug && (
            <div className="relative z-10 space-y-4 p-8">
              <p className="text-sm text-[#525d6f]">{error}</p>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full bg-black/[0.06] px-4 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-[#252d3a]"
              >
                Close
              </button>
            </div>
          )}

          {project && !loadingSlug && !error && (
            <div className="relative z-10 grid grid-cols-1 items-stretch gap-3 md:grid-cols-[0.86fr_1.14fr] md:gap-6">
              <div className="w-full">
                <MediaBlock
                  label={project.heroLabel}
                  kind={previewKind}
                  ratio="square"
                  className="h-full w-full"
                  src={previewMediaSrc}
                  poster={previewMediaPoster}
                />
              </div>

              <div className="min-w-0">
                <div className="flex h-full min-h-0 flex-col gap-3.5 md:gap-4">
                  <div>
                    <p className="kicker">Project Preview</p>
                    <h3 className="display-type text-clamp-2 mt-2 text-[1.2rem] font-semibold leading-tight text-[#161c24] md:text-[2rem]">
                      {project.title}
                    </h3>
                    <p className="text-clamp-1 mt-1 text-xs text-[#6d7687] md:text-sm">
                      {project.year} | {project.type}
                    </p>
                  </div>

                  <p className="text-clamp-2 text-xs leading-relaxed text-[#4f5868] md:text-base">{project.oneLiner}</p>

                  <dl className="space-y-2.5 rounded-soft bg-white/44 p-4">
                    <div className="grid grid-cols-[4.9rem_1fr] gap-3">
                      <dt className="kicker">Role</dt>
                      <dd className="text-clamp-1 text-sm leading-relaxed text-[#596173]">{previewRole}</dd>
                    </div>
                    <div className="grid grid-cols-[4.9rem_1fr] gap-3">
                      <dt className="kicker">Team</dt>
                      <dd className="text-clamp-1 text-sm leading-relaxed text-[#596173]">{previewTeam}</dd>
                    </div>
                    <div className="grid grid-cols-[4.9rem_1fr] gap-3">
                      <dt className="kicker">INSTITUTION / YEAR</dt>
                      <dd className="text-clamp-1 text-sm leading-relaxed text-[#596173]">{previewTimeline}</dd>
                    </div>
                    <div className="grid grid-cols-[4.9rem_1fr] gap-3">
                      <dt className="kicker">Tools</dt>
                      <dd className="text-clamp-2 text-sm leading-relaxed text-[#596173]">{previewTools}</dd>
                    </div>
                  </dl>

                  <TagList tags={project.tags.slice(0, 3)} size="compact" />

                  <div className="mt-auto flex justify-end pt-1">
                    <Link
                      href={previewHref}
                      onClick={onClose}
                      className="rounded-full px-3 py-2 text-xs font-semibold text-[#1a2029] transition-colors hover:text-[#f8fafc] md:px-4 md:py-2.5 md:text-sm"
                    >
                      View Full Project
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

export function PortfolioChatProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [hasChattedEver, setHasChattedEver] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [widgetDraft, setWidgetDraft] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: createMessageId(),
      role: "assistant",
      text: STARTER_ASSISTANT_TEXT
    }
  ]);
  const projectPreviewCacheRef = useRef<Record<string, PlaceholderProject>>({});
  const [activeProjectPreview, setActiveProjectPreview] = useState<PlaceholderProject | null>(null);
  const [projectPreviewLoadingSlug, setProjectPreviewLoadingSlug] = useState<string | null>(null);
  const [projectPreviewError, setProjectPreviewError] = useState("");

  const openChat = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeChat = useCallback(() => {
    setIsOpen(false);
  }, []);

  const closeProjectPreview = useCallback(() => {
    setActiveProjectPreview(null);
    setProjectPreviewError("");
    setProjectPreviewLoadingSlug(null);
  }, []);

  const openProjectPreviewBySlug = useCallback(async (slug: string) => {
    const normalizedSlug = slug.toLowerCase().trim();
    if (!normalizedSlug) return;

    const cached = projectPreviewCacheRef.current[normalizedSlug];
    if (cached) {
      setProjectPreviewError("");
      setProjectPreviewLoadingSlug(null);
      setActiveProjectPreview(cached);
      return;
    }

    setProjectPreviewError("");
    setProjectPreviewLoadingSlug(normalizedSlug);
    setActiveProjectPreview(null);

    try {
      const response = await fetch(`/api/project-card/${normalizedSlug}`, {
        method: "GET",
        cache: "no-store"
      });

      const payload = (await response.json().catch(() => ({}))) as ProjectPreviewApiResponse;
      if (!response.ok) {
        throw new Error(typeof payload.error === "string" && payload.error.trim() ? payload.error : "Project not found");
      }

      const project = payload.project;
      if (!project || typeof project.slug !== "string" || typeof project.title !== "string" || typeof project.year !== "number") {
        throw new Error("Invalid project payload");
      }

      projectPreviewCacheRef.current[normalizedSlug] = project;
      setActiveProjectPreview(project);
    } catch (error) {
      const detail = error instanceof Error ? error.message.trim() : "";
      setProjectPreviewError(detail || "Unable to load project preview.");
    } finally {
      setProjectPreviewLoadingSlug(null);
    }
  }, []);

  const submitPrompt = useCallback(
    async (prompt: string, options?: SubmitPromptOptions) => {
      const trimmedPrompt = prompt.trim();
      if (!trimmedPrompt || isSending) return;

      const shouldOpen = options?.open !== false;
      if (shouldOpen) {
        setIsOpen(true);
      }

      const userMessage: ChatMessage = {
        id: createMessageId(),
        role: "user",
        text: trimmedPrompt
      };
      const nextMessages = [...messages, userMessage];
      setMessages(nextMessages);
      setIsSending(true);
      setHasChattedEver(true);

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            message: trimmedPrompt,
            history: toHistoryPayload(nextMessages)
          })
        });

        const payload = (await response.json().catch(() => ({}))) as ChatApiResponse;
        if (!response.ok) {
          throw new Error(typeof payload.error === "string" && payload.error.trim() ? payload.error : "Chat unavailable");
        }

        const assistantReply = typeof payload.reply === "string" ? payload.reply.trim() : "";
        if (!assistantReply) {
          throw new Error("Empty response");
        }

        setMessages((prev) => [
          ...prev,
          {
            id: createMessageId(),
            role: "assistant",
            text: assistantReply
          }
        ]);
      } catch (error) {
        const detail = error instanceof Error ? error.message.trim() : "";
        const fallbackMessage = detail ? `Sorry, ${detail}` : API_ERROR_FALLBACK;

        setMessages((prev) => [
          ...prev,
          {
            id: createMessageId(),
            role: "assistant",
            text: fallbackMessage
          }
        ]);
      } finally {
        setIsSending(false);
      }
    },
    [isSending, messages]
  );

  const contextValue = useMemo<PortfolioChatContextValue>(
    () => ({
      hasChattedEver,
      isSending,
      isOpen,
      openChat,
      closeChat,
      submitPrompt
    }),
    [closeChat, hasChattedEver, isOpen, isSending, openChat, submitPrompt]
  );

  return (
    <PortfolioChatContext.Provider value={contextValue}>
      {children}
      <PortfolioChatWidget
        isOpen={isOpen}
        hasChattedEver={hasChattedEver}
        isSending={isSending}
        messages={messages}
        widgetDraft={widgetDraft}
        setWidgetDraft={setWidgetDraft}
        openChat={openChat}
        closeChat={closeChat}
        submitPrompt={submitPrompt}
        openProjectPreviewBySlug={openProjectPreviewBySlug}
      />
      <ProjectPreviewModal
        project={activeProjectPreview}
        loadingSlug={projectPreviewLoadingSlug}
        error={projectPreviewError}
        onClose={closeProjectPreview}
      />
    </PortfolioChatContext.Provider>
  );
}

export function usePortfolioChat() {
  const context = useContext(PortfolioChatContext);
  if (!context) {
    throw new Error("usePortfolioChat must be used inside PortfolioChatProvider");
  }
  return context;
}
