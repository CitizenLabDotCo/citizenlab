import React, { useState } from 'react';

import {
  Box,
  Divider,
  NewBOButton,
  NewBOText,
} from '@citizenlab/cl2-component-library';

import usePhasePermissions from 'api/phase_permissions/usePhasePermissions';
import { ParticipationMethod } from 'api/phases/types';

import inputFormMessages from 'containers/Admin/projects/project/inputForm/messages';
import { isPDFUploadSupported } from 'containers/Admin/projects/project/inputImporter/ReviewSection/utils';

import ImportInputsSection from 'components/admin/FormSync/ImportInputsSection';
import Modal from 'components/UI/Modal';
import NewBOLinkButton from 'components/UI/NewBOLinkButton';

import { useIntl } from 'utils/cl-intl';
import { getMethodConfig } from 'utils/configs/participationMethodConfig';

import messages from '../../messages';

import AddPreviousPhaseIdeasModal from './AddPreviousPhaseIdeasModal';
import AddQuestionsModal from './AddQuestionsModal';
import PanelField from './PanelField';

interface Props {
  projectId: string;
  participationMethod: ParticipationMethod;
  phaseId?: string;
}

const FormSection = ({ projectId, participationMethod, phaseId }: Props) => {
  const { formatMessage } = useIntl();
  const [importModalOpened, setImportModalOpened] = useState(false);
  const [questionsModalOpened, setQuestionsModalOpened] = useState(false);
  const [ideasModalOpened, setIdeasModalOpened] = useState(false);
  const { data: permissions } = usePhasePermissions({ phaseId });

  const formEditor = getMethodConfig(participationMethod).formEditor;

  // Methods that collect no submissions have no form to build here.
  if (formEditor === null) return null;

  const survey = formEditor === 'surveyEditor';

  const asksParticipants = !!permissions?.data.some(
    ({ attributes }) => attributes.action === 'posting_idea'
  );

  return (
    <>
      <Divider />

      <PanelField
        label={formatMessage(
          survey ? messages.surveyForm : inputFormMessages.inputForm
        )}
      >
        {!phaseId && (
          <NewBOText variant="helper" mb="12px">
            {formatMessage(messages.saveToEditForm)}
          </NewBOText>
        )}
        {phaseId && permissions && !asksParticipants ? (
          <NewBOLinkButton
            buttonStyle="secondary-outlined"
            to={
              survey
                ? '/admin/projects/$projectId/phases/$phaseId/survey-form/edit'
                : '/admin/projects/$projectId/phases/$phaseId/form/edit'
            }
            params={{ projectId, phaseId }}
          >
            {formatMessage(messages.addQuestions)}
          </NewBOLinkButton>
        ) : (
          <NewBOButton
            buttonStyle="secondary-outlined"
            disabled={!phaseId || !permissions}
            onClick={() => setQuestionsModalOpened(true)}
          >
            {formatMessage(messages.addQuestions)}
          </NewBOButton>
        )}
        {participationMethod === 'voting' && (
          <NewBOButton
            buttonStyle="secondary-outlined"
            mt="8px"
            disabled={!phaseId}
            onClick={() => setIdeasModalOpened(true)}
          >
            {formatMessage(messages.addIdeasFromPreviousPhase)}
          </NewBOButton>
        )}
      </PanelField>

      {phaseId && participationMethod === 'voting' && (
        <AddPreviousPhaseIdeasModal
          projectId={projectId}
          phaseId={phaseId}
          opened={ideasModalOpened}
          onClose={() => setIdeasModalOpened(false)}
        />
      )}

      {phaseId && (
        <AddQuestionsModal
          projectId={projectId}
          phaseId={phaseId}
          survey={survey}
          opened={questionsModalOpened}
          onClose={() => setQuestionsModalOpened(false)}
        />
      )}

      <NewBOButton
        buttonStyle="text"
        justify="space-between"
        icon="chevron-right"
        iconPos="right"
        padding="0"
        disabled={!phaseId}
        onClick={() => setImportModalOpened(true)}
      >
        {formatMessage(messages.offlineCollection)}
      </NewBOButton>

      <Modal
        opened={importModalOpened}
        close={() => setImportModalOpened(false)}
        header={formatMessage(messages.offlineCollection)}
      >
        <Box p="24px">
          <ImportInputsSection
            formType={survey ? 'survey' : 'input_form'}
            pdfImportSupported={isPDFUploadSupported(participationMethod)}
          />
        </Box>
      </Modal>
    </>
  );
};

export default FormSection;
