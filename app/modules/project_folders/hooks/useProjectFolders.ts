import { useState, useEffect } from 'react';
import {
  IProjectFolderData,
  projectFoldersStream,
} from 'modules/project_folders/services/projectFolders';

interface Props {
  filterIds?: string[];
}

function useProjectFolders({ filterIds }: Props) {
  const [projectFolders, setProjectFolders] = useState<IProjectFolderData[]>(
    []
  );

  useEffect(() => {
    const streamPayload = filterIds
      ? { queryParameters: { filter_ids: filterIds } }
      : null;

    const subscription = projectFoldersStream(
      streamPayload
    ).observable.subscribe((streamFolders) => {
      setProjectFolders(streamFolders.data);
    });

    return () => subscription?.unsubscribe();
  }, [filterIds]);

  return { projectFolders };
}

export default useProjectFolders;
