import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import { IAdminPublicationData } from 'api/admin_publications/types';

import ProjectRow from 'containers/Admin/projects/components/ProjectRow';

import { List, Row } from 'components/admin/ResourceList';

interface Props {
  folderChildAdminPublications: IAdminPublicationData[];
  folderId?: string;
  isLastFolder: boolean;
}

const FolderChildProjects = ({
  folderChildAdminPublications,
  folderId,
  isLastFolder,
}: Props) => {
  return (
    <Box pl="60px">
      <List>
        <>
          {folderChildAdminPublications.map((childPublication, index) => {
            const isLastItem =
              index === folderChildAdminPublications.length - 1;
            return (
              <Row
                key={childPublication.id}
                isLastItem={isLastItem && isLastFolder}
              >
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
