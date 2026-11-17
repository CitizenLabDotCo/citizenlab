import React, { useState } from 'react';

import Banner from 'design-system/Banner';
import Button from 'design-system/Button';
import Modal from 'design-system/Modal';
import Spinner from 'design-system/Spinner';

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

import { useIntl } from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';

import methodSectionMessages from './BuildFields/MethodSection/messages';
import styles from './BuildPanel.module.css';
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
    refetch: refetchPhase,
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
      // Delete and Undo depend on the saved state the phase reports.
      await refetchPhase({ cancelRefetch: false });
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
        isOpen={opened}
        onOpenChange={(isOpen) => {
          if (!isOpen && !draft?.saving) onClose();
        }}
        showClose={!draft?.saving}
        size={866}
        title={formatMessage(
          !draft && hasQuestions !== false
            ? methodSectionMessages.editSurvey
            : methodSectionMessages.addQuestions
        )}
      >
        <div className={styles.setupBody}>
          {draft?.saving ? (
            <div role="status" className={styles.setupStatus}>
              <Spinner />
              <p className={styles.setupStatusText}>
                {formatMessage(messages.savingAndOpening)}
              </p>
            </div>
          ) : draft?.uploading ? (
            <p role="status" className={styles.setupStatusText}>
              {formatMessage(messages.waitingForAttachment)}
            </p>
          ) : (
            <>
              <p className={styles.setupLead}>
                {formatMessage(messages.surveySetupLead)}
              </p>
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
                <div className={styles.setupRow}>
                  <p className={styles.helper}>
                    {formatMessage(messages.savedSurveyQuestions)}
                  </p>
                  <Button
                    variant="quiet"
                    size={28}
                    icon="trash-2-16"
                    isDisabled={!canDelete || updatingQuestions}
                    isPending={updatingQuestions}
                    onPress={clearQuestions}
                  >
                    {formatMessage(messages.deleteSurveyQuestions)}
                  </Button>
                </div>
              )}
              {deletedQuestions && !hasSavedQuestions && (
                <div role="status" className={styles.setupUndo}>
                  <p className={styles.helper}>
                    {formatMessage(messages.surveyQuestionsDeleted)}
                  </p>
                  <Button
                    variant="quiet"
                    size={28}
                    isDisabled={!noResponses || updatingQuestions}
                    onPress={undoDelete}
                  >
                    {formatMessage(messages.undoDeleteQuestions)}
                  </Button>
                </div>
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
                <Banner tone="error">
                  {formatMessage(messages.questionsUpdateFailed)}
                </Banner>
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
        </div>
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
            variant="panel"
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
