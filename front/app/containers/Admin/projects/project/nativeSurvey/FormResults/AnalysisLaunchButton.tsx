import React, { useState } from 'react';

import {
  Icon,
  colors,
  Text,
  Button,
  Title,
  Box,
  Checkbox,
} from '@citizenlab/cl2-component-library';
import { useIntl, FormattedMessage } from 'utils/cl-intl';
import messages from './messages';
import { useParams, useSearchParams } from 'react-router-dom';

import useAddAnalysis from 'api/analyses/useAddAnalysis';
import useFormCustomFields from 'hooks/useFormCustomFields';
import Modal from 'components/UI/Modal';
import { isNilOrError } from 'utils/helperUtils';
import useLocalize from 'hooks/useLocalize';
import clHistory from 'utils/cl-router/history';
import Divider from 'components/admin/Divider';
import Fragment from 'components/Fragment';

import tracks from 'containers/Admin/projects/project/analysis/tracks';
import { trackEventByName } from 'utils/analytics';

const ConsentModal = ({
  onClose,
  onAccept,
}: {
  onClose: () => void;
  onAccept: () => void;
}) => {
  const [checked, setChecked] = useState(false);
  const { formatMessage } = useIntl();

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
      />
      <Divider />
      <Box display="flex" justifyContent="flex-end" gap="16px" mt="16px">
        <Button buttonStyle="secondary" onClick={onClose}>
          {formatMessage(messages.consentModalCancel)}
        </Button>
        <Button buttonStyle="primary" onClick={onAccept} disabled={!checked}>
          {formatMessage(messages.consentModalButton)}
        </Button>
      </Box>
    </Box>
  );
};

const CreateAnalysisModal = ({ onClose }: { onClose: () => void }) => {
  const { formatMessage } = useIntl();
  const localize = useLocalize();
  const [selectdQuestions, setSelectedQuestions] = useState<string[]>([]);
  const { projectId } = useParams() as { projectId: string };
  const { mutate: createAnalysis, isLoading } = useAddAnalysis();

  const [urlParams] = useSearchParams();
  const phaseId = urlParams.get('phase_id') || undefined;
  const formCustomFields = useFormCustomFields({
    projectId,
    phaseId,
  });

  const handleCreateAnalysis = () => {
    createAnalysis(
      {
        projectId: phaseId ? undefined : projectId,
        phaseId,
        customFieldIds: selectdQuestions,
      },
      {
        onSuccess: (analysis) => {
          trackEventByName(tracks.analysisForSurveyCreated.name, {
            extra: { projectId },
          });
          clHistory.push(
            `/admin/projects/${projectId}/analysis/${
              analysis.data.id
            }?showLaunchModal=true${phaseId ? `&phase_id=${phaseId}` : ''}`
          );
          onClose();
        },
      }
    );
  };

  const handleOnChangeCheck =
    (customFieldId: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
      if (event.target.checked) {
        setSelectedQuestions([...selectdQuestions, customFieldId]);
      } else {
        setSelectedQuestions(
          selectdQuestions.filter((id) => id !== customFieldId)
        );
      }
    };

  if (isNilOrError(formCustomFields)) return null;

  return (
    <Box px="48px">
      <Title>{formatMessage(messages.analysisSelectQuestions)}</Title>
      <Text>
        Which questions do you want to analyze simultaneously? You can always
        create a new analysis with different questions later.
      </Text>
      {formCustomFields?.map((field) => {
        if (field.input_type === 'page') {
          return (
            <Fragment key={field.id} name={''}>
              <Divider />
              <Title variant="h5">{localize(field.title_multiloc)}</Title>
            </Fragment>
          );
        } else if (field.input_type === 'section') {
          return null;
        } else if (field.input_type === 'file_upload') {
          return null;
        } else {
          return (
            <Box key={field.id} py="16px">
              <Checkbox
                label={localize(field.title_multiloc)}
                checked={selectdQuestions.includes(field.id)}
                onChange={handleOnChangeCheck(field.id)}
              />
            </Box>
          );
        }
      })}
      <Box display="flex" justifyContent="flex-end" mt="48px" gap="24px">
        <Button buttonStyle="secondary" onClick={onClose}>
          {formatMessage(messages.cancel)}
        </Button>
        <Button
          buttonStyle="admin-dark"
          onClick={handleCreateAnalysis}
          processing={isLoading}
          disabled={selectdQuestions.length === 0}
        >
          {formatMessage(messages.createAnalysis)}
        </Button>
      </Box>
    </Box>
  );
};

const AnalysisLaunchButton = () => {
  const [consentModalIsOpened, setConsentModalIsOpened] = useState(false);
  const [isCreateAnalysisModalOpened, setIsCreateAnalysisModalOpened] =
    useState(false);

  const { formatMessage } = useIntl();

  const closeCreateAnalysisModal = () => {
    setIsCreateAnalysisModalOpened(false);
  };

  const closeConsentModal = () => {
    setConsentModalIsOpened(false);
  };

  const openConsentModal = () => {
    setConsentModalIsOpened(true);
  };

  const onAcceptConsent = () => {
    setConsentModalIsOpened(false);
    setIsCreateAnalysisModalOpened(true);
  };

  return (
    <Box>
      <Button buttonStyle="admin-dark" onClick={openConsentModal}>
        {formatMessage(messages.analysisButton)}
      </Button>
      <Modal
        opened={isCreateAnalysisModalOpened}
        close={closeCreateAnalysisModal}
      >
        <CreateAnalysisModal onClose={closeCreateAnalysisModal} />
      </Modal>
      <Modal opened={consentModalIsOpened} close={closeConsentModal}>
        <ConsentModal onClose={closeConsentModal} onAccept={onAcceptConsent} />
      </Modal>
    </Box>
  );
};

export default AnalysisLaunchButton;
