// Base type for all resources (domains, services and messages)
export interface BaseSchema {
  id: string;
  name: string;
  summary?: string;
  version: string;
  badges?: Badge[];
  owners?: string[];
  schemaPath?: string;
  markdown: string;
}

export type ResourcePointer = {
  id: string;
  version: string;
};

export type Message = Event | Command;

export interface Event extends BaseSchema {}
export interface Command extends BaseSchema {}

export interface Service extends BaseSchema {
  sends?: ResourcePointer[];
  receives?: ResourcePointer[];
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
}

export interface Badge {
  content: string;
  backgroundColor: string;
  textColor: string;
}
