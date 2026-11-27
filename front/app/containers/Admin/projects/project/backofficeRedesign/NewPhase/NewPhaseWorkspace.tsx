import React, { useRef, useState } from 'react';

import { useForm } from 'react-hook-form';
import { CLErrors } from 'typings';

import Button from 'design-system/Button';

import {
  IUpdatedPhaseProperties,
  ParticipationMethod,
  SetupReviewCard,
} from 'api/phases/types';
import useAddPhase from 'api/phases/useAddPhase';
import usePhases from 'api/phases/usePhases';
import useReviewSetupCard from 'api/phases/useReviewSetupCard';
import useUpdatePhase from 'api/phases/useUpdatePhase';
import { IProjectData } from 'api/projects/types';

import { DraftSetupReviewContext } from 'containers/Admin/projects/_shared/components/SetupReview';
import usePhaseFileAttachments, {
  fileAttachmentErrors,
} from 'containers/Admin/projects/_shared/usePhaseFileAttachments';
import inputTermMessages from 'containers/Admin/projects/project/inputTermMessages';
import { ValidationErrors } from 'containers/Admin/projects/project/phaseSetup/typings';
import validate from 'containers/Admin/projects/project/phaseSetup/validate';

import LanguageChecksContext, {
  useLanguageChecks,
} from 'components/admin/MultilocFields/LanguageChecksContext';
import {
  SaveReason,
  usePageSave,
  useRegisterPageSaver,
} from 'components/admin/PageSaveContext';

import { useIntl } from 'utils/cl-intl';
import Navigate from 'utils/cl-router/Navigate';

import ProjectWorkspace from '..';
import markSaved from '../_shared/markSaved';
import BuildFields from '../Phase/BuildPanel/BuildFields';
import methodSectionMessages from '../Phase/BuildPanel/BuildFields/MethodSection/messages';
import PlacementCard from '../Phase/BuildPanel/PlacementCard';
import DraftMethodSettings from '../Phase/DraftMethodSettings';
import EmptyState from '../Phase/EmptyState';
import phaseMessages from '../Phase/messages';
import PhasePreview from '../Phase/PhasePreview';
import { PhaseViewKey } from '../Phase/usePhaseViews';

import DraftPhaseViewSwitch from './DraftPhaseViewSwitch';
import messages from './messages';
import 'design-system/tokens.css';

interface DraftValues {
  phase: IUpdatedPhaseProperties;
  reviewedCards: SetupReviewCard[];
}

interface Props {
  project: IProjectData;
  participationMethod: ParticipationMethod;
  standalone: boolean;
  initialFormData: IUpdatedPhaseProperties;
  defaultsForMethod: (
    participationMethod: ParticipationMethod
  ) => IUpdatedPhaseProperties;
}

const NewPhaseWorkspace = ({
  project,
  participationMethod: initialParticipationMethod,
  standalone: initialStandalone,
  initialFormData,
  defaultsForMethod,
}: Props) => {
  const { formatMessage } = useIntl();
  const projectId = project.id;
  const { data: phases } = usePhases(projectId);
  const { mutateAsync: addPhase } = useAddPhase();
  const { mutateAsync: updatePhase } = useUpdatePhase();
  const { mutateAsync: reviewSetupCard } = useReviewSetupCard();
  const pageSave = usePageSave();

  const [participationMethod, setParticipationMethod] = useState(
    initialParticipationMethod
  );
  const [standalone, setStandalone] = useState(initialStandalone);
  const [activeView, setActiveView] = useState<PhaseViewKey>('build');

  const form = useForm<DraftValues>({
    defaultValues: { phase: initialFormData, reviewedCards: [] },
  });
  const {
    watch,
    setValue,
    getValues,
    getFieldState,
    formState: { isDirty },
  } = form;
  const formData = watch('phase');
  const reviewedCards = watch('reviewedCards');
  const [filesChanged, setFilesChanged] = useState(false);

  const [errors, setErrors] = useState<CLErrors | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>(
    {}
  );
  const savedPhase = useRef<{
    id: string;
    reviewedCards: SetupReviewCard[];
  }>();
  const [destination, setDestination] = useState<{ phaseId: string }>();

  const files = usePhaseFileAttachments({
    projectId,
    phaseId: undefined,
    savedAttachments: undefined,
    onStage: () => setFilesChanged(true),
  });

  const updateFormData = (newData: Partial<IUpdatedPhaseProperties>) => {
    setErrors((errors) =>
      errors
        ? Object.fromEntries(
            Object.entries(errors).filter(([field]) => !(field in newData))
          )
        : null
    );
    setValue(
      'phase',
      { ...getValues('phase'), ...newData },
      { shouldDirty: true }
    );
  };

  const savePhase = async ({
    phase: sentPhase,
    reviewedCards,
  }: DraftValues) => {
    const previous = savedPhase.current;
    if (!previous) {
      const { data: phase } = await addPhase({
        projectId,
        ...sentPhase,
        reviewed_setup_cards: reviewedCards,
      });
      savedPhase.current = { id: phase.id, reviewedCards };
      return phase.id;
    }

    // An attachment failure can leave the phase saved while the draft stays open.
    if (getFieldState('phase').isDirty) {
      await updatePhase({ ...sentPhase, phaseId: previous.id });
    }
    // Updating a phase doesn't take reviewed cards.
    for (const card of reviewedCards) {
      if (!previous.reviewedCards.includes(card)) {
        await reviewSetupCard({ phaseId: previous.id, card });
      }
    }
    savedPhase.current = { id: previous.id, reviewedCards };
    return previous.id;
  };

  const { checks, checkLanguages } = useLanguageChecks();

  const save = async (reason: SaveReason) => {
    setErrors(null);
    // A copy, so edits made while saving don't change what was sent.
    const sent = { ...getValues() };

    const languagesDone = checkLanguages();
    const { isValidated, errors } = validate(
      sent.phase,
      phases,
      formatMessage,
      savedPhase.current?.id,
      standalone
    );

    setValidationErrors(errors);
    if (!isValidated || !languagesDone) {
      throw new Error('Invalid phase');
    }

    try {
      const phaseId = await savePhase(sent);
      markSaved(form, sent);
      await files.save(phaseId);
      setFilesChanged(false);

      if (reason === 'button') setDestination({ phaseId });
    } catch (error) {
      setErrors(fileAttachmentErrors(error));
      throw error;
    }
  };

  useRegisterPageSaver('draft', { dirty: isDirty || filesChanged, save });

  const hasTitle = Object.values(formData.title_multiloc ?? {}).some(
    (title) => !!title.trim()
  );
  const saveDisabledReason =
    formData.start_at && hasTitle
      ? undefined
      : formatMessage(messages.addDatesAndTitleToSave);

  // The header button also saves the other panels. The saved phase only opens
  // once none of them has changes left, so a failed one keeps its edits.
  const settled = !pageSave?.dirty && !pageSave?.saving;

  if (destination && settled) {
    return (
      <Navigate
        to="/admin/projects/$projectId/phases/$phaseId/setup"
        params={{ projectId, phaseId: destination.phaseId }}
      />
    );
  }

  return (
    <LanguageChecksContext.Provider value={checks}>
      <DraftSetupReviewContext.Provider
        value={{
          reviewed: reviewedCards,
          onReview: (card) =>
            setValue(
              'reviewedCards',
              [...new Set([...getValues('reviewedCards'), card])],
              { shouldDirty: true }
            ),
        }}
      >
        <ProjectWorkspace
          project={project}
          activeView={activeView}
          viewSwitch={
            <DraftPhaseViewSwitch
              activeView={activeView}
              onChange={setActiveView}
            />
          }
          draft={{
            inputTerm: formData.input_term,
            label: formatMessage(
              standalone ? messages.newSurveyCrumb : messages.newPhaseCrumb
            ),
            saveDisabledReason,
            methodSettings: (
              <DraftMethodSettings
                surveyPlacement={
                  // Only the platform's own survey can run outside the timeline.
                  participationMethod === 'native_survey' && (
                    <PlacementCard
                      name="new-survey-placement"
                      value={standalone ? 'standalone' : 'on_timeline'}
                      onChange={(placement_type) => {
                        setStandalone(placement_type === 'standalone');
                        setValidationErrors({});
                        updateFormData({ placement_type });
                      }}
                    />
                  )
                }
                formData={formData}
                validationErrors={validationErrors}
                apiErrors={errors}
                onChange={updateFormData}
                setValidationErrors={setValidationErrors}
              />
            ),
          }}
          sidePanel={
            <BuildFields
              projectId={projectId}
              participationMethod={participationMethod}
              formData={formData}
              errors={errors}
              validationErrors={validationErrors}
              standalone={standalone}
              files={files}
              draftQuestionsAction={
                // The other forms show the same reason on their own card.
                participationMethod === 'native_survey' && (
                  <Button
                    fullWidth
                    variant="secondary"
                    disabledReason={formatMessage(
                      phaseMessages.saveFirstToAddQuestions
                    )}
                  >
                    {formatMessage(methodSectionMessages.addQuestions)}
                  </Button>
                )
              }
              surveyMethodSwitch={{
                onSelect: (method) => {
                  setParticipationMethod(method);
                  updateFormData(defaultsForMethod(method));
                },
              }}
              onChange={updateFormData}
              onDatesChange={(dates) => {
                setValidationErrors((errors) => ({
                  ...errors,
                  phaseDateError: undefined,
                }));
                updateFormData(dates);
              }}
            />
          }
        >
          {activeView === 'build' ? (
            <PhasePreview projectId={projectId} draft={formData} />
          ) : (
            <EmptyState
              size="large"
              title={
                activeView === 'manage'
                  ? formatMessage(messages.draftManageEmpty, {
                      terms: formatMessage(
                        inputTermMessages.capitalizedPlural,
                        {
                          term: formData.input_term ?? 'other',
                        }
                      ),
                    })
                  : formatMessage(messages.draftInsightsEmpty)
              }
            />
          )}
        </ProjectWorkspace>
      </DraftSetupReviewContext.Provider>
    </LanguageChecksContext.Provider>
  );
};

export default NewPhaseWorkspace;
