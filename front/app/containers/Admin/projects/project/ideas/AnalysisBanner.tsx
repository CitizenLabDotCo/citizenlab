import React, { useState } from 'react';

import {
  Icon,
  colors,
  Text,
  Button,
  Box,
  stylingConsts,
  Title,
  Checkbox,
} from '@citizenlab/cl2-component-library';
import tracks from 'containers/Admin/projects/project/analysis/tracks';
import { useParams } from 'react-router-dom';
import { Divider } from 'semantic-ui-react';

import Modal from 'components/UI/Modal';

import { trackEventByName } from 'utils/analytics';
import { useIntl, FormattedMessage } from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';

import useAddAnalysis from 'api/analyses/useAddAnalysis';
import useAnalyses from 'api/analyses/useAnalyses';

import useFeatureFlag from 'hooks/useFeatureFlag';

import messages from './messages';

const ConsentModal = ({ onClose }: { onClose: () => void }) => {
  const [checked, setChecked] = useState(false);
  const { mutate: createAnalysis, isLoading } = useAddAnalysis();
  const { projectId } = useParams() as { projectId: string };
  const { formatMessage } = useIntl();

  const handleCreateAnalysis = () => {
    createAnalysis(
      { projectId },
      {
        onSuccess: (analysis) => {
          onClose();
          clHistory.push(
            `/admin/projects/${projectId}/analysis/${analysis.data.id}`
          );
          trackEventByName(tracks.analysisForIdeationCreated.name, {
            extra: { projectId },
          });
        },
      }
    );
  };

  return (
    <Box p="24px">
      <Box display="flex" gap="16px" alignItems="center">
        <Icon
          name="alert-circle"
          fill={colors.red500}
          width="40px"
          height="40px"
        />
        <Title>{formatMessage(messages.consentModalTitle)}</Title>
      </Box>

      <Divider />
      <Text>{formatMessage(messages.consentModalText1)}</Text>
      <Text>{formatMessage(messages.consentModalText2)}</Text>
      <Text>{formatMessage(messages.consentModalText3)}</Text>
      <Text>
        <FormattedMessage
          {...messages.consentModalText4}
          values={{
            link: (
              <a
                href={formatMessage(messages.consentModalText4Link)}
                target="_blank"
                rel="noopener noreferrer"
              >
                {formatMessage(messages.consentModalText4LinkText)}
              </a>
            ),
          }}
        />
      </Text>
      <Divider />
      <Checkbox
        checked={checked}
        onChange={(e) => setChecked(e.target.checked)}
        label={formatMessage(messages.consentModalCheckbox)}
        id="e2e-analysis-consent-checkbox"
      />
      <Divider />
      <Box display="flex" justifyContent="flex-end" gap="16px" mt="16px">
        <Button buttonStyle="secondary" onClick={onClose}>
          {formatMessage(messages.consentModalCancel)}
        </Button>
        <Button
          buttonStyle="primary"
          onClick={handleCreateAnalysis}
          processing={isLoading}
          disabled={!checked}
          id="e2e-analysis-consent-button"
        >
          {formatMessage(messages.consentModalButton)}
        </Button>
      </Box>
    </Box>
  );
};

const AnalysisBanner = () => {
  const [consentModalIsOpened, setConsentModalIsOpened] = useState(false);
  const { projectId, phaseId } = useParams() as {
    projectId: string;
    phaseId: string;
  };
  const { data: analyses, isLoading: isLoadingAnalyses } = useAnalyses({
    projectId,
  });

  const { formatMessage } = useIntl();

  const analysisEnabled = useFeatureFlag({ name: 'analysis' });

  const handleGoToAnalysis = () => {
    if (analyses?.data.length) {
      clHistory.push(
        `/admin/projects/${projectId}/analysis/${analyses?.data[0].id}?phase_id=${phaseId}`
      );
    } else {
      setConsentModalIsOpened(true);
    }
  };

  const closeConsentModal = () => {
    setConsentModalIsOpened(false);
  };

  if (!analysisEnabled || isLoadingAnalyses) return null;

  return (
    <Box
      display="flex"
      justifyContent="space-between"
      alignItems="center"
      borderRadius={stylingConsts.borderRadius}
      p="8px 16px"
      mb="24px"
      bgColor={colors.errorLight}
    >
      <Box display="flex" gap="16px" alignItems="center">
        <Icon name="flash" width="50px" height="50px" fill={colors.orange} />
        <Text fontWeight="bold">
          {formatMessage(messages.analysisSubtitle)}
        </Text>
      </Box>
      <Button
        buttonStyle="text"
        textColor={colors.orange}
        onClick={handleGoToAnalysis}
        fontWeight="bold"
        icon="flash"
        iconColor={colors.orange}
        id="e2e-analysis-banner-button"
      >
        {formatMessage(messages.analysisButton)}
      </Button>
      <Modal opened={consentModalIsOpened} close={closeConsentModal}>
        <ConsentModal onClose={closeConsentModal} />
      </Modal>
    </Box>
  );
};

export default AnalysisBanner;
