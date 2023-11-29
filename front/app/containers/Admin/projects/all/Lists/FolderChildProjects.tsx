import React from 'react';
import { List, Row } from 'components/admin/ResourceList';
import { Box } from '@citizenlab/cl2-component-library';
import ProjectRow from 'containers/Admin/projects/components/ProjectRow';
import { IAdminPublicationData } from 'api/admin_publications/types';

interface Props {
  folderChildAdminPublications: IAdminPublicationData[];
  folderId?: string;
}

const FolderChildProjects = ({
  folderChildAdminPublications,
  folderId,
}: Props) => {
  return (
    <Box pl="60px">
      <List>
        <>
          {folderChildAdminPublications.map((childPublication, index) => {
            const isLastItem =
              index === folderChildAdminPublications.length - 1;
            return (
              <Row key={childPublication.id} isLastItem={isLastItem}>
                <ProjectRow
                  publication={childPublication}
                  actions={['manage']}
                  folderId={folderId}
                />
              </Row>
            );
          })}
        </>
      </List>
    </Box>
  );
};

export default FolderChildProjects;
