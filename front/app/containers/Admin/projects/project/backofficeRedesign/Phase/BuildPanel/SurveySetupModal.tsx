import React, { useState } from 'react';

import { Box, Button, Spinner, Text } from '@citizenlab/cl2-component-library';

import { IFlatCustomField } from 'api/custom_fields/types';
import useCustomFields from 'api/custom_fields/useCustomFields';
import useUpdateCustomFields from 'api/custom_fields/useUpdateCustomFields';
import usePhase from 'api/phases/usePhase';
import useSubmissionCount from 'api/submission_count/useSubmissionCount';

import PanelGroup from 'containers/Admin/projects/_shared/components/SettingsPanel/PanelGroup';
import { isPDFUploadSupported } from 'containers/Admin/projects/project/inputImporter/ReviewSection/utils';
import CopySurveyModal from 'containers/Admin/projects/project/surveyFormAssets/CopySurveyModal';

import ImportInputsSection from 'components/admin/FormSync/ImportInputsSection';
import ImportExcelModal from 'components/admin/InputImporterModals/ImportExcelModal';
import ImportPdfModal from 'components/admin/InputImporterModals/ImportPdfModal';
import { transformFieldForSubmission } from 'components/FormBuilder/edit/utils';
import Error from 'components/UI/Error';
import Modal from 'components/UI/Modal';

import { useIntl } from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';

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
  const { mutateAsync: updateQuestions, isPending: updatingQuestions } =
    useUpdateCustomFields();
  const [deletedQuestions, setDeletedQuestions] =
    useState<IFlatCustomField[]>();
  const [questionsFailed, setQuestionsFailed] = useState(false);
  const [action, setAction] = useState(initialAction);
  const { data: customFields, isPending: questionsPending } = useCustomFields({
    projectId: phaseId ? projectId : undefined,
    phaseId,
  });
  const hasQuestions = customFields?.some(
    (field) => field.enabled && field.input_type !== 'page'
  );
  const {
    data: phase,
    isFetching: phaseFetching,
    isPlaceholderData: phasePlaceholder,
  } = usePhase(phaseId);
  const { data: submissionCount } = useSubmissionCount({ phaseId });
  const hasSavedQuestions =
    !!phase?.data.attributes.custom_form_persisted && !!hasQuestions;
  const noResponses = submissionCount?.data.attributes.totalSubmissions === 0;
  const canCopy = !!draft || (noResponses && !hasSavedQuestions);
  const canDelete =
    noResponses &&
    customFields?.every(
      (field) =>
        field.input_type === 'page' ||
        !field.enabled ||
        (field.isEnabledEditable !== false &&
          !field.constraints?.locks?.deletion)
    );

  const saveQuestions = async (fields: IFlatCustomField[]) => {
    if (!phaseId || !noResponses || updatingQuestions) return false;
    setQuestionsFailed(false);
    try {
      await updateQuestions({
        projectId,
        phaseId,
        customFields: fields.map((field) =>
          transformFieldForSubmission(field, fields)
        ),
        customForm: { saveType: 'manual' },
      });
      return true;
    } catch {
      setQuestionsFailed(true);
      return false;
    }
  };

  const clearQuestions = async () => {
    if (!canDelete || !customFields) return;
    // Retain inactive fields so Undo restores their IDs, choices and branching.
    const cleared = customFields.map((field) => ({
      ...field,
      enabled: field.input_type === 'page' ? field.enabled : false,
    }));
    if (await saveQuestions(cleared)) setDeletedQuestions(customFields);
  };

  const undoDelete = async () => {
    if (deletedQuestions && (await saveQuestions(deletedQuestions))) {
      setDeletedQuestions(undefined);
    }
  };

  const choose = (choice: SurveySetupAction) => {
    if (updatingQuestions || (choice === 'copy' && !canCopy)) return;
    setDeletedQuestions(undefined);
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
            ? methodSectionMessages.editSurvey
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
              {hasSavedQuestions && (
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                  gap="12px"
                >
                  <Text variant="boHelper" m="0">
                    {formatMessage(messages.savedSurveyQuestions)}
                  </Text>
                  <Button
                    buttonStyle="bo-text"
                    icon="delete"
                    ariaLabel={formatMessage(messages.deleteSurveyQuestions)}
                    disabled={!canDelete || updatingQuestions}
                    processing={updatingQuestions}
                    onClick={clearQuestions}
                  >
                    {formatMessage(messages.deleteSurveyQuestions)}
                  </Button>
                </Box>
              )}
              {deletedQuestions && !hasSavedQuestions && (
                <Box
                  role="status"
                  display="flex"
                  alignItems="center"
                  gap="12px"
                >
                  <Text variant="boHelper" m="0">
                    {formatMessage(messages.surveyQuestionsDeleted)}
                  </Text>
                  <Button
                    buttonStyle="bo-text"
                    onClick={undoDelete}
                    disabled={!noResponses || updatingQuestions}
                  >
                    {formatMessage(messages.undoDeleteQuestions)}
                  </Button>
                </Box>
              )}
              <NavCard
                label={formatMessage(messages.usePreviousSurvey)}
                tooltip={
                  hasSavedQuestions
                    ? formatMessage(messages.deleteQuestionsToReuse)
                    : formatMessage(messages.usePreviousSurveyTooltip)
                }
                disabled={!canCopy || updatingQuestions}
                onClick={() => choose('copy')}
              />
              {questionsFailed && (
                <Error text={formatMessage(messages.questionsUpdateFailed)} />
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
            surveyFormPersisted={hasSavedQuestions}
            surveyFormLoading={!phase || phaseFetching || phasePlaceholder}
            variant="bo"
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
