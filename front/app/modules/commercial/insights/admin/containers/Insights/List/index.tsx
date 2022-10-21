import React, { useState } from 'react';

// utils
import { isNilOrError } from 'utils/helperUtils';

// components
import Modal from 'components/UI/Modal';
import useInsightsViews from 'modules/commercial/insights/hooks/useInsightsViews';
import CreateInsightsView from './CreateInsightsView';
import EmptyState from './EmptyState';
import InsightsList from './InsightsList';

const Insights = () => {
  const [createModalOpened, setCreateModalOpened] = useState(false);

  const closeCreateModal = () => setCreateModalOpened(false);
  const openCreateModal = () => setCreateModalOpened(true);

  const insightsViews = useInsightsViews();

  if (isNilOrError(insightsViews)) {
    return null;
  }

  return (
    <div>
      {insightsViews.length === 0 ? (
        <EmptyState openCreateModal={openCreateModal} />
      ) : (
        <InsightsList openCreateModal={openCreateModal} data={insightsViews} />
      )}
      <Modal opened={createModalOpened} close={closeCreateModal}>
        <CreateInsightsView closeCreateModal={closeCreateModal} />
      </Modal>
    </div>
  );
};

export default Insights;
