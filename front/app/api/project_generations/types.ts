import { SupportedLocale } from 'typings';

// The "levers" the manager confirms before generating. Each is a spectrum
// with three stops (0, 1, 2); the backend prompt turns them into guidance for
// the draft. Kept as plain indices so the contract stays stable if labels change.
export type ProjectGenerationLevers = {
  influence: number;
  how_fixed: number;
  reach: number;
  audience: number;
  // Whether input is gathered in the open (ideation) or in a more private
  // setting (survey) — mirrors the intake's open-vs-private question.
  format: number;
};

export type AddProjectGenerationParams = {
  projectId: string;
  locale: SupportedLocale;
  // A full generation sends a prompt (+ optional files and levers). A targeted
  // edit of an existing draft sends `instruction` instead — the backend routes
  // it to the project editor, which patches the draft in place.
  prompt?: string;
  fileIds?: string[];
  levers?: ProjectGenerationLevers;
  instruction?: string;
};
