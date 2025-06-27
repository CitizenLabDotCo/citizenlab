import React, { Fragment } from 'react';

import { Text, Box } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import { IAdminPublicationData } from 'api/admin_publications/types';
import useReorderAdminPublication from 'api/admin_publications/useReorderAdminPublication';

import SortableList from 'components/admin/ResourceList/SortableList';
import SortableRow from 'components/admin/ResourceList/SortableRow';
import Warning from 'components/UI/Warning';

import { useIntl } from 'utils/cl-intl';

import ProjectRow from '../../../components/ProjectRow';
import messages from '../messages';

import SortableFolderRow from './SortableFolderRow';

const StyledSortableRow = styled(SortableRow)`
  & .sortablerow-draghandle {
    align-self: flex-start;
  }
`;

const SortableProjectList = ({
  adminPublications,
}: {
  adminPublications: IAdminPublicationData[] | undefined;
}) => {
  const { mutate: reorderAdminPublication } = useReorderAdminPublication();
  const { formatMessage } = useIntl();

  function handleReorderAdminPublication(itemId: string, newOrder: number) {
    reorderAdminPublication({ id: itemId, ordering: newOrder });
  }

  if (!adminPublications) return null;

  if (adminPublications.length === 0) {
    return (
      <Text color="textSecondary" mt="16px">
        {formatMessage(messages.noProjectsFound)}
      </Text>
    );
  }

  return (
    <>
      <Box py="16px">
        <Warning>{formatMessage(messages.homepageWarning)}</Warning>
      </Box>
      <SortableList
        items={adminPublications}
        onReorder={handleReorderAdminPublication}
        className="projects-list e2e-admin-projects-list"
        id="e2e-admin-projects-list-unsortable"
        key={adminPublications.length}
      >
        {({ itemsList, handleDragRow, handleDropRow }) => {
          return (
            <>
              {itemsList.map((item: IAdminPublicationData, index: number) => {
                return (
                  <Fragment key={item.id}>
                    {item.relationships.publication.data.type === 'project' && (
                      <StyledSortableRow
                        id={item.id}
                        index={index}
                        moveRow={handleDragRow}
                        dropRow={handleDropRow}
                        isLastItem={index === adminPublications.length - 1}
                      >
                        <ProjectRow actions={['manage']} publication={item} />
                      </StyledSortableRow>
                    )}
                    {item.relationships.publication.data.type === 'folder' && (
                      <SortableFolderRow
                        id={item.id}
                        index={index}
                        moveRow={handleDragRow}
                        dropRow={handleDropRow}
                        isLastItem={index === adminPublications.length - 1}
                        publication={item}
                      />
                    )}
                  </Fragment>
                );
              })}
            </>
          );
        }}
      </SortableList>
    </>
  );
};

export default SortableProjectList;
