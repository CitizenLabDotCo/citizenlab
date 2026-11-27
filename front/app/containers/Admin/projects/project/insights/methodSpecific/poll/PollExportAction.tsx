import React from 'react';

import { IPhaseData } from 'api/phases/types';
import exportPollResponses from 'api/poll_responses/exportPollResponses';

import useLocalize from 'hooks/useLocalize';

import pollMessages from 'containers/Admin/projects/project/poll/messages';
import pollTracks from 'containers/Admin/projects/project/poll/tracks';

import { trackEventByName } from 'utils/analytics';
import { useIntl } from 'utils/cl-intl';

import ExportMenuAction from '../../ExportMenuAction';
import getExportFilename from '../../getExportFilename';

interface Props {
  phase: IPhaseData;
}

const PollExportAction = ({ phase }: Props) => {
  const { formatMessage } = useIntl();
  const localize = useLocalize();

  const exportResponses = async () => {
    const phaseName = localize(phase.attributes.title_multiloc);
    trackEventByName(pollTracks.clickExportPoll, {
      phaseId: phase.id,
      phaseName,
    });

    await exportPollResponses(
      phase.id,
      `${formatMessage(pollMessages.pollExportFileName)}_${getExportFilename(
        phaseName,
        phase.id
      )}.xlsx`
    );
  };

  return (
    <ExportMenuAction
      items={[
        {
          label: formatMessage(pollMessages.exportPollResults),
          onExport: exportResponses,
        },
      ]}
    />
  );
};

export default PollExportAction;
