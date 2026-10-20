import useFiles from 'api/files/useFiles';

import { getPageNumberFromUrl } from 'utils/paginationUtils';

// The files endpoint returns no total, but with one file per page the last
// page number is the number of files.
const useFilesCount = (projectId: string, search?: string) => {
  const { data: files } = useFiles({
    project: [projectId],
    search,
    pageSize: 1,
  });

  if (!files) return undefined;
  if (files.data.length === 0) return 0;

  return getPageNumberFromUrl(files.links.last) ?? files.data.length;
};

export default useFilesCount;
