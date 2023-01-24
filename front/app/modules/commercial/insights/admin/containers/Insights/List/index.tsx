import React, { useState } from 'react';

// utils
import { isNilOrError } from 'utils/helperUtils';

// components
import EmptyState from './EmptyState';
import { useViews } from 'modules/commercial/insights/services/views';
import InsightsList from './InsightsList';
import Modal from 'components/UI/Modal';
import CreateInsightsView from './CreateInsightsView';

const Insights = () => {
  const [createModalOpened, setCreateModalOpened] = useState(false);

  const closeCreateModal = () => setCreateModalOpened(false);
  const openCreateModal = () => setCreateModalOpened(true);

  const { data } = useViews();
  if (isNilOrError(data)) {
    return null;
  }

  return (
    <div>
      {data.data.length === 0 ? (
        <EmptyState openCreateModal={openCreateModal} />
      ) : (
        <InsightsList openCreateModal={openCreateModal} data={data.data} />
      )}
      <Modal opened={createModalOpened} close={closeCreateModal}>
        <CreateInsightsView closeCreateModal={closeCreateModal} />
      </Modal>
    </div>
  );
};

export default Insights;
