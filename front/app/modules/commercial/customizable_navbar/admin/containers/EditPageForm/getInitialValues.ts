import { IPageData } from 'services/pages';
import { useRemoteFilesOutput } from 'hooks/useRemoteFiles';

const getInitialValues = (
  page: IPageData,
  remotePageFiles: useRemoteFilesOutput
) => ({
  title_multiloc: page.attributes.title_multiloc,
  body_multiloc: page.attributes.body_multiloc,
  slug: page.attributes.slug,
  local_page_files: remotePageFiles,
});

export default getInitialValues;
