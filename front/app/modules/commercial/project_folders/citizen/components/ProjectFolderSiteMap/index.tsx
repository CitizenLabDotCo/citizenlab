import React, { useMemo } from 'react';
import { adopt } from 'react-adopt';
import { isNilOrError } from 'utils/helperUtils';
import { H3, H4 } from 'containers/SiteMap';
import T from 'components/T';
import Link from 'utils/cl-router/Link';

// intl
import { FormattedMessage } from 'utils/cl-intl';
import messages from 'containers/SiteMap/messages';
import {
  IAdminPublicationContent,
  IUseAdminPublicationsOutput,
} from 'hooks/useAdminPublications';
import GetAdminPublications from 'resources/GetAdminPublications';
import Project from 'containers/SiteMap/Project';

interface InputProps {
  adminPublication: IAdminPublicationContent;
  hightestTitle: 'h3' | 'h4';
}
interface DataProps {
  adminPublications: IUseAdminPublicationsOutput;
}

interface Props extends InputProps, DataProps {}

const ProjectFolderSitemap = ({
  adminPublication,
  hightestTitle,
  adminPublications: { childrenOf },
}: Props) => {
  const TitleComponent = hightestTitle === 'h3' ? H3 : H4;

  const childProjects = useMemo(() => childrenOf(adminPublication), [
    childrenOf,
    adminPublication,
  ]);

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

const Data = adopt<DataProps, InputProps>({
  adminPublications: ({ render }) => (
    <GetAdminPublications
      publicationStatusFilter={['published', 'archived', 'draft']}
      includeChildrenOf={true}
    >
      {render}
    </GetAdminPublications>
  ),
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {(dataprops) => <ProjectFolderSitemap {...inputProps} {...dataprops} />}
  </Data>
);
