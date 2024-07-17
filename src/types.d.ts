export type Badge = {
  content: string;
  backgroundColor: string;
  textColor: string;
};

export type Event = {
  id: string;
  name: string;
  version: string;
  summary: string;
  owners?: string[];
  badges?: Badge[];
  // Path to the schema file.
  schemaPath?: string;
  // Markdown content of the event
  markdown: string;
};
