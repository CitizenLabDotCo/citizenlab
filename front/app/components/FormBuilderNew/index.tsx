import React, { useCallback, useEffect, useRef, useState } from 'react';

import {
  Box,
  Button,
  colors,
  Icon,
  Spinner,
  Title,
} from '@citizenlab/cl2-component-library';
import { yupResolver } from '@hookform/resolvers/yup';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { createPortal } from 'react-dom';
import { FocusOn } from 'react-focus-on';
import { FormProvider, useFieldArray, useForm } from 'react-hook-form';

import {
  ICustomFieldInputType,
  IFlatCustomField,
  IFlatCustomFieldWithIndex,
} from 'api/custom_fields/types';
import useFormCustomFields from 'api/custom_fields/useCustomFields';
import useUpdateCustomField from 'api/custom_fields/useUpdateCustomFields';
import useCustomForm from 'api/custom_form/useCustomForm';
import { IPhaseData } from 'api/phases/types';
import usePhase from 'api/phases/usePhase';
import useSubmissionsCount from 'api/submission_count/useSubmissionCount';

import useLocale from 'hooks/useLocale';

import useAiAssistantEnabled from 'components/AiAssistant/useAiAssistantEnabled';
import useLatestConversation from 'components/AiAssistant/useLatestConversation';
import EditingLock from 'components/FormBuilder/components/EditingLock';
import FormBuilderSettings from 'components/FormBuilder/components/FormBuilderSettings';
import fieldMessages from 'components/FormBuilder/components/FormFields/FormField/messages';
import FormStatus from 'components/FormBuilder/components/FormStatus';
import formBuilderComponentMessages from 'components/FormBuilder/components/messages';
import SurveyAssistant from 'components/FormBuilder/components/SurveyAssistant';
import surveyAssistantMessages from 'components/FormBuilder/components/SurveyAssistant/messages';
import {
  createNewField,
  createValidationSchema,
  transformFieldForSubmission,
} from 'components/FormBuilder/edit/utils';
import formBuilderMessages from 'components/FormBuilder/messages';
import {
  FormBuilderConfig,
  ResolvedFormBuilderConfig,
  resolveFormBuilderConfig,
} from 'components/FormBuilder/utils';
import HelmetIntl from 'components/HelmetIntl';
import CloseIconButton from 'components/UI/CloseIconButton';
import Warning from 'components/UI/Warning';

import { useIntl } from 'utils/cl-intl';
import { type TypedLinkProps } from 'utils/cl-router/Link';
import { updateSearchParams } from 'utils/cl-router/updateSearchParams';
import { handleHookFormSubmissionError } from 'utils/errorUtils';
import { isNilOrError } from 'utils/helperUtils';
import { reportError } from 'utils/loggingUtils';
import { useParams, useSearch } from 'utils/router';

import AddElementModal from './AddElementModal';
import Canvas from './Canvas';
import { BuilderContext } from './context';
import DeletePageModal from './DeletePageModal';
import messages from './messages';
import PageList from './PageList';
import ShareDndManager from './ShareDndManager';
import SidebarHeader from './SidebarHeader';
import {
  DeletePageMode,
  PageActionBlocker,
  PageGroup,
  QuestionPosition,
  asUnsavedField,
  extractUserPage,
  getDeletePageBlocker,
  getDisplayGroups,
  getDuplicatePageBlocker,
  getMergeTargetPage,
  getPageGroups,
  insertDuplicatePage,
  insertDuplicateQuestion,
  insertPageAfter,
  insertQuestion,
  isFormEndPage,
  isUserPage,
  movePage,
  moveQuestion,
  removePage,
  removeQuestion,
} from './utils';

const SIDEBAR_WIDTH = '240px';
const PANEL_WIDTH = '420px';

type FormValues = {
  customFields: IFlatCustomField[];
};

type RightPanel = 'settings' | 'assistant' | null;

type AddModalState = {
  questionPosition: QuestionPosition;
};

type FormEditProps = {
  defaultValues: FormValues;
  builderConfig: ResolvedFormBuilderConfig;
  totalSubmissions: number;
  viewFormLink: TypedLinkProps;
  phase: IPhaseData;
};

const FormEdit = ({
  defaultValues,
  builderConfig,
  totalSubmissions,
  viewFormLink,
  phase,
}: FormEditProps) => {
  const phaseId = phase.id;
  const projectId = phase.relationships.project.data.id;
  const { formatMessage } = useIntl();
  const locale = useLocale();

  // --- AI assistant (same rules as the current builder) ---
  const assistantEnabled =
    useAiAssistantEnabled() &&
    phase.attributes.participation_method === 'native_survey';
  const { conversation: assistantConversation } = useLatestConversation(
    { surfaceKey: 'survey_builder', subjectId: phaseId },
    { enabled: assistantEnabled }
  );
  const assistantStatus = assistantConversation?.data.attributes.status;
  // Editing by hand meanwhile would make the assistant's proposed change stale.
  const lockedByAssistant =
    assistantStatus === 'running' || assistantStatus === 'awaiting_user';

  // --- Form state and saving (ported from the current builder) ---
  const { mutateAsync: updateFormCustomFields } = useUpdateCustomField();
  const { data: formCustomFields, isFetching } = useFormCustomFields({
    projectId,
    phaseId,
  });
  const { data: customForm } = useCustomForm(phase);

  // Set the form opened at date from the API date only when the form is first loaded
  const [formOpenedAt, setFormOpenedAt] = useState<string | undefined>();
  useEffect(() => {
    if (!formOpenedAt && customForm?.data.attributes.opened_at) {
      setFormOpenedAt(customForm.data.attributes.opened_at);
    }
  }, [formOpenedAt, customForm]);

  const methods = useForm<FormValues>({
    mode: 'onBlur',
    defaultValues,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- the shared schema isn't typed against FormValues
    resolver: yupResolver(createValidationSchema(formatMessage)) as any,
  });
  const {
    setError,
    handleSubmit,
    control,
    formState: { isDirty, errors },
    getValues,
    reset,
    trigger,
    watch,
  } = methods;
  const { replace } = useFieldArray({
    name: 'customFields',
    control,
  });

  const fields = watch('customFields');
  const groups = getPageGroups(fields);

  // The read-only demographics page, only present in the participant-facing
  // fields. Shown before the ending page, like participants see it.
  const { data: publicFields } = useFormCustomFields({
    projectId,
    phaseId,
    publicFields: true,
  });
  const userPage = extractUserPage(publicFields);
  const displayGroups = getDisplayGroups(groups, userPage);

  // --- What's shown where ---
  const [currentPageId, setCurrentPageId] = useState<string | undefined>(
    groups[0]?.page.id
  );
  // Empty when the form has no pages at all.
  const currentGroup: PageGroup | undefined =
    displayGroups.find((group) => group.page.id === currentPageId) ??
    (displayGroups.length > 0 ? displayGroups[0] : undefined);
  const shownPageId = currentGroup?.page.id;
  const showPage = useCallback((pageId: string) => {
    setCurrentPageId(pageId);
  }, []);

  const [selectedFieldId, setSelectedFieldId] = useState<string | undefined>();
  const selectedIndex = selectedFieldId
    ? fields.findIndex((field) => field.id === selectedFieldId)
    : -1;
  const selectedField: IFlatCustomFieldWithIndex | undefined =
    selectedIndex >= 0
      ? { ...fields[selectedIndex], index: selectedIndex }
      : undefined;

  const [panel, setPanel] = useState<RightPanel>(null);
  const [addModal, setAddModal] = useState<AddModalState | null>(null);

  const customFieldErrors = errors.customFields;
  const erroredFieldIds = new Set(
    fields
      .filter(
        (_field, i) =>
          Array.isArray(customFieldErrors) && !!customFieldErrors[i]
      )
      .map((field) => field.id)
  );

  // --- Saving ---
  const [successMessageIsVisible, setSuccessMessageIsVisible] = useState(false);
  const [isUpdatingForm, setIsUpdatingForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Synchronous guard against double-clicks and autosave during a manual save.
  const isSubmittingRef = useRef(false);
  const isAutosaveRef = useRef(false);

  // After saving, the server hands back the fields with real ids. Keep the same
  // page open and the same field selected by their position.
  useEffect(() => {
    if (!isUpdatingForm || isFetching || !formCustomFields) return;

    const previousFields = getValues('customFields');
    const previousPageIndex = getPageGroups(previousFields).findIndex(
      (group) => group.page.id === currentPageId
    );
    const previousSelectedIndex = previousFields.findIndex(
      (field) => field.id === selectedFieldId
    );

    reset({ customFields: formCustomFields });

    // An unknown page id falls back to the first page when rendering.
    const newGroups = getPageGroups(formCustomFields);
    setCurrentPageId(
      previousPageIndex >= 0 && previousPageIndex < newGroups.length
        ? newGroups[previousPageIndex].page.id
        : undefined
    );
    setSelectedFieldId(
      previousSelectedIndex >= 0 &&
        previousSelectedIndex < formCustomFields.length
        ? formCustomFields[previousSelectedIndex].id
        : undefined
    );
    setIsUpdatingForm(false);
    setIsSubmitting(false);
    isSubmittingRef.current = false;
  }, [
    formCustomFields,
    isUpdatingForm,
    isFetching,
    reset,
    getValues,
    currentPageId,
    selectedFieldId,
  ]);

  // Remove copy_from param on save to avoid overwriting a saved survey when reloading
  const searchParams = useSearch({ strict: false });
  const resetCopyFrom = () => {
    if (searchParams.copy_from !== undefined) {
      updateSearchParams({ copy_from: undefined });
    }
  };

  const onFormSubmit = async ({ customFields }: FormValues) => {
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;

    setSuccessMessageIsVisible(false);
    try {
      setIsSubmitting(true);
      await updateFormCustomFields(
        {
          projectId,
          phaseId,
          customFields: customFields.map((field) =>
            transformFieldForSubmission(field, customFields)
          ),
          customForm: {
            saveType: isAutosaveRef.current ? 'auto' : 'manual',
            openedAt: formOpenedAt,
            fieldsLastUpdatedAt:
              customForm?.data.attributes.fields_last_updated_at,
          },
        },
        {
          onSuccess: () => {
            setIsUpdatingForm(true);
            setSuccessMessageIsVisible(true);
            resetCopyFrom();
          },
        }
      );
    } catch (error) {
      const errorType =
        Array.isArray(error?.errors?.form) &&
        error.errors.form.length > 0 &&
        error.errors.form[0].error === 'stale_data'
          ? 'staleData'
          : 'customFields';
      handleHookFormSubmissionError(error, setError, errorType);
      setIsSubmitting(false);
      isSubmittingRef.current = false;
    } finally {
      isAutosaveRef.current = false;
    }
  };

  // Autosave when the settings panel is closed with its X, like the current
  // builder. Off once the survey has submissions.
  const closeSettings = (triggerAutosave?: boolean) => {
    setSelectedFieldId(undefined);
    setPanel((current) => (current === 'settings' ? null : current));

    if (
      triggerAutosave &&
      totalSubmissions === 0 &&
      isDirty &&
      !isSubmittingRef.current
    ) {
      isAutosaveRef.current = true;
      onFormSubmit(getValues());
    }
  };

  // --- Actions used throughout the builder ---
  const openSettings = (fieldId: string) => {
    setSelectedFieldId(fieldId);
    setPanel('settings');
  };

  // Selecting an existing element also validates, to surface its problems.
  // Freshly added ones aren't, so they don't show up as errors right away.
  const selectField = (fieldId: string) => {
    openSettings(fieldId);
    trigger();
  };

  const openAssistant = () => {
    if (panel === 'settings') closeSettings(true);
    setPanel('assistant');
  };

  const [dropTarget, setDropTargetState] = useState<QuestionPosition | null>(
    null
  );
  const dropTargetRef = useRef<QuestionPosition | null>(null);
  const setDropTarget = useCallback((target: QuestionPosition | null) => {
    const previous = dropTargetRef.current;
    if (
      previous?.pageId === target?.pageId &&
      previous?.index === target?.index
    ) {
      return;
    }
    dropTargetRef.current = target;
    setDropTargetState(target);
  }, []);

  const dropQuestion = (questionId: string, target?: QuestionPosition) => {
    const position = target ?? dropTargetRef.current;
    setDropTarget(null);
    if (!position) return;

    const reordered = moveQuestion(
      getValues('customFields'),
      questionId,
      position
    );
    if (reordered) {
      replace(reordered);
      trigger();
    }
    setCurrentPageId(position.pageId);
  };

  const dropPage = (pageId: string, targetPageIndex: number) => {
    const reordered = movePage(
      getValues('customFields'),
      pageId,
      targetPageIndex
    );
    if (reordered) {
      replace(reordered);
      trigger();
    }
  };

  const editableGroups = groups.filter((group) => !isFormEndPage(group.page));

  const getDefaultQuestionPosition = (): QuestionPosition | null => {
    // Right after the selected question...
    const groupWithSelected = groups.find((group) =>
      group.questions.some(({ field }) => field.id === selectedFieldId)
    );
    if (groupWithSelected) {
      const position = groupWithSelected.questions.findIndex(
        ({ field }) => field.id === selectedFieldId
      );
      return { pageId: groupWithSelected.page.id, index: position + 1 };
    }
    // ...otherwise at the end of the open page.
    const group = getOpenEditablePage();
    if (!group) return null;
    return { pageId: group.page.id, index: group.questions.length };
  };

  // The open page, or the last regular page when the demographics or ending
  // page is open (nothing can be added to those).
  const getOpenEditablePage = (): PageGroup | undefined =>
    currentGroup &&
    !isFormEndPage(currentGroup.page) &&
    !isUserPage(currentGroup.page)
      ? currentGroup
      : editableGroups.length > 0
      ? editableGroups[editableGroups.length - 1]
      : undefined;

  const openAddModal = (position?: QuestionPosition) => {
    const questionPosition = position ?? getDefaultQuestionPosition();
    if (!questionPosition) return;
    setAddModal({ questionPosition });
  };

  // Every structural change is a pure function on the field list (see
  // utils.ts, covered by tests) whose result replaces the list in one go.
  // A null result means the change wasn't possible: the UI shouldn't offer it
  // then, so it's reported instead of silently ignored.
  const applyChange = (
    action: string,
    updated: IFlatCustomField[] | null
  ): updated is IFlatCustomField[] => {
    if (!updated) {
      reportError(new Error(`FormBuilderNew: could not ${action}`));
      return false;
    }
    replace(updated);
    return true;
  };

  const closeSelectionOf = (fieldIds: string[]) => {
    if (selectedFieldId && fieldIds.includes(selectedFieldId)) {
      setSelectedFieldId(undefined);
      setPanel((current) => (current === 'settings' ? null : current));
    }
  };

  const addQuestion = (
    inputType: ICustomFieldInputType,
    position: QuestionPosition
  ) => {
    if (isNilOrError(locale)) return;
    const question = asUnsavedField(
      createNewField(inputType, locale, formatMessage)
    );
    if (
      !applyChange('add question', insertQuestion(fields, position, question))
    ) {
      return;
    }
    setAddModal(null);
    setCurrentPageId(position.pageId);
    openSettings(question.id);
  };

  const addPage = (afterPageId: string) => {
    if (isNilOrError(locale)) return;
    const page = asUnsavedField(createNewField('page', locale, formatMessage));
    if (!applyChange('add page', insertPageAfter(fields, afterPageId, page))) {
      return;
    }
    setCurrentPageId(page.id);
    openSettings(page.id);
  };

  const duplicateQuestion = (questionId: string) => {
    const result = insertDuplicateQuestion(
      fields,
      questionId,
      formatMessage(fieldMessages.copyNoun)
    );
    if (!applyChange('duplicate question', result?.fields ?? null) || !result) {
      return;
    }
    openSettings(result.newId);
  };

  const duplicatePage = (pageId: string) => {
    const result = insertDuplicatePage(
      fields,
      pageId,
      formatMessage(fieldMessages.copyNoun)
    );
    if (!applyChange('duplicate page', result?.fields ?? null) || !result) {
      return;
    }
    setCurrentPageId(result.newPageId);
    openSettings(result.newPageId);
  };

  // Page whose deletion is being confirmed (it has questions, so the admin
  // chooses what happens to them).
  const [pageToDelete, setPageToDelete] = useState<string | null>(null);

  const deletePage = (pageId: string, mode: DeletePageMode) => {
    // Show the page that took over the questions (or the neighbouring page).
    const target = getMergeTargetPage(fields, pageId);
    const pageQuestionIds =
      groups
        .find((group) => group.page.id === pageId)
        ?.questions.map(({ field }) => field.id) ?? [];
    if (!applyChange('delete page', removePage(fields, pageId, mode))) return;
    if (target && currentGroup?.page.id === pageId) {
      setCurrentPageId(target.id);
    }
    closeSelectionOf(
      mode === 'deleteQuestions' ? [pageId, ...pageQuestionIds] : [pageId]
    );
    trigger();
  };

  const deleteField = (fieldId: string) => {
    const field = fields.find((field) => field.id === fieldId);
    if (field?.input_type === 'page') {
      const hasQuestions = groups.some(
        (group) =>
          group.page.id === fieldId &&
          group.questions.some(({ field }) => field.enabled !== false)
      );
      if (hasQuestions) {
        setPageToDelete(fieldId);
      } else {
        deletePage(fieldId, 'keepQuestions');
      }
      return;
    }
    if (!applyChange('delete question', removeQuestion(fields, fieldId))) {
      return;
    }
    closeSelectionOf([fieldId]);
    trigger();
  };

  const getPageBlocker = (
    action: 'delete' | 'duplicate',
    pageId: string
  ): PageActionBlocker | null => {
    const page =
      fields.find((field) => field.id === pageId) ??
      (userPage?.page.id === pageId ? userPage.page : undefined);
    if (!page) return null;
    return action === 'delete'
      ? getDeletePageBlocker(fields, page)
      : getDuplicatePageBlocker(fields, page);
  };

  // The demographics page isn't in the form, so it has no settings. It still
  // opens the (empty) panel, so clicking through the pages doesn't make the
  // panel jump open and closed.
  const isDemographicsSelected =
    !!userPage && selectedFieldId === userPage.page.id;
  const panelOpen =
    panel === 'assistant' ||
    (panel === 'settings' && (!!selectedField || isDemographicsSelected));

  return (
    <Box
      display="flex"
      w="100%"
      h="100vh"
      zIndex="10000"
      position="fixed"
      bgColor={colors.grey100}
      data-cy="e2e-survey-form-builder-new"
    >
      <HelmetIntl title={formBuilderMessages.helmetTitle} />
      <FocusOn>
        <FormProvider {...methods}>
          <form
            onSubmit={handleSubmit(onFormSubmit)}
            style={{ display: 'flex', width: '100vw', height: '100vh' }}
          >
            <BuilderContext.Provider
              value={{
                fields,
                userPage,
                currentPageId: shownPageId,
                showPage,
                selectedFieldId,
                selectField,
                erroredFieldIds,
                dropTarget,
                setDropTarget,
                dropQuestion,
                dropPage,
                openAddModal,
                duplicateField: duplicateQuestion,
                deleteField,
                duplicatePage,
                getPageBlocker,
                closeSettings,
              }}
            >
              {/* Left: page list with the Add button at the bottom */}
              <Box
                flex={`0 0 ${SIDEBAR_WIDTH}`}
                w={SIDEBAR_WIDTH}
                h="100vh"
                display="flex"
                flexDirection="column"
                bgColor={colors.white}
                borderRight={`1px solid ${colors.borderLight}`}
              >
                <SidebarHeader
                  phase={phase}
                  projectId={projectId}
                  builderConfig={builderConfig}
                  viewFormLink={viewFormLink}
                />
                <Box flex="1" overflowY="auto" pt="8px">
                  <EditingLock locked={lockedByAssistant}>
                    <PageList />
                  </EditingLock>
                </Box>
                <Box p="12px" borderTop={`1px solid ${colors.borderLight}`}>
                  <Button
                    type="button"
                    buttonStyle="admin-dark"
                    icon="plus"
                    width="100%"
                    disabled={lockedByAssistant}
                    onClick={() => {
                      const afterPage = getOpenEditablePage();
                      if (afterPage) addPage(afterPage.page.id);
                    }}
                    data-cy="e2e-form-builder-new-add-button"
                  >
                    {formatMessage(messages.addPage)}
                  </Button>
                </Box>
              </Box>

              {/* Center: WYSIWYG preview of the open page */}
              <Box flex="1" minWidth="0px" h="100vh" position="relative">
                <EditingLock locked={lockedByAssistant}>
                  <Canvas
                    phase={phase}
                    projectId={projectId}
                    top={
                      <>
                        <FormStatus
                          successMessageIsVisible={successMessageIsVisible}
                          setSuccessMessageIsVisible={
                            setSuccessMessageIsVisible
                          }
                          isSubmitting={isSubmitting}
                          // Hide the access rights notice; only save status,
                          // errors and warnings are shown here.
                          builderConfig={{
                            ...builderConfig,
                            getAccessRightsNotice: undefined,
                          }}
                          projectId={projectId}
                          phaseId={phaseId}
                          showDragAndDropHint={false}
                        />
                        {lockedByAssistant && (
                          <Warning mb="16px">
                            {formatMessage(
                              surveyAssistantMessages.editingLocked2
                            )}
                          </Warning>
                        )}
                      </>
                    }
                  />
                </EditingLock>

                {/* Bottom right: save and the AI assistant bubble */}
                <Box
                  position="absolute"
                  right="24px"
                  bottom="24px"
                  zIndex="5"
                  display="flex"
                  alignItems="center"
                  gap="12px"
                >
                  <Button
                    type="submit"
                    buttonStyle="admin-dark"
                    icon="save"
                    processing={isSubmitting}
                    disabled={isSubmitting || lockedByAssistant}
                    boxShadow="0px 2px 8px rgba(0, 0, 0, 0.2)"
                    data-cy="e2e-form-builder-new-save"
                  >
                    {formatMessage(messages.save)}
                  </Button>
                  {assistantEnabled && panel !== 'assistant' && (
                    <Box
                      as="button"
                      type="button"
                      aria-label={formatMessage(messages.openAssistant)}
                      title={formatMessage(messages.openAssistant)}
                      onClick={openAssistant}
                      w="52px"
                      h="52px"
                      p="0px"
                      border="none"
                      borderRadius="50%"
                      bgColor={colors.primary}
                      boxShadow="0px 2px 8px rgba(0, 0, 0, 0.25)"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      style={{ cursor: 'pointer' }}
                      data-cy="e2e-form-builder-new-assistant-bubble"
                    >
                      <Icon name="stars" fill={colors.white} />
                    </Box>
                  )}
                </Box>
              </Box>

              {/* Right: field/page settings or the AI assistant, one at a time */}
              {(panelOpen || assistantEnabled) && (
                <Box
                  flex={`0 0 ${PANEL_WIDTH}`}
                  w={PANEL_WIDTH}
                  h="100vh"
                  overflow="hidden"
                  bgColor={colors.white}
                  borderLeft={`1px solid ${colors.borderLight}`}
                  display={panelOpen ? 'block' : 'none'}
                >
                  {panel === 'settings' && isDemographicsSelected && (
                    <Box
                      h="100vh"
                      p="20px"
                      position="relative"
                      data-cy="e2e-form-builder-new-demographics-settings"
                    >
                      <Box position="absolute" right="10px">
                        <CloseIconButton
                          a11y_buttonActionMessage={
                            formBuilderComponentMessages.close
                          }
                          onClick={() => closeSettings(true)}
                          iconColor={colors.textSecondary}
                          iconColorOnHover={'#000'}
                        />
                      </Box>
                      <Title variant="h4" as="h2" mb="8px">
                        {formatMessage(formBuilderComponentMessages.page)}
                      </Title>
                    </Box>
                  )}
                  {panel === 'settings' && selectedField && (
                    <Box h="100vh" overflowY="auto">
                      <FormBuilderSettings
                        key={selectedField.id}
                        field={selectedField}
                        closeSettings={closeSettings}
                        builderConfig={builderConfig}
                      />
                    </Box>
                  )}
                  {/* Hidden, not unmounted, so a typed request survives editing a field. */}
                  {assistantEnabled && (
                    <Box display={panel === 'assistant' ? 'block' : 'none'}>
                      <Box
                        display="flex"
                        justifyContent="flex-end"
                        px="12px"
                        pt="8px"
                      >
                        <CloseIconButton
                          a11y_buttonActionMessage={messages.closePanel}
                          onClick={() => setPanel(null)}
                          iconColor={colors.textSecondary}
                          iconColorOnHover={'#000'}
                        />
                      </Box>
                      <SurveyAssistant
                        phaseId={phaseId}
                        onFormReplaced={() => {
                          resetCopyFrom();
                          setSelectedFieldId(undefined);
                          setIsUpdatingForm(true);
                        }}
                      />
                    </Box>
                  )}
                </Box>
              )}

              {pageToDelete && (
                <DeletePageModal
                  fields={fields}
                  pageId={pageToDelete}
                  onClose={() => setPageToDelete(null)}
                  onDelete={(mode) => {
                    deletePage(pageToDelete, mode);
                    setPageToDelete(null);
                  }}
                />
              )}
              {addModal && (
                <AddElementModal
                  groups={groups}
                  initialQuestionPosition={addModal.questionPosition}
                  builderConfig={builderConfig}
                  onClose={() => setAddModal(null)}
                  onAddQuestion={addQuestion}
                />
              )}
            </BuilderContext.Provider>
          </form>
        </FormProvider>
      </FocusOn>
    </Box>
  );
};

type FormBuilderNewProps = {
  builderConfig: FormBuilderConfig;
  formCustomFields: IFlatCustomField[] | undefined | Error;
  goBackUrl: string;
  viewFormLink: TypedLinkProps;
};

const FormBuilderNew = ({
  builderConfig,
  formCustomFields,
  goBackUrl,
  viewFormLink,
}: FormBuilderNewProps) => {
  const modalPortalElement = document.getElementById('modal-portal');
  const { phaseId } = useParams({ strict: false });
  const { data: submissionCount } = useSubmissionsCount({ phaseId });
  const { data: phase } = usePhase(phaseId);

  if (!phase) return null;

  if (isNilOrError(formCustomFields) || isNilOrError(submissionCount)) {
    return <Spinner />;
  }

  return modalPortalElement
    ? createPortal(
        <DndProvider backend={HTML5Backend}>
          <ShareDndManager />
          <FormEdit
            defaultValues={{ customFields: formCustomFields }}
            phase={phase.data}
            builderConfig={resolveFormBuilderConfig(
              builderConfig,
              phase.data,
              goBackUrl
            )}
            totalSubmissions={submissionCount.data.attributes.totalSubmissions}
            viewFormLink={viewFormLink}
          />
        </DndProvider>,
        modalPortalElement
      )
    : null;
};

export default FormBuilderNew;
