import React from 'react';
import { List, Row } from 'components/admin/ResourceList';
import { Box } from '@citizenlab/cl2-component-library';
import { IAdminPublicationContent } from 'hooks/useAdminPublications';
import ProjectRow from 'containers/Admin/projects/components/ProjectRow';

interface Props {
  folderChildAdminPublications: IAdminPublicationContent[];
}

const FolderChildProjects = ({ folderChildAdminPublications }: Props) => {
  return (
    <Box pl="60px">
      <List>
        {folderChildAdminPublications.map((childPublication) => {
          return (
            <Row key={childPublication.id}>
              <ProjectRow publication={childPublication} actions={['manage']} />
            </Row>
          );
        })}
      </List>
    </Box>
  );
};

export default FolderChildProjects;
