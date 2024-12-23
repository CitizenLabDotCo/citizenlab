import React from 'react';

import { Button, Box, IconTooltip } from '@citizenlab/cl2-component-library';
import saveAs from 'file-saver';
import moment from 'moment';

import usePhase from 'api/phases/usePhase';

import useLocalize from 'hooks/useLocalize';

import { API_PATH } from 'containers/App/constants';

import { trackEventByName } from 'utils/analytics';
import { FormattedMessage, useIntl } from 'utils/cl-intl';
import { requestBlob } from 'utils/requestBlob';

import messages from './messages';
import tracks from './tracks';

type Props = {
  phaseId: string;
  customFieldId: string;
};

const ExportGeoJSONButton = ({ phaseId, customFieldId }: Props) => {
  const { formatMessage } = useIntl();
  const localize = useLocalize();
  const { data: phase } = usePhase(phaseId);
  const phaseTitle = localize(
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    phase?.data?.attributes?.title_multiloc
  ) // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    ?.replaceAll(' ', '_');

  const handleExportInputs = async () => {
    try {
      const blob = await requestBlob(
        `${API_PATH}/admin/phases/${phaseId}/custom_fields/${customFieldId}/as_geojson`,
        'application/geo+json'
      );
      saveAs(blob, `${phaseTitle}_${moment().format('YYYY-MM-DD')}.geojson`);
    } catch (error) {
      // Error
    }

    // track this click for user analytics
    trackEventByName(tracks.surveyMapResultsDownloaded);
  };

  return (
    <Box display="flex" justifyContent="flex-end">
      <Button
        icon="download"
        onClick={handleExportInputs}
        buttonStyle="text"
        p="0px"
      >
        {formatMessage(messages.exportGeoJSON)}
      </Button>
      <Box display="flex">
        <IconTooltip
          placement="top-start"
          ml="4px"
          mt="2px"
          content={<FormattedMessage {...messages.exportGeoJSONTooltip} />}
        />
      </Box>
    </Box>
  );
};

export default ExportGeoJSONButton;
