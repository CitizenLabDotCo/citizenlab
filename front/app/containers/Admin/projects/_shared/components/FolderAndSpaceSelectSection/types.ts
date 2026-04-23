export interface Props {
  space_id?: string | null;
  folder_id?: string | null;
  onChange: (args: {
    space_id?: string | null;
    folder_id?: string | null;
  }) => void;
}
