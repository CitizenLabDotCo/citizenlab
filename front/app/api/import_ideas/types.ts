import { SupportedLocale } from 'typings';

import { Keys } from 'utils/cl-react-query/types';

import { importedIdeasKeys, importedIdeaMetadataKeys } from './keys';

export type ImportedIdeasKeys = Keys<typeof importedIdeasKeys>;
export type ImportedIdeaMetadataKeys = Keys<typeof importedIdeaMetadataKeys>;

export interface QueryParams {
  projectId?: string;
  phaseId?: string;
}

export interface ImportedIdeaMetadataQueryParams {
  id?: string;
}

export interface ImportedIdeaMetadata {
  id: string;
  type: 'idea_import';
  attributes: {
    created_at: string;
    file: {
      url: string;
    };
    import_type: 'pdf' | 'xlsx';
    locale: SupportedLocale;
    updated_at: string;
    page_range: string[];
    user_consent: boolean;
    user_created: boolean;
  };
}

export interface ImportedIdeaMetadataResponse {
  data: ImportedIdeaMetadata;
}

export interface CreateOfflineIdeasParams {
  phaseId: string;
  locale: SupportedLocale;
  email?: string;
  first_name?: string;
  last_name?: string;
}
