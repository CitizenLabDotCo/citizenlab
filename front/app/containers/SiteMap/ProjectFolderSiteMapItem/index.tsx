import React from 'react';

import useAdminPublications from 'api/admin_publications/useAdminPublications';
import useProjectFolderById from 'api/project_folders/useProjectFolderById';
import { PublicationStatus } from 'api/projects/types';

import { H3, H4 } from 'containers/SiteMap';
import messages from 'containers/SiteMap/messages';
import Project from 'containers/SiteMap/Project';

import T from 'components/T';

import { FormattedMessage } from 'utils/cl-intl';
import Link from 'utils/cl-router/Link';
import { isNilOrError } from 'utils/helperUtils';

interface Props {
  hightestTitle: 'h3' | 'h4';
  projectFolderId: string;
}

const publicationStatuses: PublicationStatus[] = [
  'published',
  'archived',
  'draft',
];

const ProjectFolderSitemap = ({ projectFolderId, hightestTitle }: Props) => {
  const TitleComponent = hightestTitle === 'h3' ? H3 : H4;

  const { data: folder } = useProjectFolderById(projectFolderId);
  const { data: adminPublications } = useAdminPublications({
    childrenOfId: projectFolderId,
    publicationStatusFilter: publicationStatuses,
    remove_all_unlisted: true,
  });

  const childAdminPublications = adminPublications?.pages
    .map((page) => page.data)
    .flat();

  if (folder && !isNilOrError(folder.data)) {
    return (
      <>
        <TitleComponent>
          <T value={folder.data.attributes.title_multiloc} />
        </TitleComponent>
        <ul>
          <li>
            <Link to={`/folders/${folder.data.attributes.slug}`}>
              <FormattedMessage {...messages.folderInfo} />
            </Link>
          </li>
          {!isNilOrError(childAdminPublications) &&
            childAdminPublications.map((adminPublication) => (
              <Project
                key={adminPublication.id}
                hightestTitle="h4"
                projectId={adminPublication.relationships.publication.data.id}
              />
            ))}
        </ul>
      </>
    );
  }

  return null;
};

export default ProjectFolderSitemap;
