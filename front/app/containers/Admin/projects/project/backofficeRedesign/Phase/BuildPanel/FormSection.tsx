import React, { useState } from 'react';

import { Box, Button, Divider, Text } from '@citizenlab/cl2-component-library';

import { ParticipationMethod } from 'api/phases/types';

import inputFormMessages from 'containers/Admin/projects/project/inputForm/messages';
import { isPDFUploadSupported } from 'containers/Admin/projects/project/inputImporter/ReviewSection/utils';

import ImportInputsSection from 'components/admin/FormSync/ImportInputsSection';
import ButtonWithLink from 'components/UI/ButtonWithLink';
import Modal from 'components/UI/Modal';

import { useIntl } from 'utils/cl-intl';
import { getMethodConfig } from 'utils/configs/participationMethodConfig';

import messages from '../../messages';

import PanelField from './PanelField';

interface Props {
  projectId: string;
  participationMethod: ParticipationMethod;
  /** Absent while the phase isn't saved yet: its form can't be edited then. */
  phaseId?: string;
}

const FormSection = ({ projectId, participationMethod, phaseId }: Props) => {
  const { formatMessage } = useIntl();
  const [importModalOpened, setImportModalOpened] = useState(false);

  const formEditor = getMethodConfig(participationMethod).formEditor;

  // Methods that collect no submissions have no form to build here.
  if (formEditor === null) return null;

  const survey = formEditor === 'surveyEditor';
  const editLabel = formatMessage(
    survey ? messages.editSurveyForm : inputFormMessages.editInputForm
  );

  return (
    <>
      <Divider />

      <PanelField
        label={formatMessage(
          survey ? messages.surveyForm : inputFormMessages.inputForm
        )}
      >
        <Text fontSize="s" color="textSecondary" mt="0" mb="12px">
          {formatMessage(
            phaseId
              ? inputFormMessages.inputFormDescription
              : messages.saveToEditForm
          )}
        </Text>
        <Box display="flex">
          {phaseId ? (
            <ButtonWithLink
              to={
                survey
                  ? '/admin/projects/$projectId/phases/$phaseId/survey-form/edit'
                  : '/admin/projects/$projectId/phases/$phaseId/form/edit'
              }
              params={{ projectId, phaseId }}
              buttonStyle="admin-dark"
              icon="edit"
              size="s"
            >
              {editLabel}
            </ButtonWithLink>
          ) : (
            <Button buttonStyle="admin-dark" icon="edit" size="s" disabled>
              {editLabel}
            </Button>
          )}
        </Box>
      </PanelField>

      <Button
        buttonStyle="text"
        justify="space-between"
        icon="chevron-right"
        iconPos="right"
        iconSize="16px"
        px="0"
        disabled={!phaseId}
        onClick={() => setImportModalOpened(true)}
      >
        {formatMessage(messages.offlineCollection)}
      </Button>

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
