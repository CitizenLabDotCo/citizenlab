export interface Props {
  spaceId?: string | null;
  folderId?: string | null;
  // Whether the project was in root — no space, no folder — when the form
  // opened. True when creating.
  projectInRoot: boolean;
  error: boolean;
  onChange: (spaceAndFolderId: SpaceAndFolderId) => void;
}

// Snake cased because this is passed straight through to the project
// attributes diff that gets sent to the API.
export type SpaceAndFolderId = {
  space_id: string | null;
  folder_id: string | null;
};
