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
import { IAdminPublicationContent } from 'hooks/useAdminPublications';
import useAdminPublicationChildren from 'hooks/useAdminPublicationChildren';

// typings
import { PublicationStatus } from 'resources/GetProjects';

interface Props {
  adminPublication: IAdminPublicationContent;
  hightestTitle: 'h3' | 'h4';
}

const publicationStatuses: PublicationStatus[] = [
  'published',
  'archived',
  'draft',
];

const ProjectFolderSitemap = ({ adminPublication, hightestTitle }: Props) => {
  const TitleComponent = hightestTitle === 'h3' ? H3 : H4;

  const childProjects = useAdminPublicationChildren({
    publicationId: adminPublication.id,
    publicationStatusFilter: publicationStatuses,
  });

  return (
    <>
      <TitleComponent>
        <T value={adminPublication.attributes.publication_title_multiloc} />
      </TitleComponent>
      <ul>
        <li>
          <Link
            to={`/adminPublication/${adminPublication.attributes.publication_slug}/info`}
          >
            <FormattedMessage {...messages.folderInfo} />
          </Link>
        </li>
        {!isNilOrError(childProjects) &&
          childProjects.map((adminPublication) => (
            <Project
              key={adminPublication.id}
              hightestTitle="h4"
              adminPublication={adminPublication}
            />
          ))}
      </ul>
    </>
  );
};

export default ProjectFolderSitemap;
