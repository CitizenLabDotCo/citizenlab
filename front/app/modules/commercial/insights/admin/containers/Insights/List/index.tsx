import React, { useState } from 'react';

// utils
import { isNilOrError } from 'utils/helperUtils';

// components
import EmptyState from './EmptyState';
import InsightsList from './InsightsList';
import Modal from 'components/UI/Modal';
import CreateInsightsView from './CreateInsightsView';
import useViews from 'modules/commercial/insights/api/views/useViews';

const Insights = () => {
  const [createModalOpened, setCreateModalOpened] = useState(false);

  const closeCreateModal = () => setCreateModalOpened(false);
  const openCreateModal = () => setCreateModalOpened(true);

  const { data: views } = useViews();

  if (isNilOrError(views)) {
    return null;
  }

  return (
    <div>
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
