import React, { useState, useEffect } from 'react';

import {
  Text,
  Button,
  Title,
  Box,
  Checkbox,
} from '@citizenlab/cl2-component-library';
import { useIntl, FormattedMessage } from 'utils/cl-intl';
import messages from '../../../messages';
import { useParams, useSearchParams } from 'react-router-dom';

import useAddAnalysis from 'api/analyses/useAddAnalysis';
import useFormCustomFields from 'api/custom_fields/useCustomFields';
import { isNilOrError } from 'utils/helperUtils';
import useLocalize from 'hooks/useLocalize';
import clHistory from 'utils/cl-router/history';
import Divider from 'components/admin/Divider';

import tracks from 'containers/Admin/projects/project/analysis/tracks';
import { trackEventByName } from 'utils/analytics';

const CreateAnalysisModal = ({ onClose }: { onClose: () => void }) => {
  const [search] = useSearchParams();
  const { formatMessage } = useIntl();
  const localize = useLocalize();
  const customFieldId = search.get('customFieldId');
  const [selectdQuestions, setSelectedQuestions] = useState<string[]>(
    customFieldId ? [customFieldId] : []
  );
  const { projectId, phaseId } = useParams() as {
    projectId: string;
    phaseId: string;
  };
  const { mutate: createAnalysis, isLoading } = useAddAnalysis();

  const { data: formCustomFields } = useFormCustomFields({
    projectId,
    phaseId,
  });

  useEffect(() => {
    if (customFieldId && formCustomFields) {
      const element = document.getElementById(customFieldId);
      element?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'nearest',
      });
    }
  }, [customFieldId, formCustomFields]);

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
            }?input_custom_field_no_empty_values=true${
              phaseId ? `&phase_id=${phaseId}` : ''
            }`
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

  const initialQuestion = formCustomFields.find(
    (field) => field.id === customFieldId
  );

  return (
    <Box px="24px">
      <Box>
        <Title>{formatMessage(messages.analysisSelectQuestions)}</Title>
        <Text>
          <FormattedMessage
            {...messages.analysisSelectQuestionsDescription}
            values={{
              question: (
                <b>&quot;{localize(initialQuestion?.title_multiloc)}&quot;</b>
              ),
            }}
          />
        </Text>
      </Box>
      <Box>
        <Box maxHeight="300px" overflow="auto">
          {formCustomFields?.map((field) => {
            if (field.input_type === 'page') {
              return (
                <Box key={field.id} id={field.id}>
                  <Divider />
                  <Title variant="h5" m="0px">
                    {localize(field.title_multiloc)}
                  </Title>
                </Box>
              );
            } else if (field.input_type === 'section') {
              return null;
            } else if (field.input_type === 'file_upload') {
              return null;
            } else {
              return (
                <Box key={field.id} py="4px" id={field.id}>
                  <Checkbox
                    label={localize(field.title_multiloc)}
                    checked={selectdQuestions.includes(field.id)}
                    onChange={handleOnChangeCheck(field.id)}
                  />
                </Box>
              );
            }
          })}
        </Box>
      </Box>
      <Box display="flex" justifyContent="flex-end" mt="24px" gap="24px">
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

export default CreateAnalysisModal;
