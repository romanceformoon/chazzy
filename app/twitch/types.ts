export interface User {
  id: string;
  login: string;
  display_name: string;
  type: string;
  broadcaster_type: string;
  description: string;
  profile_image_url: string;
  offline_image_url: string;
  view_count: number;
  email: string;
  created_at: string;
}

export interface Stream {
  id: string;
  user_id: string;
  user_login: string;
  user_name: string;
  game_id: string;
  game_name: string;
  type: string;
  title: string;
  tags: string[];
  viewer_count: number;
  started_at: string;
  language: string;
  thumbnail_url: string;
  tag_ids: string[];
  is_mature: boolean;
}

export interface Source {
  nick: string;
}

export interface EmotePosition {
  startPosition: string;
  endPosition: string;
}

export interface Tags {
  id: string;
  'display-name': string | null;
  color: string | null;
  'user-id': string;
  emotes?: Record<string, EmotePosition[]>;
  bits?: string;
  'tmi-sent-ts': string;
  badges: Record<string, string>;
  'target-user-id'?: string;
  'target-msg-id'?: string;
}

export interface Command {
  command: string;
}

export interface Message {
  source: Source;
  tags: Tags;
  parameters: string;
  command: Command;
}

export interface BadgeVersion {
  id: string;
  image_url_4x: string;
}

export interface Badge {
  set_id: string;
  versions: BadgeVersion[];
}
