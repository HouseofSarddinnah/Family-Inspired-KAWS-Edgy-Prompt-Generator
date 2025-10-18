
export interface PromptOptions {
  characterGroup: string;
  kawsCharacters: string[];
  cartoonChars: string[];
  themes: string[];
  colorway: string;
  finish: string;
  poses: string[];
  streetwear: string[];
  scene: string;
  effects: string[];
  vibe: string;
}

export type OptionCategory = keyof PromptOptions;

export type CopyStatus = 'idle' | 'copied' | 'failed';
