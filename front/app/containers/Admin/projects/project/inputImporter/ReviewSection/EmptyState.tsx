import React from 'react';

import {
  Box,
  Title,
  Text,
  colors,
  stylingConsts,
} from '@citizenlab/cl2-component-library';
import { useParams } from 'react-router-dom';

import usePhase from 'api/phases/usePhase';

import ImportInputsSection from 'components/admin/FormSync/ImportInputsSection';

import { FormattedMessage } from 'utils/cl-intl';

import sharedMessages from '../messages';

import messages from './messages';
import { isPDFUploadSupported, supportsNativeSurvey } from './utils';

interface Props {
  onClickPDFImport: () => void;
  onClickExcelImport: () => void;
}

const EmptyState = ({ onClickPDFImport, onClickExcelImport }: Props) => {
  const { phaseId } = useParams() as {
    phaseId: string;
  };
  const { data: phase } = usePhase(phaseId);

  const participationMethod = phase?.data.attributes.participation_method;
  const formType = supportsNativeSurvey(participationMethod)
    ? 'survey'
    : 'input_form';
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
        maxWidth="1000px"
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
          {pdfImportSupported ? (
            <FormattedMessage {...messages.noIdeasYet} />
          ) : (
            <FormattedMessage {...messages.noIdeasYetNoPdf} />
          )}
        </Text>
        <Box mt="24px">
          <ImportInputsSection
            formType={formType}
            onClickPDFImport={onClickPDFImport}
            onClickExcelImport={onClickExcelImport}
            pdfImportSupported={pdfImportSupported}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default EmptyState;
