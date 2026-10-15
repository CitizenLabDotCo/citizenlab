import React from 'react';

import generalMessages from 'containers/Admin/projects/project/general/messages';

import Error from 'components/UI/Error';

import { useIntl } from 'utils/cl-intl';

import { useSetupDraft } from './SetupDraftContext';

const SaveError = () => {
  const { formatMessage } = useIntl();
  const { errors } = useSetupDraft();

  if (!errors) return null;

  return <Error text={formatMessage(generalMessages.saveErrorMessage)} />;
};

export default SaveError;
