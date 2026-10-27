import React from 'react';

import { Text } from '@citizenlab/cl2-component-library';

import { InputTerm, ParticipationMethod } from 'api/phases/types';

import inputFormMessages from 'containers/Admin/projects/project/inputForm/messages';

import { useIntl } from 'utils/cl-intl';
import { getMethodConfig } from 'utils/configs/participationMethodConfig';

import inputManagerMessages from '../../InputManager/messages';
import OfflineFormsButton from '../../InputManager/RightColumn/OfflineFormsButton';
import messages from '../../messages';

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
  inputTerm?: InputTerm;
}

const FormSection = ({
  projectId,
  participationMethod,
  phaseId,
  inputTerm,
}: Props) => {
  const { formatMessage } = useIntl();

  const formEditor = getMethodConfig(participationMethod).formEditor;

  // Methods that collect no submissions have no form to build here.
  if (formEditor === null) return null;

  const survey = formEditor === 'surveyEditor';
  const title = formatMessage(getFormTitle(survey, inputTerm));

  return (
    <>
      {phaseId ? (
        <FormQuestionsCard
          projectId={projectId}
          phaseId={phaseId}
          title={title}
          survey={survey}
        />
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
    </>
  );
};

export default FormSection;
