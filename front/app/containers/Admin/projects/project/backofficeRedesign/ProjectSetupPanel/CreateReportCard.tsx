import React from 'react';

import { useIntl } from 'utils/cl-intl';

import messages from '../messages';

import SetupCard from './SetupCard';

const CreateReportCard = () => {
  const { formatMessage } = useIntl();

  return (
    <SetupCard
      id="e2e-next-action-create-report"
      title={formatMessage(messages.actionCreateReport)}
      behaviour={{
        kind: 'action',
        icon: 'chevron-right',
        // Placeholder: the report flow is still being designed by another tandem
        onClick: () => {},
      }}
    />
  );
};

export default CreateReportCard;
