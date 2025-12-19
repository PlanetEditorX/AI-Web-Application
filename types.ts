
export type Role = 'user' | 'model' | 'system';

export interface MessagePart {
  text?: string;
  inlineData?: {
    mimeType: string;
    data: string;
  };
}

export interface ChatMessage {
  id: string;
  role: Role;
  parts: MessagePart[];
  timestamp: number;
}

export enum ModelType {
  FLASH = 'gemini-3-flash-preview',
  PRO = 'gemini-3-pro-preview'
}

export interface AIApp {
  id: string;
  name: string;
  url: string;
  icon: string;
  color: string;
}
