import { useState, useEffect } from 'react';
import { isNilOrError } from 'utils/helperUtils';
import {
  IProjectFolderData,
  projectFoldersStream,
} from 'modules/project_folders/services/projectFolders';

interface Options {
  filterIds?: string[];
}

function useProjectFolders(options = <Options>{ filterIds: [] }) {
  const [projectFolders, setProjectFolders] = useState<IProjectFolderData[]>(
    []
  );

  useEffect(() => {
    const { filterIds } = options;
    let streamPayload;

    if (!isNilOrError(filterIds) && filterIds?.length > 0) {
      streamPayload = filterIds
        ? { queryParameters: { filter_ids: filterIds } }
        : null;
    }

    const subscription = projectFoldersStream(
      streamPayload
    ).observable.subscribe((streamFolders) => {
      setProjectFolders(streamFolders.data);
    });

    return () => subscription?.unsubscribe();
  }, [options.filterIds]);

  return { projectFolders };
}

export default useProjectFolders;
