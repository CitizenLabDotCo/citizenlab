import { IconNames } from '@citizenlab/cl2-component-library';

// prototype data — the shapes the assistant fills in. In the real feature these
// map to a project + its phases + a survey form; here they drive the live
// preview so we can react to the experience.

export type DraftPhase = {
  title: string;
  method: string;
  icon: IconNames;
  duration: string;
  description: string;
};

export type DraftQuestion = {
  title: string;
  type: string;
  icon: IconNames;
};

export type GeneratedDraft = {
  title: string;
  tagline: string;
  description: string;
  goal: string;
  phases: DraftPhase[];
  survey: DraftQuestion[];
};

// The four "levers" the assistant confirms before it drafts. Each is a spectrum
// with three stops; the middle is the sensible default.
export type LeverId = 'influence' | 'howFixed' | 'reach' | 'audience';

export type Lever = {
  id: LeverId;
  question: string;
  options: string[];
};

// One turn in the assistant conversation.
export type Exchange = {
  id: string;
  prompt: string;
  fileNames: string[];
};

export type AssistantMode =
  | 'start' // three start cards
  | 'composer' // brief + attachments
  | 'levers' // confirm the four levers
  | 'generating' // staged progress
  | 'review'; // draft is in, offer refine
