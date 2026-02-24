import React from 'react';

import {
  Box,
  Title,
  Text,
  colors,
  stylingConsts,
} from '@citizenlab/cl2-component-library';

import usePhase from 'api/phases/usePhase';

import DownloadPDFButtonWithModal from 'components/admin/FormSync/DownloadPDFButtonWithModal';
import ExcelDownloadButton from 'components/admin/FormSync/ExcelDownloadButton';

import { FormattedMessage } from 'utils/cl-intl';
import { useParams } from 'utils/router';

import sharedMessages from '../messages';

import messages from './messages';
import { isPDFUploadSupported, supportsNativeSurvey } from './utils';

const EmptyState = () => {
  const { phaseId } = useParams({
    from: '/$locale/admin/projects/$projectId/phases/$phaseId/input-importer',
  });
  const { data: phase } = usePhase(phaseId);

  const participationMethod = phase?.data.attributes.participation_method;

  const pdfImportSupported = isPDFUploadSupported(participationMethod);

  return (
    <Box
      w="100%"
      h="100%"
      display="flex"
      alignItems="center"
      justifyContent="center"
      px="50px"
    >
      <Box
        w="100%"
        maxWidth="700px"
        bgColor={colors.white}
        borderRadius={stylingConsts.borderRadius}
        boxShadow={`0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)`}
        px="20px"
        pb="16px"
      >
        <Title variant="h1" color="primary">
          <FormattedMessage {...sharedMessages.inputImporter} />
        </Title>
        <Text>
          <FormattedMessage
            {...(pdfImportSupported
              ? messages.noIdeasYet
              : messages.noIdeasYetNoPdf)}
            values={{
              importFile: <FormattedMessage {...sharedMessages.importFile} />,
            }}
          />
        </Text>
        <Box display="flex">
          {pdfImportSupported && (
            <DownloadPDFButtonWithModal
              formType={
                supportsNativeSurvey(participationMethod)
                  ? 'survey'
                  : 'input_form'
              }
              mr="8px"
              phaseId={phaseId}
            />
          )}
          <ExcelDownloadButton phaseId={phaseId} />
        </Box>
      </Box>
    </Box>
  );
};

export default EmptyState;
