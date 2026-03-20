import { resolveAssetUrl } from "@/lib/asset-url";

export type PlaceholderMedia = {
  id: string;
  kind: "image" | "video";
  label: string;
  ratio: "wide" | "tall" | "square";
  src?: string;
  poster?: string;
};

export type InteractiveModulePosition =
  | "after-overview"
  | "after-concept"
  | "after-project"
  | "before-documentation";

type InteractiveModuleBase = {
  id: string;
  type: "scroll-scene" | "three-scene" | "diagram-interaction" | "media-sequence";
  position: InteractiveModulePosition;
  kicker: string;
  title: string;
  description: string;
};

export type ScrollSceneModule = InteractiveModuleBase & {
  type: "scroll-scene";
  steps: Array<{
    id: string;
    heading: string;
    copy: string;
    visualLabel: string;
  }>;
};

export type ThreeSceneModule = InteractiveModuleBase & {
  type: "three-scene";
  conceptLabel: string;
  interactionHint: string;
};

export type DiagramInteractionModule = InteractiveModuleBase & {
  type: "diagram-interaction";
  nodes: Array<{
    id: string;
    label: string;
    role: string;
  }>;
};

export type MediaSequenceModule = InteractiveModuleBase & {
  type: "media-sequence";
  frames: Array<{
    id: string;
    label: string;
    note: string;
  }>;
};

export type PlaceholderInteractiveModule =
  | ScrollSceneModule
  | ThreeSceneModule
  | DiagramInteractionModule
  | MediaSequenceModule;

export type PracticeCategory =
  | "Interactive Systems"
  | "AI & Software"
  | "Spatial & Architectural Design"
  | "Objects & Product"
  | "Visual & Media";

export type ProjectSections = {
  overview: string;
  background: string;
  concept: string;
  theProject: string;
  process: string;
  reflectionImpact: string;
  documentation: string;
};

export type ProjectDocumentationLink = {
  label: string;
  href: string;
  type: "image" | "video" | "script" | "model" | "document" | "demo";
};

export type ProjectAssetSection =
  | "thumbnails"
  | "overview"
  | "background"
  | "concept"
  | "the-project"
  | "process"
  | "reflection"
  | "documentation";

export type ProjectAssetsBySection = Record<ProjectAssetSection, string[]>;

export type PlaceholderProject = {
  slug: string;
  title: string;
  year: number;
  category: PracticeCategory;
  categories?: PracticeCategory[];
  type: string;
  team?: string;
  timeline?: string;
  tags: string[];
  oneLiner: string;
  summary: string;
  context: string;
  challenge: string;
  approach: string;
  outcome: string;
  roles: string[];
  tools: string[];
  heroLabel: string;
  heroMediaKind?: "image" | "video";
  heroMediaSrc?: string;
  heroMediaPoster?: string;
  cardMediaSrc?: string;
  demoUrl?: string;
  demoCtaLabel?: string;
  sections: ProjectSections;
  assetsBySection?: ProjectAssetsBySection;
  documentationLinks?: ProjectDocumentationLink[];
  gallery: PlaceholderMedia[];
  related: string[];
  interactiveModules?: PlaceholderInteractiveModule[];
};

export const practiceCategories: PracticeCategory[] = [
  "Interactive Systems",
  "AI & Software",
  "Spatial & Architectural Design",
  "Objects & Product",
  "Visual & Media"
];

const practiceCategorySet = new Set<PracticeCategory>(practiceCategories);

export const categoryDescriptions: Record<PracticeCategory, string> = {
  "Interactive Systems": "Sensor-driven installations, projection mapping, and embodied interaction in physical space.",
  "AI & Software": "AI products, web applications, and computational systems that translate complexity into usable tools.",
  "Spatial & Architectural Design": "Architectural and spatial work spanning pavilions, exhibitions, and urban-scale concepts.",
  "Objects & Product": "Physical devices and speculative hardware products designed for clear human utility.",
  "Visual & Media": "Graphic, motion, and image-led storytelling across editorial and identity-driven outputs."
};

// Featured is a lightweight editorial label only; update these slugs anytime.
export const featuredProjectByCategory: Record<PracticeCategory, string> = {
  "Interactive Systems": "unseen-realities",
  "AI & Software": "physicad",
  "Spatial & Architectural Design": "unseen-realities",
  "Objects & Product": "mnemonic-mixology",
  "Visual & Media": "ephemera-of-existence"
};

export const featuredProjectSlugs = new Set([
  "physicad",
  "unseen-realities",
  "mnemonic-mixology",
  "ephemera-of-existence"
]);

export const capabilityDomains = practiceCategories;

export function isPracticeCategory(value: string): value is PracticeCategory {
  return practiceCategorySet.has(value as PracticeCategory);
}

export function getProjectCategories(project: Pick<PlaceholderProject, "category" | "categories">): PracticeCategory[] {
  const resolved: PracticeCategory[] = [];

  if (Array.isArray(project.categories)) {
    for (const category of project.categories) {
      if (!practiceCategorySet.has(category)) continue;
      if (resolved.includes(category)) continue;
      resolved.push(category);
    }
  }

  if (practiceCategorySet.has(project.category) && !resolved.includes(project.category)) {
    resolved.unshift(project.category);
  }

  return resolved.length > 0 ? resolved : [project.category];
}

export function projectInCategory(
  project: Pick<PlaceholderProject, "category" | "categories">,
  category: PracticeCategory
): boolean {
  return getProjectCategories(project).includes(category);
}

type ProjectSeed = Omit<PlaceholderProject, "heroLabel" | "gallery" | "related" | "sections" | "documentationLinks">;

const inMySkinAssets = {
  cover: "inmyskin/thumbnails/cover.jpg",
  card: "inmyskin/thumbnails/card.jpg",
  detail: "inmyskin/overview/setup-01.png",
  demoVideo: "inmyskin/the-project/demo.mov",
  demoBuild: "inmyskin/documentation/scripts/webgl-demo/inmyskin-webgl/index.html"
} as const;

const inMySkinDemoUrl = `/api/assets/${inMySkinAssets.demoBuild}`;

const projectSeeds: ProjectSeed[] = [
  {
    slug: "mnemonic-mixology",
    title: "Mnemonic Mixology",
    year: 2026,
    category: "Interactive Systems",
    type: "Interactive Installation",
    tags: ["Projection", "Sensor", "Embodied Interaction"],
    oneLiner: "An installation where audience gestures blend memory fragments into living spatial visuals.",
    summary: "Mnemonic Mixology connects body movement, projected imagery, and adaptive sound into a shared spatial ritual.",
    context: "Developed for a public-facing interactive media format that prioritizes collective participation.",
    challenge: "Design responsive interaction that remains intuitive for first-time participants.",
    approach: "A sensor pipeline drives projection states and sonic transitions in real time.",
    outcome: "The project established a repeatable framework for embodied narrative installations.",
    roles: ["Creative Technologist", "Interaction Designer"],
    tools: ["TouchDesigner", "Depth Sensors", "Resolume", "Python"]
  },
  {
    slug: "unseen-realities",
    title: "Unseen Realities",
    year: 2026,
    category: "Interactive Systems",
    type: "Projection Mapping Experience",
    tags: ["Projection Mapping", "Perception", "Realtime"],
    oneLiner: "A projection-mapped environment revealing hidden spatial layers through live audience behavior.",
    summary: "Unseen Realities turns ambient movement into a perceptual choreography across walls and volume.",
    context: "Conceived as a multi-surface spatial experience for immersive exhibition formats.",
    challenge: "Keep narrative coherence while multiple users interact simultaneously.",
    approach: "Layered state logic synchronizes motion tracking and mapped visual scenes.",
    outcome: "Delivered a stable and expressive projection system for iterative public deployment.",
    roles: ["Experience Director", "Creative Coder"],
    tools: ["TouchDesigner", "MadMapper", "OpenCV"]
  },
  {
    slug: "algorithm-prison-experiment",
    title: "Algorithm Prison Experiment",
    year: 2025,
    category: "Interactive Systems",
    type: "Interactive Research Installation",
    tags: ["Behavioral Systems", "Realtime Interaction", "Research"],
    oneLiner: "A speculative installation examining behavioral loops between participants and algorithmic control.",
    summary: "The project stages a rule-based environment where users negotiate autonomy through interaction choices.",
    context: "Built as a critical design experiment for discourse around agency and machine governance.",
    challenge: "Balance conceptual rigor with a readable visitor journey.",
    approach: "Designed a modular interaction script with visible state transitions.",
    outcome: "Produced a compelling interactive format for research and public conversation.",
    roles: ["Research Lead", "Interaction Architect"],
    tools: ["Unity", "OSC", "Node.js"]
  },
  {
    slug: "embodied-light-chamber",
    title: "Embodied Light Chamber",
    year: 2025,
    category: "Interactive Systems",
    type: "Immersive Installation",
    tags: ["Immersive", "Light", "Body Tracking"],
    oneLiner: "A chamber-scale experience where light fields reorganize in response to posture and pace.",
    summary: "Embodied Light Chamber explores how subtle bodily change can direct atmosphere.",
    context: "Designed as an experiential prototype for spatial wellness and contemplative interaction.",
    challenge: "Create sensitivity without introducing input jitter.",
    approach: "Combined smoothing layers and calibrated lighting behaviors.",
    outcome: "Resulted in a calm, responsive installation language for embodied interaction.",
    roles: ["Spatial Interaction Designer"],
    tools: ["Arduino", "DMX", "TouchDesigner"]
  },
  {
    slug: "sonic-atlas-room",
    title: "Sonic Atlas Room",
    year: 2024,
    category: "Interactive Systems",
    type: "Audio-Visual Installation",
    tags: ["Spatial Audio", "Interaction", "Installation"],
    oneLiner: "A room-scale atlas where movement reveals geographic memory through reactive sound and light.",
    summary: "Sonic Atlas Room maps audience paths into layered sonic territories.",
    context: "Developed for an exhibition that links place, movement, and memory.",
    challenge: "Maintain orientation in a non-linear interaction environment.",
    approach: "Built directional cues through synchronized lighting and audio zones.",
    outcome: "Created an interaction model that rewards exploration without overwhelming users.",
    roles: ["Interaction Designer", "Sound Collaboration Lead"],
    tools: ["Ableton Live", "Max/MSP", "Open Sound Control"]
  },
  {
    slug: "inmyskin",
    title: "InMySkin",
    year: 2025,
    category: "Interactive Systems",
    type: "Academic VR Simulation",
    team: "Solo project",
    timeline: "3 weeks (Apr - May 2025)",
    tags: ["Virtual Reality", "Simulation", "Healthcare"],
    oneLiner: "An immersive simulation exploring medical empathy through embodied perspective shifting.",
    summary: "InMySkin is a VR simulation project focused on healthcare communication and embodied understanding.",
    context: "Developed in an academic setting with collaborators across interaction, narrative, and technical production.",
    challenge: "Translate sensitive healthcare scenarios into an experience that remains clear, humane, and emotionally grounded.",
    approach: "Built a Unity WebGL narrative flow supported by structured visual assets and guided interaction pacing.",
    outcome: "Produced a functional simulation prototype that can be presented as both case-study media and an interactive demo.",
    roles: ["Interaction Designer"],
    tools: ["Python", "WebGL Shader", "GPT-4o", "Python"],
    demoUrl: inMySkinDemoUrl,
    demoCtaLabel: "Play InMySkin Demo"
  },
  {
    slug: "hivee",
    title: "Hivee",
    year: 2026,
    category: "AI & Software",
    type: "AI Productivity Platform",
    tags: ["AI", "Platform", "Workflow"],
    oneLiner: "A collaborative AI platform for structuring ideas, decisions, and project momentum.",
    summary: "Hivee combines intelligent summarization and planning workflows for multidisciplinary teams.",
    context: "Created to reduce friction between research, planning, and execution.",
    challenge: "Design clarity for both technical and non-technical users.",
    approach: "A modular product architecture with clear state feedback and guided actions.",
    outcome: "Delivered a scalable product direction for AI-assisted team operation.",
    roles: ["Product Architect", "Frontend Lead"],
    tools: ["Next.js", "TypeScript", "OpenAI API", "PostgreSQL"]
  },
  {
    slug: "trend-radar",
    title: "Trend Radar",
    year: 2025,
    category: "AI & Software",
    type: "Research Intelligence App",
    tags: ["AI", "Data", "Insights"],
    oneLiner: "An intelligence dashboard that surfaces weak signals and pattern shifts across industries.",
    summary: "Trend Radar translates noisy data streams into readable insight clusters for strategy teams.",
    context: "Built as a decision-support tool for research and innovation planning.",
    challenge: "Avoid information overload while preserving signal depth.",
    approach: "Used ranking logic, confidence cues, and progressive disclosure.",
    outcome: "Improved research velocity and decision confidence across pilot teams.",
    roles: ["AI Product Designer"],
    tools: ["Python", "FastAPI", "React", "Vector Search"]
  },
  {
    slug: "join39-studio-os",
    title: "Join39 Studio OS",
    year: 2025,
    category: "AI & Software",
    type: "Internal Operating Platform",
    tags: ["Platform", "Operations", "Automation"],
    oneLiner: "A studio operating layer that unifies briefs, production, and delivery into one system.",
    summary: "Join39 Studio OS centralizes workflow orchestration for creative and technical teams.",
    context: "Developed to align project management with production realities.",
    challenge: "Integrate multiple tools without breaking day-to-day usability.",
    approach: "Built an API-first structure with lightweight front-end controls.",
    outcome: "Reduced operational overhead and improved project visibility.",
    roles: ["Systems Designer", "Full-stack Developer"],
    tools: ["Next.js", "Node.js", "Prisma", "PostgreSQL"]
  },
  {
    slug: "adaptive-briefing-agent",
    title: "Adaptive Briefing Agent",
    year: 2024,
    category: "AI & Software",
    type: "Multi-Agent Tool",
    tags: ["Multi-Agent", "LLM", "Knowledge System"],
    oneLiner: "A briefing assistant that composes project context, risks, and next actions in real time.",
    summary: "The system transforms fragmented notes into clear execution-ready briefings.",
    context: "Designed for fast-moving teams needing consistent alignment.",
    challenge: "Keep outputs structured while preserving nuance.",
    approach: "Orchestrated multiple specialized agent roles with validation checks.",
    outcome: "Established a robust baseline for AI-driven coordination workflows.",
    roles: ["AI Systems Lead"],
    tools: ["OpenAI API", "TypeScript", "Redis"]
  },
  {
    slug: "signal-lab-dashboard",
    title: "Signal Lab Dashboard",
    year: 2024,
    category: "AI & Software",
    type: "Monitoring Interface",
    tags: ["Dashboard", "Analytics", "Software"],
    oneLiner: "A monitoring interface for real-time system health, model quality, and intervention actions.",
    summary: "Signal Lab Dashboard gives operators immediate visibility over data, models, and user impact.",
    context: "Built for teams running live AI-enabled services.",
    challenge: "Present complex diagnostics without visual fatigue.",
    approach: "Designed a layered UI hierarchy with clear alert and action states.",
    outcome: "Improved operational response time and confidence during live incidents.",
    roles: ["Product Designer", "Frontend Engineer"],
    tools: ["React", "D3", "TypeScript"]
  },
  {
    slug: "urban-memory-pavilion",
    title: "Urban Memory Pavilion",
    year: 2026,
    category: "Spatial & Architectural Design",
    type: "Pavilion Design",
    tags: ["Architecture", "Pavilion", "Public Space"],
    oneLiner: "A public pavilion concept that frames collective memory through light, circulation, and material rhythm.",
    summary: "Urban Memory Pavilion explores civic gathering through porous spatial thresholds.",
    context: "Developed as an urban-scale concept for temporary cultural programming.",
    challenge: "Balance monumentality with human-scale intimacy.",
    approach: "Composed layered circulation paths and calibrated daylight openings.",
    outcome: "Produced a compelling pavilion language for adaptive public activation.",
    roles: ["Architectural Designer"],
    tools: ["Rhino", "Grasshopper", "V-Ray"]
  },
  {
    slug: "tidal-library-atrium",
    title: "Tidal Library Atrium",
    year: 2025,
    category: "Spatial & Architectural Design",
    type: "Interior Spatial Concept",
    tags: ["Interior", "Spatial Narrative", "Architecture"],
    oneLiner: "An atrium concept where movement and reading zones flow like tidal cycles.",
    summary: "The design choreographs silence, transition, and social exchange within a vertical library core.",
    context: "Conceived for educational environments seeking flexible learning atmospheres.",
    challenge: "Integrate dynamic circulation with acoustic comfort.",
    approach: "Layered structural bays with soft program gradients.",
    outcome: "Established a clear interior strategy that supports multiple learning modes.",
    roles: ["Spatial Designer"],
    tools: ["Revit", "Rhino", "Enscape"]
  },
  {
    slug: "porous-courtyard-housing",
    title: "Porous Courtyard Housing",
    year: 2024,
    category: "Spatial & Architectural Design",
    type: "Housing Studio Project",
    tags: ["Housing", "Urban", "Climate"],
    oneLiner: "A housing system that uses layered courtyards to improve social and climatic performance.",
    summary: "Porous Courtyard Housing studies density through breathable communal voids.",
    context: "Developed in architecture studio with a focus on resilient urban living.",
    challenge: "Resolve privacy and community in compact urban blocks.",
    approach: "Used modular massing with cross-ventilation and shared thresholds.",
    outcome: "Produced a scalable housing concept grounded in climate and social use.",
    roles: ["Architecture Student", "Research Collaborator"],
    tools: ["Rhino", "Illustrator", "InDesign"]
  },
  {
    slug: "climate-axis-gallery",
    title: "Climate Axis Gallery",
    year: 2024,
    category: "Spatial & Architectural Design",
    type: "Exhibition Architecture",
    tags: ["Exhibition", "Spatial System", "Environment"],
    oneLiner: "An exhibition gallery organized around climate-responsive circulation and envelope strategies.",
    summary: "The project links curatorial sequence with environmental performance.",
    context: "Designed for a contemporary art venue with rotating public programs.",
    challenge: "Keep spatial flexibility while maintaining climate control logic.",
    approach: "Developed a linear axis with adaptive pockets for exhibitions and events.",
    outcome: "Delivered a coherent spatial system balancing performance and curatorial variety.",
    roles: ["Exhibition Spatial Designer"],
    tools: ["Revit", "Climate Analysis Tools", "Rhino"]
  },
  {
    slug: "kinetic-wayfinding-hub",
    title: "Kinetic Wayfinding Hub",
    year: 2023,
    category: "Spatial & Architectural Design",
    type: "Transit Spatial Concept",
    tags: ["Wayfinding", "Transit", "Urban Design"],
    oneLiner: "A transit-oriented spatial hub with dynamic wayfinding cues for high-flow movement.",
    summary: "Kinetic Wayfinding Hub explores orientation as a choreographed spatial experience.",
    context: "Created as a civic mobility concept for mixed-use urban transit nodes.",
    challenge: "Reduce directional confusion across overlapping user journeys.",
    approach: "Mapped movement intensity to signage scale and architectural rhythm.",
    outcome: "Produced a wayfinding-led spatial proposal with strong public readability.",
    roles: ["Urban Spatial Designer"],
    tools: ["Rhino", "GIS", "Figma"]
  },
  {
    slug: "flashsight",
    title: "FlashSight",
    year: 2026,
    category: "Objects & Product",
    type: "Wearable Vision Aid",
    tags: ["Wearable", "Assistive Tech", "Hardware"],
    oneLiner: "A wearable concept that provides rapid visual cues for low-visibility navigation scenarios.",
    summary: "FlashSight combines ergonomic design and signal logic for assistive guidance.",
    context: "Developed as a speculative product for accessibility-oriented mobility.",
    challenge: "Balance form comfort with clear and fast feedback.",
    approach: "Paired haptic and light cues through a lightweight wearable architecture.",
    outcome: "Defined a product direction ready for functional prototyping.",
    roles: ["Product Designer", "Hardware Prototyper"],
    tools: ["Fusion 360", "Arduino", "Figma"]
  },
  {
    slug: "anklechd",
    title: "AnkleCHD",
    year: 2025,
    category: "Objects & Product",
    type: "Medical Wearable Concept",
    tags: ["Health Device", "Wearable", "Product"],
    oneLiner: "A wearable ankle device concept for continuous cardio-related health signal capture.",
    summary: "AnkleCHD investigates discreet health monitoring through daily-use product behavior.",
    context: "Designed as a preventive-care concept for long-duration tracking.",
    challenge: "Integrate sensor reliability into a wearable that feels unobtrusive.",
    approach: "Developed modular hardware housing and intuitive indicator language.",
    outcome: "Produced a viable concept blueprint for next-stage prototyping.",
    roles: ["Product Strategist", "Prototype Designer"],
    tools: ["SolidWorks", "Electronics Prototyping", "Figma"]
  },
  {
    slug: "tactile-navigation-band",
    title: "Tactile Navigation Band",
    year: 2024,
    category: "Objects & Product",
    type: "Navigation Device",
    tags: ["Device", "Haptics", "Navigation"],
    oneLiner: "A wrist-based navigation band using directional haptic cues for glance-free movement.",
    summary: "The project explores low-cognitive-load navigation through tactile interaction.",
    context: "Built as a mobility-focused product experiment for urban contexts.",
    challenge: "Communicate direction clearly with minimal sensory fatigue.",
    approach: "Iterated vibration patterns through route simulation tests.",
    outcome: "Validated a compact interaction language for wearable guidance.",
    roles: ["Interaction Product Designer"],
    tools: ["Arduino", "Rapid Prototyping", "UX Testing"]
  },
  {
    slug: "modular-field-sensor",
    title: "Modular Field Sensor",
    year: 2024,
    category: "Objects & Product",
    type: "Environmental Hardware",
    tags: ["Hardware", "Sensor", "Field Device"],
    oneLiner: "A modular hardware unit for distributed environmental sensing in outdoor deployments.",
    summary: "Modular Field Sensor focuses on maintainability and robustness in variable conditions.",
    context: "Designed for research teams requiring portable sensing infrastructure.",
    challenge: "Support quick assembly while preserving measurement reliability.",
    approach: "Created interchangeable modules for power, sensing, and communication.",
    outcome: "Delivered a field-ready product architecture for iterative expansion.",
    roles: ["Hardware Systems Designer"],
    tools: ["CAD", "Embedded Systems", "IoT Stack"]
  },
  {
    slug: "speculative-rescue-lamp",
    title: "Speculative Rescue Lamp",
    year: 2023,
    category: "Objects & Product",
    type: "Speculative Product",
    tags: ["Speculative Design", "Emergency Device", "Object"],
    oneLiner: "A speculative emergency lamp system designed for blackout navigation and signaling.",
    summary: "The concept combines portable illumination with context-aware signaling behavior.",
    context: "Created as a critical product study for emergency preparedness.",
    challenge: "Keep the object intuitive under high-stress conditions.",
    approach: "Built interaction states around simple tactile controls.",
    outcome: "Framed a strong product narrative bridging utility and speculative foresight.",
    roles: ["Speculative Product Designer"],
    tools: ["Sketching", "3D Printing", "Interaction Prototyping"]
  },
  {
    slug: "index-of-light",
    title: "Index of Light",
    year: 2026,
    category: "Visual & Media",
    type: "Visual Storytelling Series",
    tags: ["Photography", "Editorial", "Visual Narrative"],
    oneLiner: "A visual series studying how light structure shapes memory and atmosphere in urban scenes.",
    summary: "Index of Light builds an editorial narrative from repeated observation and compositional rhythm.",
    context: "Produced as an ongoing visual research practice.",
    challenge: "Keep coherence across varied sites and lighting conditions.",
    approach: "Used a strict framing protocol with flexible sequencing.",
    outcome: "Created a consistent visual language adaptable to print and digital formats.",
    roles: ["Visual Artist", "Editor"],
    tools: ["Photography", "Lightroom", "InDesign"]
  },
  {
    slug: "monsoon-title-sequence",
    title: "Monsoon Title Sequence",
    year: 2025,
    category: "Visual & Media",
    type: "Motion Design",
    tags: ["Motion", "Title Design", "Video"],
    oneLiner: "A cinematic title sequence translating monsoon rhythms into typographic motion.",
    summary: "The sequence combines atmospheric pacing and restrained typographic choreography.",
    context: "Commissioned as a motion concept for long-form visual narrative.",
    challenge: "Maintain dramatic pacing without visual excess.",
    approach: "Layered temporal beats, texture, and type transitions.",
    outcome: "Delivered a motion language that supports story tone from the opening frame.",
    roles: ["Motion Designer"],
    tools: ["After Effects", "Premiere Pro", "DaVinci Resolve"]
  },
  {
    slug: "tactile-brand-system",
    title: "Tactile Brand System",
    year: 2025,
    category: "Visual & Media",
    type: "Brand Identity",
    tags: ["Branding", "Identity", "Graphic Design"],
    oneLiner: "An identity system balancing tactile material references with digital clarity.",
    summary: "Tactile Brand System unifies typography, symbols, and motion across touchpoints.",
    context: "Created for a multidisciplinary studio transitioning across media channels.",
    challenge: "Build consistency across static and dynamic applications.",
    approach: "Established core visual primitives and an adaptive application matrix.",
    outcome: "Produced a flexible identity toolkit with strong cross-media coherence.",
    roles: ["Brand Designer", "Design Strategist"],
    tools: ["Illustrator", "Figma", "After Effects"]
  },
  {
    slug: "frame-by-frame-cities",
    title: "Frame by Frame Cities",
    year: 2024,
    category: "Visual & Media",
    type: "Video Essay",
    tags: ["Video Editing", "Urban Story", "Media"],
    oneLiner: "A video essay dissecting urban tempo through frame-accurate montage and sonic contrast.",
    summary: "Frame by Frame Cities explores how editing rhythm shapes urban perception.",
    context: "Developed as an editorial media experiment on city movement.",
    challenge: "Translate complex urban behavior into concise visual argument.",
    approach: "Built narrative structure through sequence, pacing, and textual anchors.",
    outcome: "Generated a media format effective for both exhibition and online release.",
    roles: ["Editor", "Visual Storyteller"],
    tools: ["Premiere Pro", "After Effects", "Audition"]
  },
  {
    slug: "studio-identity-volume-01",
    title: "Studio Identity Volume 01",
    year: 2023,
    category: "Visual & Media",
    type: "Editorial Identity System",
    tags: ["Editorial", "Typography", "Identity"],
    oneLiner: "A print-digital identity volume focused on typographic rhythm and modular composition.",
    summary: "The project defines a visual grammar for studio publications and campaign outputs.",
    context: "Conceived as the first release in an evolving identity archive.",
    challenge: "Create a system that stays recognizable across changing themes.",
    approach: "Developed scalable typographic grids and modular graphic units.",
    outcome: "Established a durable editorial identity foundation for future volumes.",
    roles: ["Editorial Designer"],
    tools: ["InDesign", "Illustrator", "Figma"]
  }
];

function toSentence(value: string): string {
  const normalized = value.trim();
  if (!normalized) return "";
  return /[.!?]$/.test(normalized) ? normalized : `${normalized}.`;
}

function buildProjectSections(seed: ProjectSeed): ProjectSections {
  const documentationLine = `Produced by ${seed.roles.join(", ")} using ${seed.tools.join(", ")}.`;

  return {
    overview: toSentence(`${seed.oneLiner} ${seed.summary}`),
    background: toSentence(seed.context),
    concept: toSentence(seed.challenge),
    theProject: toSentence(seed.summary),
    process: toSentence(seed.approach),
    reflectionImpact: toSentence(seed.outcome),
    documentation: toSentence(documentationLine)
  };
}

function buildGallery(slug: string, title: string): PlaceholderMedia[] {
  if (slug === "inmyskin") {
    return [
      {
        id: "inmyskin-cover",
        kind: "image",
        label: "InMySkin - Hero Still",
        ratio: "wide",
        src: resolveAssetUrl(inMySkinAssets.cover)
      },
      {
        id: "inmyskin-cover-video",
        kind: "video",
        label: "InMySkin - Cover Motion",
        ratio: "wide",
        src: resolveAssetUrl(inMySkinAssets.demoVideo),
        poster: resolveAssetUrl(inMySkinAssets.cover)
      },
      {
        id: "inmyskin-detail",
        kind: "image",
        label: "InMySkin - Detail",
        ratio: "square",
        src: resolveAssetUrl(inMySkinAssets.detail)
      }
    ];
  }

  return [
    {
      id: `${slug}-overview`,
      kind: "image",
      label: `${title} - Overview`,
      ratio: "wide"
    },
    {
      id: `${slug}-detail`,
      kind: "image",
      label: `${title} - Detail`,
      ratio: "square"
    },
    {
      id: `${slug}-motion`,
      kind: "video",
      label: `${title} - Motion`,
      ratio: "wide"
    }
  ];
}

function buildDocumentationLinks(seed: ProjectSeed): ProjectDocumentationLink[] {
  if (seed.slug === "inmyskin") {
    return [
      {
        label: "WebGL Demo Build",
        href: inMySkinDemoUrl,
        type: "demo"
      },
      {
        label: "Hero Image",
        href: resolveAssetUrl(inMySkinAssets.cover),
        type: "image"
      },
      {
        label: "Card Image",
        href: resolveAssetUrl(inMySkinAssets.card),
        type: "image"
      },
      {
        label: "Demo Video",
        href: resolveAssetUrl(inMySkinAssets.demoVideo),
        type: "video"
      }
    ];
  }

  return [];
}

const baseProjects: PlaceholderProject[] = projectSeeds.map((seed) => ({
  ...seed,
  sections: buildProjectSections(seed),
  documentationLinks: buildDocumentationLinks(seed),
  heroLabel: `${seed.title} - Key Visual`,
  ...(seed.slug === "inmyskin"
    ? {
        heroMediaKind: "image" as const,
        heroMediaSrc: resolveAssetUrl(inMySkinAssets.cover),
        cardMediaSrc: resolveAssetUrl(inMySkinAssets.card)
      }
    : {}),
  gallery: buildGallery(seed.slug, seed.title),
  related: []
}));

export const placeholderProjects: PlaceholderProject[] = baseProjects.map((project) => ({
  ...project,
  related: baseProjects
    .filter((entry) => projectInCategory(entry, project.category) && entry.slug !== project.slug)
    .slice(0, 2)
    .map((entry) => entry.slug)
}));

export function getPlaceholderProjectBySlug(slug: string): PlaceholderProject | undefined {
  return placeholderProjects.find((project) => project.slug === slug);
}

export function getProjectsByCategory(category: PracticeCategory): PlaceholderProject[] {
  return placeholderProjects.filter((project) => projectInCategory(project, category));
}

export function isFeaturedProject(project: Pick<PlaceholderProject, "slug" | "category">): boolean {
  return featuredProjectSlugs.has(project.slug);
}

export function allCategories(): string[] {
  return ["All Works", ...practiceCategories];
}

export function allTags(): string[] {
  const tagSet = new Set<string>();

  for (const project of placeholderProjects) {
    for (const tag of project.tags) {
      tagSet.add(tag);
    }
  }

  return ["All", ...Array.from(tagSet).sort((a, b) => a.localeCompare(b))];
}
