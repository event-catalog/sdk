// Base type for all resources (domains, services and messages)
export interface BaseSchema {
  id: string;
  name: string;
  summary?: string;
  version: string;
  badges?: Badge[];
  sidebar?: {
    badge?: string
  },
  owners?: string[];
  schemaPath?: string;
  markdown: string;
  repository?: {
    language?: string;
    url?: string;
  };
}

export type ResourcePointer = {
  id: string;
  version: string;
};

export interface ChannelPointer extends ResourcePointer {
  parameters?: Record<string, string>;
}

export type Message = Event | Command;

enum ResourceType {
  Service = 'service',
  Event = 'event',
  Command = 'command',
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
}
