import React from 'react';
import { isNilOrError } from 'utils/helperUtils';

// components
import { H3, H4 } from 'containers/SiteMap';
import T from 'components/T';
import Link from 'utils/cl-router/Link';
import Project from 'containers/SiteMap/Project';

// intl
import { FormattedMessage } from 'utils/cl-intl';
import messages from 'containers/SiteMap/messages';

// hooks
import useAdminPublications from 'hooks/useAdminPublications';
import useProjectFolder from '../../../hooks/useProjectFolder';

// typings
import { PublicationStatus } from 'resources/GetProjects';

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
