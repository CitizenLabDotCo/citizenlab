import React from 'react';

import {
  Box,
  Button,
  colors,
  Text,
  Title,
} from '@citizenlab/cl2-component-library';
import messages from './messages';
import { useIntl } from 'utils/cl-intl';
import useFeatureFlag from 'hooks/useFeatureFlag';
import { requestBlob } from 'utils/requestBlob';
import { saveAs } from 'file-saver';
import { reportError } from 'utils/loggingUtils';
import { API_PATH } from 'containers/App/constants';

const PowerBITemplates = () => {
  const isPowerBIEnabled = useFeatureFlag({ name: 'power_bi' });
  const { formatMessage } = useIntl();

  const saveFile = (filename: string, mimeType: string) => {
    const file = `${API_PATH}web_api/v1/power_bi_templates/${filename}`;
    try {
      const blob = await requestBlob(file, mimeType as any);
      saveAs(blob, filename);
    } catch (error) {
      reportError(error);
      throw error;
    }
  };

  const downloadReportingTemplate = () => {
    console.log('downloading reporting template');
    saveFile('reporting.pbit', 'application/pbit');
  };

  const downloadDataFlowTemplate = () => {
    console.log('downloading reporting template');
    saveFile('dataflow.json', 'application/json');
  };

  if (!isPowerBIEnabled) return null;

  return (
    <>
      <Title variant="h1">{formatMessage(messages.title)}</Title>

      <Text>
        Note: To use either of these Power BI, you must first{' '}
        <a href="public-api-tokens">
          create a set of credentials for our public API
        </a>
      </Text>

      <Title variant="h2">Report template</Title>

      <Box display="flex" justifyContent={'space-between'} mb="12px">
        <Text>
          This will create set up all the data connections to your CitizenLab
          platform, create the data model and some default dashboards. When you
          open the template in Power BI you will be prompted to enter your
          public API credentials.
        </Text>
        <Button
          icon="download"
          color={colors.primary}
          onClick={downloadReportingTemplate}
        >
          Download reporting template (.pbit)
        </Button>
      </Box>

      <Title variant="h2">Dataflow template</Title>

      <Box display="flex" justifyContent={'space-between'} mb="12px">
        <Text>
          If you intend to use your CitizenLab data within a Power BI dataflow,
          this template will allow you to set up a new dataflow that connects to
          CitizenLab data. Once you have downloaded this template you must find
          and replace the following strings in the template with your public API
          credentials before uploading to PowerBI:
          <ul>
            <li>##CLIENT_ID##</li>
            <li>##CLIENT_SECRET##</li>
          </ul>
        </Text>
        <Button
          icon="download"
          color={colors.primary}
          onClick={downloadDataFlowTemplate}
        >
          Download data flow template (.json)
        </Button>
      </Box>
    </>
  );
};

export default PowerBITemplates;
