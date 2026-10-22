import React, { useState } from 'react';

import { Box, Button, Text, bo } from '@citizenlab/cl2-component-library';

import usePhasePermissions from 'api/phase_permissions/usePhasePermissions';
import { ParticipationMethod } from 'api/phases/types';

import inputFormMessages from 'containers/Admin/projects/project/inputForm/messages';
import { isPDFUploadSupported } from 'containers/Admin/projects/project/inputImporter/ReviewSection/utils';

import ImportInputsSection from 'components/admin/FormSync/ImportInputsSection';
import ButtonWithLink from 'components/UI/ButtonWithLink';
import Modal from 'components/UI/Modal';

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
  const voting = participationMethod === 'voting';
  // PanelField draws its body for any truthy children, empty fragments included.
  const hasBody = !phaseId || voting;

  const asksParticipants = !!permissions?.data.some(
    ({ attributes }) => attributes.action === 'posting_idea'
  );

  return (
    <>
      <PanelField
        label={formatMessage(
          survey ? messages.surveyForm : inputFormMessages.inputForm
        )}
        action={
          phaseId && permissions && !asksParticipants ? (
            <ButtonWithLink
              buttonStyle="bo-secondary"
              height={bo.buttonMedium.height}
              padding={bo.buttonMedium.padding}
              fontSize={bo.buttonMedium.fontSize}
              width="auto"
              to={
                survey
                  ? '/admin/projects/$projectId/phases/$phaseId/survey-form/edit'
                  : '/admin/projects/$projectId/phases/$phaseId/form/edit'
              }
              params={{ projectId, phaseId }}
            >
              {formatMessage(messages.addQuestions)}
            </ButtonWithLink>
          ) : (
            <Button
              buttonStyle="bo-secondary"
              height={bo.buttonMedium.height}
              padding={bo.buttonMedium.padding}
              fontSize={bo.buttonMedium.fontSize}
              width="auto"
              disabled={!phaseId || !permissions}
              onClick={() => setQuestionsModalOpened(true)}
            >
              {formatMessage(messages.addQuestions)}
            </Button>
          )
        }
      >
        {hasBody && (
          <>
            {!phaseId && (
              <Text variant="boHelper" m="0">
                {formatMessage(messages.saveToEditForm)}
              </Text>
            )}
            {voting && (
              <Box display="flex">
                <Button
                  buttonStyle="bo-secondary"
                  height={bo.buttonMedium.height}
                  padding={bo.buttonMedium.padding}
                  fontSize={bo.buttonMedium.fontSize}
                  width="auto"
                  disabled={!phaseId}
                  onClick={() => setIdeasModalOpened(true)}
                >
                  {formatMessage(messages.addIdeasFromPreviousPhase)}
                </Button>
              </Box>
            )}
          </>
        )}
      </PanelField>

      <PanelField
        label={formatMessage(messages.offlineCollection)}
        action={
          <Button
            buttonStyle="bo-text"
            icon="chevron-right"
            iconSize="16px"
            width="32px"
            height="32px"
            padding="0"
            ariaLabel={formatMessage(messages.offlineCollection)}
            disabled={!phaseId}
            onClick={() => setImportModalOpened(true)}
          />
        }
      />

      {phaseId && voting && (
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
