import { Keys } from 'utils/cl-react-query/types';

import projectLibraryExternalCommentsKeys from './keys';

export type ProjectLibraryExternalCommentsKeys = Keys<
  typeof projectLibraryExternalCommentsKeys
>;

interface ExternalCommentReqBody {
  author_first_name: string;
  author_last_name: string;
  body: string;
}

export type ProjectId = { projectId: string };

export type GetParams = ProjectId & {
  'page[number]'?: number;
  'page[size]'?: number;
};

export type AddParams = ProjectId & {
  externalCommentReqBody: ExternalCommentReqBody;
};

export type UpdateParams = AddParams & {
  externalCommentId: string;
};

export type DeleteParams = ProjectId & {
  externalCommentId: string;
};

interface ExternalCommentData {
  id: string;
  type: 'project_library_external_comment';
  attributes: {
    author_first_name: string;
    author_id: string;
    author_last_name: string;
    author_type: 'User' | 'ExternalUser';
    body: string;
    body_updated_at: string;
    created_at: string;
    project_id: string;
    tenant_name: string;
    updated_at: string;
  };
}

export interface ExternalComment {
  data: ExternalCommentData;
}

export interface ExternalComments {
  data: ExternalCommentData[];
}
