export enum Gender {
  BOY = 'boy',
  GIRL = 'girl',
  UNSPECIFIED = 'child',
}

export interface StoryParams {
  gender: Gender;
  age: number;
  theme: string;
  language: string;
}

export interface Scene {
  id: string;
  text: string;
  imagePrompt: string;
  imageUrl?: string;
}

export interface Character {
  name: string;
  description: string;
  imageUrl?: string;
}

export interface Story {
  id: string;
  title: string;
  params: StoryParams;
  scenes: Scene[];
  characters: Character[];
  createdAt: number;
}