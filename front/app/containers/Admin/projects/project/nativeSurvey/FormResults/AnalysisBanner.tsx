import React, { useState } from 'react';

import {
  Icon,
  colors,
  Text,
  Button,
  Title,
  Box,
  ListItem,
  Checkbox,
} from '@citizenlab/cl2-component-library';
import { useIntl } from 'utils/cl-intl';
import messages from './messages';
import { useParams, useSearchParams } from 'react-router-dom';

import useAddAnalysis from 'api/analyses/useAddAnalysis';
import useFormCustomFields from 'hooks/useFormCustomFields';
import Modal from 'components/UI/Modal';
import { isNilOrError } from 'utils/helperUtils';
import useLocalize from 'hooks/useLocalize';

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
        onSuccess: () => {
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
            <Title variant="h5" key={field.id}>
              {localize(field.title_multiloc)}
            </Title>
          );
        } else if (field.input_type === 'section') {
          return null;
        } else if (field.input_type === 'file_upload') {
          return null;
        } else {
          return (
            <ListItem key={field.id} py="16px">
              <Checkbox
                label={localize(field.title_multiloc)}
                checked={selectdQuestions.includes(field.id)}
                onChange={handleOnChangeCheck(field.id)}
              />
            </ListItem>
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

const AnalysisBanner = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { formatMessage } = useIntl();

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <Box
      display="flex"
      justifyContent="space-between"
      alignItems="center"
      borderColor={colors.borderLight}
      borderRadius="3px"
      borderWidth="1px"
      borderStyle="solid"
      p="8px 16px"
      mb="36px"
    >
      <Box display="flex" gap="16px" alignItems="center">
        <Icon name="flash" width="50px" height="50px" fill={colors.orange} />
        <Box>
          <Title variant="h3">{formatMessage(messages.analysisTitle)}</Title>
          <Text>{formatMessage(messages.analysisSubtitle)}</Text>
        </Box>
      </Box>
      <Button buttonStyle="admin-dark" onClick={openModal}>
        {formatMessage(messages.analysisButton)}
      </Button>
      <Modal opened={isModalOpen} close={closeModal}>
        <CreateAnalysisModal onClose={closeModal} />
      </Modal>
    </Box>
  );
};

export default AnalysisBanner;
