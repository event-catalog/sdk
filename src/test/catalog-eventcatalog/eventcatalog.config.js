/** @type {import('../../bin/eventcatalog.config').Config} */
export default {
  cId: '8027010c-f3d6-417a-8234-e2f46087fc56',
  title: 'FlowMart',
  tagline:
    'Welcome to FlowMart EventCatalog. Here you can find all the information you need to know about our events and services (demo catalog).',
  organizationName: 'FlowMart',
  homepageLink: 'https://eventcatalog.dev',
  editUrl: 'https://github.com/event-catalog/eventcatalog/edit/main',
  port: 3000,
  outDir: 'dist',
  logo: {
    alt: 'FlowMart',
    src: '/logo.svg',
    text: 'FlowMart',
  },
  base: '/',
  trailingSlash: false,
  mermaid: {
    iconPacks: ['logos'],
  },
  rss: {
    enabled: true,
    limit: 15,
  },
  llmsTxt: {
    enabled: true,
  },
  chat: {
    enabled: true,
    similarityResults: 50,
    max_tokens: 4096,
    // 'Llama-3.2-3B-Instruct-q4f16_1-MLC is also good
    model: 'Hermes-3-Llama-3.2-3B-q4f16_1-MLC',
  },
  generators: [
    [
      '@eventcatalog/generator-ai',
      {
        debug: true,
        splitMarkdownFiles: false,
      },
    ],
  ],
  customDocs: {
    sidebar: [
      {
        label: 'Guides',
        badge: {
          text: 'New',
          color: 'green',
        },
        collapsed: false,
        items: [
          {
            label: 'Creating new microservices',
            autogenerated: { directory: 'guides/creating-new-microservices' },
          },
          {
            label: 'Event Storming',
            autogenerated: { directory: 'guides/event-storming', collapsed: false },
          },
        ],
      },
      {
        label: 'Technical Architecture & Design',
        badge: {
          text: 'New',
          color: 'green',
        },
        collapsed: false,
        items: [
          {
            label: 'Architecture Decision Records',
            autogenerated: { directory: 'technical-architecture-design/architecture-decision-records', collapsed: false },
          },
          {
            label: 'System Architecture Diagrams',
            autogenerated: { directory: 'technical-architecture-design/system-architecture-diagrams', collapsed: false },
          },
          {
            label: 'Infrastructure as Code',
            autogenerated: { directory: 'technical-architecture-design/infrastructure-as-code', collapsed: false },
          },
          {
            label: 'Read more on GitHub',
            link: 'https://github.com/event-catalog/eventcatalog',
            attrs: { target: '_blank', style: 'font-style: italic;' },
          },
        ],
      },
      {
        label: 'Operations & Support',
        badge: {
          text: 'New',
          color: 'green',
        },
        collapsed: false,
        items: [{ label: 'Runbooks', autogenerated: { directory: 'operations-and-support/runbooks', collapsed: false } }],
      },
    ],
  },
};

/**
 * TODO: Collapsed groups (collapsed: true)
 */
