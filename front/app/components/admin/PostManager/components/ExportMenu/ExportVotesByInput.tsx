import React, { useState } from 'react';

import { fontSizes, Button } from '@citizenlab/cl2-component-library';
import saveAs from 'file-saver';
import { useParams } from 'react-router-dom';

import usePhases from 'api/phases/usePhases';

import { API_PATH } from 'containers/App/constants';

import { FormattedMessage, useIntl } from 'utils/cl-intl';
import { requestBlob } from 'utils/requestBlob';

import messages from '../../messages';

const ExportVotesByInput = () => {
  const [exporting, setExporting] = useState(false);
  const { formatMessage, formatDate } = useIntl();
  const { projectId } = useParams() as { projectId: string };
  const { data: phases } = usePhases(projectId);

  const hasVotingPhase = phases?.data.some(
    (phase) => phase.attributes.participation_method === 'voting'
  );

  // Do not show this button for projects without a voting phase
  if (!hasVotingPhase) {
    return null;
  }

  const handleExportVotesByInput = async () => {
    setExporting(true);
    const apiPath = `${API_PATH}/projects/${projectId}/votes_by_input_xlsx`;
    const blob = await requestBlob(
      apiPath,
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );

    saveAs(
      blob,
      `${formatMessage(messages.votesByInputExportFileName)}_${formatDate(
        Date.now()
      )}.xlsx`
    );
    setExporting(false);
  };

  return (
    <Button
      buttonStyle="text"
      onClick={handleExportVotesByInput}
      processing={exporting}
      padding="0"
      fontSize={`${fontSizes.s}px`}
    >
      <FormattedMessage {...messages.exportVotesByInput} />
    </Button>
  );
};

export default ExportVotesByInput;
