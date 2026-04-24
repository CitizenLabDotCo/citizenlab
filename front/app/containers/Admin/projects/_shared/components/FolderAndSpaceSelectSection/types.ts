export interface BaseProps {
  projectContext: ProjectContext;
  space_id?: string | null;
  folder_id?: string | null;
  onChange: (args: {
    space_id?: string | null;
    folder_id?: string | null;
  }) => void;
}

export type ProjectContext = 'root' | 'folder' | 'space';
