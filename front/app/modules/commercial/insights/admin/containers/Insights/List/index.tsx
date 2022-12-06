import React, { useState } from 'react';
import useInsightsViews from 'modules/commercial/insights/hooks/useInsightsViews';
// utils
import { isNilOrError } from 'utils/helperUtils';
import Modal from 'components/UI/Modal';
import CreateInsightsView from './CreateInsightsView';
// components
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
