import React, { useState } from 'react';

// utils
import { isNilOrError } from 'utils/helperUtils';

// components
import EmptyState from './EmptyState';
import InsightsList from './InsightsList';
import Modal from 'components/UI/Modal';
import CreateInsightsView from './CreateInsightsView';
import useViews from 'modules/commercial/insights/api/views/useViews';
import Warning from 'components/UI/Warning';
import { Title, Text, Box } from '@citizenlab/cl2-component-library';
import messages from '../messages';
import { useIntl } from 'utils/cl-intl';

const Insights = () => {
  const { formatMessage } = useIntl();
  const [createModalOpened, setCreateModalOpened] = useState(false);

  const closeCreateModal = () => setCreateModalOpened(false);
  const openCreateModal = () => setCreateModalOpened(true);

  const { data: views } = useViews();

  if (isNilOrError(views)) {
    return null;
  }

  return (
    <div>
      <Box mb="16px">
        <Warning>
          <>
            <Title variant="h3" m="0px" pb="0px">
              {formatMessage(messages.deprecationWarningTitle)}
            </Title>
            <Text m="0px" p="0px">
              {formatMessage(messages.deprecationWarningDescription)}
            </Text>
          </>
        </Warning>
      </Box>
      {views.data.length === 0 ? (
        <EmptyState openCreateModal={openCreateModal} />
      ) : (
        <InsightsList openCreateModal={openCreateModal} data={views.data} />
      )}
      <Modal opened={createModalOpened} close={closeCreateModal}>
        <CreateInsightsView closeCreateModal={closeCreateModal} />
      </Modal>
    </div>
  );
};

export default Insights;
