// Where an item sits, as the fields that put it there: a project's folder and
// space, a folder's space. Moving sends the destination's; Undo, the old ones.
export type Placement = {
  folder_id?: string | null;
  space_id: string | null;
};

export type Destination = {
  key: string;
  kind: 'space' | 'folder' | 'none';
  label: string;
  // The space a folder is in.
  detail?: string;
  placement: Placement;
};

type Named = { id: string; title: string };
type FolderInfo = Named & { spaceId: string | null };

interface Params {
  item: 'project' | 'folder';
  // The spaces this user can move into, in their order; none when spaces are
  // off.
  spaces: Named[];
  folders: FolderInfo[];
  // Only admins can take an item out of every space and folder, or into a
  // folder outside the spaces.
  isAdmin: boolean;
  noneLabel: string;
}

const byTitle = (a: Named, b: Named) => a.title.localeCompare(b.title);

// The places an item can be moved to, as the prototype lists them: each space,
// followed by its folders for a project; for admins, then the folders outside
// any space and a way out of them all.
export const getDestinations = ({
  item,
  spaces,
  folders,
  isAdmin,
  noneLabel,
}: Params): Destination[] => {
  const folderDestination = (folder: FolderInfo, detail?: string) => ({
    key: `folder:${folder.id}`,
    kind: 'folder' as const,
    label: folder.title,
    detail,
    placement: { folder_id: folder.id, space_id: folder.spaceId },
  });

  const destinations: Destination[] = spaces.flatMap((space) => [
    {
      key: `space:${space.id}`,
      kind: 'space',
      label: space.title,
      placement:
        item === 'project'
          ? { folder_id: null, space_id: space.id }
          : { space_id: space.id },
    },
    ...(item === 'project'
      ? folders
          .filter((folder) => folder.spaceId === space.id)
          .sort(byTitle)
          .map((folder) => folderDestination(folder, space.title))
      : []),
  ]);

  if (!isAdmin) return destinations;

  if (item === 'project') {
    destinations.push(
      ...folders
        .filter((folder) => folder.spaceId === null)
        .sort(byTitle)
        .map((folder) => folderDestination(folder))
    );
  }
  destinations.push({
    key: 'none',
    kind: 'none',
    label: noneLabel,
    placement:
      item === 'project'
        ? { folder_id: null, space_id: null }
        : { space_id: null },
  });

  return destinations;
};

// The destination an item is already in.
export const getHereKey = ({ folder_id, space_id }: Placement) =>
  folder_id ? `folder:${folder_id}` : space_id ? `space:${space_id}` : 'none';
