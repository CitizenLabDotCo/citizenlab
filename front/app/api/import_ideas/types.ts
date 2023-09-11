import { Keys } from 'utils/cl-react-query/types';
import { importedIdeasKeys, importedIdeaMetadataKeys } from './keys';
import { Locale } from 'typings';

export type ImportedIdeasKeys = Keys<typeof importedIdeasKeys>;
export type ImportedIdeaMetadataKeys = Keys<typeof importedIdeaMetadataKeys>;

export interface QueryParams {
  projectId: string;
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
    updated_at: string;
    import_type: 'pdf' | 'xlsx';
    page_range: string[];
    user_created: boolean;
    locale: Locale;
    file: {
      url: string;
    };
  };
}

export interface ImportedIdeaMetadataResponse {
  data: ImportedIdeaMetadata;
}
