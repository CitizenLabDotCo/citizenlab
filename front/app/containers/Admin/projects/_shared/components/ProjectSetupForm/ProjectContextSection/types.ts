export interface Props {
  projectContext: ProjectContext;
  space_id?: string | null;
  folder_id?: string | null;
  error: boolean;
  onSetContext: (context: ProjectContext) => void;
  onChangeSpace: (spaceAndFolderId: SpaceAndFolderId) => void;
  onChangeFolder: (spaceAndFolderId: SpaceAndFolderId) => void;
}

export type SpaceAndFolderId = {
  space_id: string | null;
  folder_id: string | null;
};

export type ProjectContext = 'root' | 'folder' | 'space';

export type FormSituation =
  | 'creating'
  | 'editing-project-in-root'
  | 'editing-project-not-in-root';
