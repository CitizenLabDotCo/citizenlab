import React from 'react';

// components
import {
  Box,
  Button,
  colors,
  Text,
  Title,
} from '@citizenlab/cl2-component-library';
import GoBackButton from 'components/UI/GoBackButton';

// intl
import { FormattedMessage, useIntl } from 'utils/cl-intl';
import messages from './messages';

// hooks
import useFeatureFlag from 'hooks/useFeatureFlag';

// utils
import { isNilOrError } from 'utils/helperUtils';
import clHistory from 'utils/cl-router/history';
import Link from 'utils/cl-router/Link';

import { saveTemplateFile } from './saveTemplateFile';

const PowerBITemplates = () => {
  const isPowerBIEnabled = useFeatureFlag({ name: 'power_bi' });
  const { formatMessage } = useIntl();

  const handleDownloadTemplate = async (fileName, fileExtension) => {
    if (isNilOrError(fileName)) return;
    await saveTemplateFile({ fileName, fileExtension });
  };

  const downloadReportingTemplate = () => {
    handleDownloadTemplate('report', 'pbit');
  };

  const downloadDataFlowTemplate = () => {
    handleDownloadTemplate('dataflow', 'json');
  };

  if (!isPowerBIEnabled) return null;

  return (
    <>
      <Box w="100%">
        <GoBackButton onClick={clHistory.goBack} />
      </Box>

      <Title variant="h1" mb="0">
        {formatMessage(messages.title)}
      </Title>
      <Text>
        <FormattedMessage
          {...messages.intro}
          values={{
            link: (
              <Link to="/admin/tools/public-api-tokens">
                {formatMessage(messages.publicApiLinkText)}
              </Link>
            ),
          }}
        />
      </Text>
      <Box background="white" px="20px" pb="10px" mb="20px">
        <Title variant="h2" mb="0">
          {formatMessage(messages.reportTemplateTitle)}
        </Title>
        <Box display="flex">
          <Text mr="20px">
            {formatMessage(messages.reportTemplateDescription)}
          </Text>
          <Button
            icon="download"
            color={colors.primary}
            onClick={downloadReportingTemplate}
          >
            {formatMessage(messages.reportTemplateDownload)} (.pbit)
          </Button>
        </Box>
      </Box>
      <Box background="white" px="20px" pb="10px" mb="20px">
        <Title variant="h2" mb="0">
          {formatMessage(messages.dataflowTemplateTitle)}
        </Title>
        <Box display="flex">
          <Text mr="20px">
            {formatMessage(messages.dataflowTemplateDescription)}
          </Text>
          <Button
            icon="download"
            color={colors.primary}
            onClick={downloadDataFlowTemplate}
          >
            {formatMessage(messages.dataflowTemplateDownload)} (.json)
          </Button>
        </Box>
      </Box>
    </>
  );
};

export default PowerBITemplates;
