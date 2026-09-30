import { SupportedLocale } from 'typings';

// The four "levers" the manager confirms before generating. Each is a spectrum
// with three stops (0, 1, 2); the backend prompt turns them into guidance for
// the draft. Kept as plain indices so the contract stays stable if labels change.
export type ProjectGenerationLevers = {
  influence: number;
  how_fixed: number;
  reach: number;
  audience: number;
};

export type AddProjectGenerationParams = {
  projectId: string;
  prompt: string;
  locale: SupportedLocale;
  fileIds: string[];
  levers: ProjectGenerationLevers;
};
