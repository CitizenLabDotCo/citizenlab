import React, { useState } from 'react';

// utils
import { isNilOrError } from 'utils/helperUtils';

// i18n
import { InjectedIntlProps } from 'react-intl';

// components
import EmptyState from './EmptyState';
import useInsightsViews from '../../../../hooks/useInsightsViews';
import InsightsList from './InsightsList';
import Modal from 'components/UI/Modal';
import CreateInsightsView from './CreateInsightsView';

const Insights: React.FC<InjectedIntlProps> = () => {
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
