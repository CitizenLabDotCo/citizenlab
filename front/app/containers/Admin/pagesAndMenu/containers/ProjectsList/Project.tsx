import React from 'react';

import { IAdminPublicationData } from 'api/admin_publications/types';
import useProjectById from 'api/projects/useProjectById';

import ProjectRow from 'containers/Admin/projects/components/ProjectRow';

import { Row } from 'components/admin/ResourceList';

interface Props {
  adminPublication: IAdminPublicationData;
  isLastItem: boolean;
}

const Project = ({ adminPublication, isLastItem }: Props) => {
  const { data: project } = useProjectById(
    adminPublication.relationships.publication.data.id
  );
  const folderId = project?.data.attributes.folder_id;

  return (
    <Row
      id={adminPublication.id}
      isLastItem={isLastItem}
      key={adminPublication.id}
    >
      <ProjectRow
        publication={adminPublication}
        actions={['manage']}
        hideMoreActions
        folderId={folderId}
      />
    </Row>
  );
};

export default Project;
