import React, { useState } from 'react';

import { Box, Spinner, Text } from '@citizenlab/cl2-component-library';

import useCustomFields from 'api/custom_fields/useCustomFields';
import usePhase from 'api/phases/usePhase';
import useSubmissionCount from 'api/submission_count/useSubmissionCount';

import PanelGroup from 'containers/Admin/projects/_shared/components/SettingsPanel/PanelGroup';
import { isPDFUploadSupported } from 'containers/Admin/projects/project/inputImporter/ReviewSection/utils';
import CopySurveyModal from 'containers/Admin/projects/project/surveyFormAssets/CopySurveyModal';

import ImportInputsSection from 'components/admin/FormSync/ImportInputsSection';
import ImportExcelModal from 'components/admin/InputImporterModals/ImportExcelModal';
import ImportPdfModal from 'components/admin/InputImporterModals/ImportPdfModal';
import Modal from 'components/UI/Modal';

import { useIntl } from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';

import formSectionMessages from './BuildFields/MethodSection/FormSection/messages';
import methodSectionMessages from './BuildFields/MethodSection/messages';
import messages from './messages';
import NavCard from './NavCard';

type FollowUpAction = 'copy' | 'pdf' | 'excel';
export type SurveySetupAction = 'edit' | FollowUpAction;

interface Props {
  projectId: string;
  phaseId?: string;
  opened: boolean;
  onClose: () => void;
  initialAction?: FollowUpAction;
  onCloseAction?: () => void;
  draft?: {
    onChoose: (action: SurveySetupAction) => void;
    saving: boolean;
    uploading: boolean;
  };
}

const SurveySetupModal = ({
  projectId,
  phaseId,
  opened,
  onClose,
  initialAction,
  onCloseAction,
  draft,
}: Props) => {
  const { formatMessage } = useIntl();
  const [action, setAction] = useState(initialAction);
  const { data: customFields, isPending: questionsPending } = useCustomFields({
    projectId: phaseId ? projectId : undefined,
    phaseId,
  });
  const hasQuestions = customFields?.some(
    (field) => field.enabled && field.input_type !== 'page'
  );
  const { data: phase } = usePhase(phaseId);
  const { data: submissionCount } = useSubmissionCount({ phaseId });
  // Copying replaces the questions, which would orphan existing responses.
  const canCopy =
    !!draft || submissionCount?.data.attributes.totalSubmissions === 0;

  const choose = (choice: SurveySetupAction) => {
    if (draft) {
      draft.onChoose(choice);
      return;
    }

    onClose();
    if (choice === 'edit') {
      clHistory.push(
        `/admin/projects/${projectId}/phases/${phaseId}/survey-form/edit`
      );
    } else {
      setAction(choice);
    }
  };

  const closeAction = () => {
    setAction(undefined);
    onCloseAction?.();
  };

  // Imported responses wait for review on the importer page.
  const goToReview = () =>
    clHistory.push(
      `/admin/projects/${projectId}/phases/${phaseId}/input-importer`
    );

  return (
    <>
      <Modal
        opened={opened}
        close={() => {
          if (!draft?.saving) onClose();
        }}
        hideCloseButton={draft?.saving}
        width="720px"
        header={formatMessage(
          !draft && hasQuestions !== false
            ? formSectionMessages.surveyForm
            : methodSectionMessages.addQuestions
        )}
      >
        <Box p="24px" display="flex" flexDirection="column" gap="10px">
          {draft?.saving ? (
            <Box role="status" display="flex" alignItems="center" gap="12px">
              <Spinner />
              <Text m="0">{formatMessage(messages.savingAndOpening)}</Text>
            </Box>
          ) : draft?.uploading ? (
            <Text role="status" m="0">
              {formatMessage(messages.waitingForAttachment)}
            </Text>
          ) : (
            <>
              <Text variant="boHelper" m="0 0 6px">
                {formatMessage(messages.surveySetupLead)}
              </Text>
              {!draft && questionsPending ? (
                <Spinner />
              ) : (
                <NavCard
                  label={formatMessage(
                    !draft && hasQuestions !== false
                      ? methodSectionMessages.editForm
                      : messages.startFromScratch
                  )}
                  onClick={() => choose('edit')}
                />
              )}
              {canCopy && (
                <NavCard
                  label={formatMessage(messages.usePreviousSurvey)}
                  tooltip={formatMessage(messages.usePreviousSurveyTooltip)}
                  onClick={() => choose('copy')}
                />
              )}
              <PanelGroup label={formatMessage(messages.importResponses)}>
                <ImportInputsSection
                  formType="survey"
                  pdfImportSupported={isPDFUploadSupported('native_survey')}
                  onClickPDFImport={() => choose('pdf')}
                  onClickExcelImport={() => choose('excel')}
                />
              </PanelGroup>
            </>
          )}
        </Box>
      </Modal>
      {phaseId && (
        <>
          <CopySurveyModal
            editFormLink={`/admin/projects/${projectId}/phases/${phaseId}/survey-form/edit`}
            showCopySurveyModal={action === 'copy'}
            setShowCopySurveyModal={(open) => {
              if (!open) closeAction();
            }}
            surveyFormPersisted={!!phase?.data.attributes.custom_form_persisted}
          />
          <ImportPdfModal
            projectId={projectId}
            phaseId={phaseId}
            open={action === 'pdf'}
            onClose={closeAction}
            onUploaded={goToReview}
          />
          <ImportExcelModal
            projectId={projectId}
            phaseId={phaseId}
            open={action === 'excel'}
            onClose={closeAction}
            onUploaded={goToReview}
          />
        </>
      )}
    </>
  );
};

export default SurveySetupModal;
