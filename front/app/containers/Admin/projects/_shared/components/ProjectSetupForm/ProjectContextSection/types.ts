export interface Props {
  projectContext: ProjectContext;
  space_id?: string | null;
  folder_id?: string | null;
  onSetContext: (context: ProjectContext) => void;
  onChangeSpace: (space_id: string | null) => void;
  onChangeFolder: (folder_id: string | null) => void;
}

export type ProjectContext = 'root' | 'folder' | 'space';

export type FormSituation =
  | 'creating'
  | 'editing-project-in-root'
  | 'editing-project-not-in-root';
