import React from 'react';

import generalMessages from 'containers/Admin/projects/project/general/messages';

import Banner from 'design-system/Banner';

import { useIntl } from 'utils/cl-intl';

import { useSetupDraft } from './SetupDraftContext';

const SaveError = () => {
  const { formatMessage } = useIntl();
  const { saveFailed } = useSetupDraft();

  if (!saveFailed) return null;

  return (
    <Banner tone="error">
      {formatMessage(generalMessages.saveErrorMessage)}
    </Banner>
  );
};

export default SaveError;
