export interface Props {
  space_id?: string | null;
  folder_id?: string | null;
  error: boolean;
  onChange: (spaceAndFolderId: SpaceAndFolderId) => void;
}

export type SpaceAndFolderId = {
  space_id: string | null;
  folder_id: string | null;
};

export type FormSituation =
  | 'creating'
  | 'editing-project-in-root'
  | 'editing-project-not-in-root';
