import { SupportedLocale } from 'typings';

export type AddSurveyGenerationParams = {
  phaseId: string;
  prompt: string;
  locale: SupportedLocale;
  fileIds: string[];
};
