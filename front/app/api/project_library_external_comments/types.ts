export interface ExternalCommentReqBody {
  author_first_name: string;
  author_last_name: string;
  body: string;
}

interface ExternalCommentData {
  id: string;
  type: 'project_library_external_comment';
  attributes: {
    project_id: string;
    author_first_name: string;
    author_last_name: string;
    author_type: 'User' | 'ExternalUser';
    body: string;
    body_updated_at: string;
    created_at: string;
    tenant_name: string;
    updated_at: string;
  };
}

export interface ExternalComment {
  data: ExternalCommentData;
}
