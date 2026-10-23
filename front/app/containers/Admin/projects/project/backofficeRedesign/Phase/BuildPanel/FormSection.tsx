import React, { useState } from 'react';

import { Box, Button, Text, bo } from '@citizenlab/cl2-component-library';

import { InputTerm, ParticipationMethod } from 'api/phases/types';

import inputFormMessages from 'containers/Admin/projects/project/inputForm/messages';

import { useIntl } from 'utils/cl-intl';
import { getMethodConfig } from 'utils/configs/participationMethodConfig';

import inputManagerMessages from '../../InputManager/messages';
import OfflineFormsButton from '../../InputManager/RightColumn/OfflineFormsButton';
import messages from '../../messages';

import AddPreviousPhaseIdeasModal from './AddPreviousPhaseIdeasModal';
import DemographicsCard from './DemographicsCard';
import FormQuestionsCard from './FormQuestionsCard';
import formTitle from './formTitle';
import PanelField from './PanelField';

const getFormTitle = (survey: boolean, inputTerm: InputTerm | undefined) => {
  if (survey) return messages.surveyForm;
  return inputTerm ? formTitle(inputTerm) : inputFormMessages.inputForm;
};

interface Props {
  projectId: string;
  participationMethod: ParticipationMethod;
  phaseId?: string;
  /** Names the input form; it follows the term picked in the card above. */
  inputTerm?: InputTerm;
}

const FormSection = ({
  projectId,
  participationMethod,
  phaseId,
  inputTerm,
}: Props) => {
  const { formatMessage } = useIntl();
  const [ideasModalOpened, setIdeasModalOpened] = useState(false);

  const formEditor = getMethodConfig(participationMethod).formEditor;

  // Methods that collect no submissions have no form to build here.
  if (formEditor === null) return null;

  const survey = formEditor === 'surveyEditor';
  const voting = participationMethod === 'voting';
  const title = formatMessage(getFormTitle(survey, inputTerm));

  return (
    <>
      {phaseId ? (
        <FormQuestionsCard
          projectId={projectId}
          phaseId={phaseId}
          title={title}
          survey={survey}
        >
          {voting && (
            <Box display="flex">
              <Button
                buttonStyle="bo-secondary"
                height={bo.buttonMedium.height}
                padding={bo.buttonMedium.padding}
                fontSize={bo.buttonMedium.fontSize}
                width="auto"
                onClick={() => setIdeasModalOpened(true)}
              >
                {formatMessage(messages.addIdeasFromPreviousPhase)}
              </Button>
            </Box>
          )}
        </FormQuestionsCard>
      ) : (
        <PanelField label={title}>
          <Text variant="boHelper" m="0">
            {formatMessage(messages.saveToEditForm)}
          </Text>
        </PanelField>
      )}

      {phaseId && <DemographicsCard phaseId={phaseId} />}

      {/* Survey responses aren't managed in Manage, so their offline forms
          stay here. */}
      {phaseId && survey && (
        <PanelField
          label={formatMessage(inputManagerMessages.offlineCollection)}
        >
          <OfflineFormsButton participationMethod={participationMethod} />
        </PanelField>
      )}

      {phaseId && voting && (
        <AddPreviousPhaseIdeasModal
          projectId={projectId}
          phaseId={phaseId}
          opened={ideasModalOpened}
          onClose={() => setIdeasModalOpened(false)}
        />
      )}
    </>
  );
};

export default FormSection;
