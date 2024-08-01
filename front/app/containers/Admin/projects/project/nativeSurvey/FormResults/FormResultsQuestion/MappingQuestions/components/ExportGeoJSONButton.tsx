import React from 'react';

import { Button, Box, IconTooltip } from '@citizenlab/cl2-component-library';
import saveAs from 'file-saver';

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

  const handleExportInputs = async () => {
    try {
      const blob = await requestBlob(
        `${API_PATH}/admin/phases/${phaseId}/custom_fields/${customFieldId}/as_geojson`,
        'application/geo+json'
      );
      saveAs(blob, `${customFieldId}.geojson`);
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
