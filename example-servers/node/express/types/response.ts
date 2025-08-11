export type MessageFileType = 'image' | 'audio' | 'any';
export type MessageFile = { name?: string; src?: string; type?: MessageFileType; ref?: File };
export type MessageRole = "ai" | "user" | string;
export type MessageContent = { role?: MessageRole; text?: string; files?: MessageFile[]; html?: string; custom?: any };