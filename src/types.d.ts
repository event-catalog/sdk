// Base type for all resources (domains, services and messages)
export interface BaseSchema {
  id: string;
  name: string;
  summary?: string;
  version: string;
  badges?: Badge[];
  sidebar?: {
    badge?: string;
  };
  owners?: string[];
  schemaPath?: string;
  markdown: string;
  repository?: {
    language?: string;
    url?: string;
  };
  deprecated?:
    | boolean
    | {
        date?: string;
        message?: string;
      };
  styles?: {
    icon?: string;
    node?: {
      color?: string;
      label?: string;
    };
  };
  resourceGroups?: ResourceGroup[];
  editUrl?: string;
  draft?: boolean | { title?: string; message?: string };
  // SDK types
  schema?: any;
}

export type ResourcePointer = {
  id: string;
  version?: string;
  type?: string;
};

export interface ResourceGroup {
  id?: string;
  title?: string;
  items: ResourcePointer[];
  limit?: number;
  sidebar?: boolean;
}

export interface ChannelPointer extends ResourcePointer {
  parameters?: Record<string, string>;
}

export type Message = Event | Command | Query;

enum ResourceType {
  Service = 'service',
  Event = 'event',
  Command = 'command',
}

export interface CustomDoc {
  title: string;
  summary: string;
  slug?: string;
  sidebar?: {
    label: string;
    order: number;
  };
  owners?: string[];
  badges?: Badge[];
  fileName?: string;
  markdown: string;
}

export interface Event extends BaseSchema {
  channels?: ChannelPointer[];
}
export interface Command extends BaseSchema {
  channels?: ChannelPointer[];
}
export interface Query extends BaseSchema {
  channels?: ChannelPointer[];
}
export interface Channel extends BaseSchema {
  address?: string;
  protocols?: string[];
  // parameters?: Record<string, Parameter>;
  parameters?: {
    [key: string]: {
      enum?: string[];
      default?: string;
      examples?: string[];
      description?: string;
    };
  };
}

export interface Specifications {
  asyncapiPath?: string;
  openapiPath?: string;
}

export interface Service extends BaseSchema {
  sends?: ResourcePointer[];
  receives?: ResourcePointer[];
  specifications?: Specifications;
}

export interface Domain extends BaseSchema {
  services?: ResourcePointer[];
  domains?: ResourcePointer[];
}

export interface Team {
  id: string;
  name: string;
  summary?: string;
  email?: string;
  hidden?: boolean;
  slackDirectMessageUrl?: string;
  members?: User[];
  ownedCommands?: Command[];
  ownedServices?: Service[];
  ownedEvents?: Event[];
  markdown: string;
}

export interface User {
  id: string;
  name: string;
  avatarUrl: string;
  role?: string;
  hidden?: boolean;
  email?: string;
  slackDirectMessageUrl?: string;
  ownedServices?: Service[];
  ownedEvents?: Event[];
  ownedCommands?: Command[];
  associatedTeams?: Team[];
  markdown: string;
}

export interface Badge {
  content: string;
  backgroundColor: string;
  textColor: string;
  icon?: string;
}

export interface UbiquitousLanguage {
  id: string;
  name: string;
  summary?: string;
  description?: string;
  icon?: string;
}

export interface UbiquitousLanguageDictionary {
  dictionary: UbiquitousLanguage[];
}

export type EventCatalog = {
  version: string;
  catalogVersion: string;
  createdAt: string;
  resources: {
    domains?: ExportedResource<Domain>[];
    services?: ExportedResource<Service>[];
    messages?: {
      events?: ExportedResource<Event>[];
      queries?: ExportedResource<Query>[];
      commands?: ExportedResource<Command>[];
    };
    teams?: ExportedResource<Team>[];
    users?: ExportedResource<User>[];
    channels?: ExportedResource<Channel>[];
    customDocs?: ExportedResource<CustomDoc>[];
  };
};
