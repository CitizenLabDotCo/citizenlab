export interface Props {
  projectContext: ProjectContext;
  space_id?: string | null;
  folder_id?: string | null;
  onSetContext: (context: ProjectContext) => void;
  onChangeSpace: (space_id: string) => void;
  onChangeFolder: (folder_id: string) => void;
}

export type ProjectContext = 'root' | 'folder' | 'space';
