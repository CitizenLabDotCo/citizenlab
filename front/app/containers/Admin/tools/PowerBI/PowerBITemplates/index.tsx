import React from 'react';

import {
  Box,
  Button,
  colors,
  Text,
  Title,
} from '@citizenlab/cl2-component-library';

import useFeatureFlag from 'hooks/useFeatureFlag';

import GoBackButton from 'components/UI/GoBackButton';

import { FormattedMessage, useIntl } from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';
import Link from 'utils/cl-router/Link';
import { isNilOrError } from 'utils/helperUtils';

import messages from './messages';
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

  const baseUrl =
    window.location.host === 'localhost'
      ? `http://localhost:4000/api/v2/`
      : `${window.location.origin}/api/v2/`;

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
            <FormattedMessage
              {...messages.reportTemplateDescription}
              values={{
                baseUrl: <strong>{baseUrl}</strong>,
              }}
            />
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

      <Text>
        <FormattedMessage
          {...messages.supportLinkDescription}
          values={{
            link: (
              <a
                href={formatMessage(messages.supportLinkUrl2)}
                target="_blank"
                rel="noreferrer"
              >
                {formatMessage(messages.supportLinkText)}
              </a>
            ),
          }}
        />
      </Text>
    </>
  );
};

export default PowerBITemplates;
