import { Keys } from 'utils/cl-react-query/types';
import { importedIdeasKeys, importedIdeaMetadataKeys } from './keys';

export type ImportedIdeasKeys = Keys<typeof importedIdeasKeys>;
export type ImportedIdeaMetadataKeys = Keys<typeof importedIdeaMetadataKeys>;

export interface QueryParams {
  projectId: string;
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
    import_type: string;
    page_range: string[];
    user_created: boolean;
    file: {
      url: string;
    };
  };
}

export interface ImportedIdeaMetadataResponse {
  data: ImportedIdeaMetadata;
}
