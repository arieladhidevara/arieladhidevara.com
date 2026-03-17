"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { InteractiveSection } from "@/components/interactive/interactive-section";

type DiagramNode = {
  id: string;
  label: string;
  role: string;
};

type InteractiveDiagramProps = {
  kicker: string;
  title: string;
  description: string;
  nodes: DiagramNode[];
};

export function InteractiveDiagram({ kicker, title, description, nodes }: InteractiveDiagramProps) {
  const [activeId, setActiveId] = useState<string>(nodes[0]?.id ?? "");

  const links = useMemo(() => {
    if (nodes.length < 2) return [];
    return nodes.slice(0, -1).map((node, idx) => ({
      id: `${node.id}-${nodes[idx + 1]?.id}`,
      from: node.id,
      to: nodes[idx + 1]?.id
    }));
  }, [nodes]);

  return (
    <InteractiveSection kicker={kicker} title={title} description={description}>
      <div className="grid gap-7 lg:grid-cols-[1fr_0.9fr]">
        <div className="media-integrated rounded-card p-6">
          <div className="grid gap-3">
            {nodes.map((node, index) => {
              const isActive = node.id === activeId;
              return (
                <button
                  key={node.id}
                  type="button"
                  onMouseEnter={() => setActiveId(node.id)}
                  onFocus={() => setActiveId(node.id)}
                  className={
                    isActive
                      ? "rounded-soft bg-black/[0.1] px-4 py-3 text-left text-[#121418]"
                      : "rounded-soft bg-black/[0.03] px-4 py-3 text-left text-[#4c5360]"
                  }
                >
                  <p className="text-xs uppercase tracking-[0.12em] text-[#8c939f]">Node {index + 1}</p>
                  <p className="mt-1 text-sm font-medium">{node.label}</p>
                </button>
              );
            })}
          </div>
        </div>

        <div className="tone-layer rounded-card p-6 md:p-7">
          <p className="kicker">Relationship Map</p>
          <div className="relative mt-4 h-[260px] overflow-hidden rounded-soft">
            <svg viewBox="0 0 380 260" className="h-full w-full">
              {links.map((link, idx) => {
                const highlight = link.from === activeId || link.to === activeId;
                const y = 36 + idx * 58;
                return (
                  <motion.line
                    key={link.id}
                    x1={68}
                    y1={y}
                    x2={314}
                    y2={y + 42}
                    initial={{ pathLength: 0 }}
                    whileInView={{ pathLength: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: idx * 0.06 }}
                    stroke={highlight ? "#1d232d" : "#9ea5b2"}
                    strokeOpacity={highlight ? 0.55 : 0.25}
                    strokeWidth={2}
                  />
                );
              })}
            </svg>

            <div className="absolute inset-0 rounded-[inherit] grid grid-cols-2 gap-4">
              <div className="space-y-4">
                {nodes.slice(0, Math.ceil(nodes.length / 2)).map((node) => {
                  const active = node.id === activeId;
                  return (
                    <div
                      key={node.id}
                      className={
                        active
                          ? "rounded-soft bg-black/[0.11] px-3 py-2 text-xs text-[#121418]"
                          : "rounded-soft bg-black/[0.04] px-3 py-2 text-xs text-[#8c939f]"
                      }
                    >
                      {node.role}
                    </div>
                  );
                })}
              </div>
              <div className="space-y-4 pt-10">
                {nodes.slice(Math.ceil(nodes.length / 2)).map((node) => {
                  const active = node.id === activeId;
                  return (
                    <div
                      key={node.id}
                      className={
                        active
                          ? "rounded-soft bg-black/[0.11] px-3 py-2 text-xs text-[#121418]"
                          : "rounded-soft bg-black/[0.04] px-3 py-2 text-xs text-[#8c939f]"
                      }
                    >
                      {node.role}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </InteractiveSection>
  );
}

