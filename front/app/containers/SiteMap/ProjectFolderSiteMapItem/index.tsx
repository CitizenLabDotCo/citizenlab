import React from 'react';
// hooks
import useAdminPublications from 'hooks/useAdminPublications';
import useProjectFolder from 'hooks/useProjectFolder';
// typings
import { PublicationStatus } from 'services/projects';
// intl
import { FormattedMessage } from 'utils/cl-intl';
import Link from 'utils/cl-router/Link';
import { isNilOrError } from 'utils/helperUtils';
// components
import { H3, H4 } from 'containers/SiteMap';
import Project from 'containers/SiteMap/Project';
import messages from 'containers/SiteMap/messages';
import T from 'components/T';

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

  const folder = useProjectFolder({ projectFolderId });
  const { list: childAdminPublications } = useAdminPublications({
    childrenOfId: projectFolderId,
    publicationStatusFilter: publicationStatuses,
  });

  if (!isNilOrError(folder)) {
    return (
      <>
        <TitleComponent>
          <T value={folder.attributes.title_multiloc} />
        </TitleComponent>
        <ul>
          <li>
            <Link to={`/folders/${folder.attributes.slug}`}>
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
