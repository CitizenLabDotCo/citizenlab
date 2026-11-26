import React, { useEffect, useRef, useState } from 'react';

import { CLErrors } from 'typings';

import {
  IPhaseData,
  IUpdatedPhaseProperties,
  ParticipationMethod,
} from 'api/phases/types';
import usePhase from 'api/phases/usePhase';
import useUpdatePhase from 'api/phases/useUpdatePhase';

import { AccessOnlyAction } from 'containers/Admin/projects/_shared/components/PhaseActionAccessRow';
import ExpandAllContext from 'containers/Admin/projects/_shared/components/SettingsPanel/ExpandAllContext';
import PanelGroup from 'containers/Admin/projects/_shared/components/SettingsPanel/PanelGroup';
import PanelHeading from 'containers/Admin/projects/_shared/components/SettingsPanel/PanelHeading';
import useExpandAll from 'containers/Admin/projects/_shared/components/SettingsPanel/useExpandAll';
import usePhaseEmailCampaigns from 'containers/Admin/projects/project/admin_phase_email_wrapper/usePhaseEmailCampaigns';
import projectMessages from 'containers/Admin/projects/project/messages';
import PhaseParticipationConfig from 'containers/Admin/projects/project/phaseSetup/components/PhaseParticipationConfig';
import ModerationAssignee from 'containers/Admin/projects/project/phaseSetup/components/PhaseParticipationConfig/components/inputs/_shared/ModerationAssignee';
import useAssigneeSummary from 'containers/Admin/projects/project/phaseSetup/components/PhaseParticipationConfig/components/inputs/_shared/useAssigneeSummary';
import configMessages from 'containers/Admin/projects/project/phaseSetup/components/PhaseParticipationConfig/messages';
import { ValidationErrors } from 'containers/Admin/projects/project/phaseSetup/typings';
import { validateParticipation } from 'containers/Admin/projects/project/phaseSetup/validate';

import LanguageChecksContext, {
  useLanguageChecks,
} from 'components/admin/MultilocFields/LanguageChecksContext';
import {
  usePageSave,
  useRegisterPageSaver,
} from 'components/admin/PageSaveContext';
import { usePhasePreviewPublisher } from 'components/admin/PhasePreview/DraftContext';
import postManagerMessages from 'components/admin/PostManager/messages';

import { useIntl } from 'utils/cl-intl';
import { removeSearchParams } from 'utils/cl-router/removeSearchParams';
import { isCLErrorsWrapper } from 'utils/errorUtils';
import { useSearch } from 'utils/router';

import SurveyPlacement from './BuildPanel/SurveyPlacement';
import EditAccessButton from './EditAccessButton';
import messages from './messages';
import styles from './MethodSettings.module.css';
import ParticipantActionsGroup from './ParticipantActionsGroup';
import PhaseNotifications from './PhaseNotifications';
import 'design-system/tokens.css';

const METHODS_WITH_ACTION_ROWS: ParticipationMethod[] = [
  'ideation',
  'proposals',
  'common_ground',
  'voting',
  'native_survey',
  'poll',
  'survey',
];

const ACCESS_ONLY_ACTIONS: Partial<
  Record<ParticipationMethod, AccessOnlyAction[]>
> = {
  information: [
    { action: 'attending_event', label: projectMessages.attendingEventAction },
  ],
  volunteering: [
    { action: 'volunteering', label: configMessages.volunteeringAction2 },
    { action: 'attending_event', label: projectMessages.attendingEventAction },
  ],
  document_annotation: [
    { action: 'annotating_document', label: messages.annotatingDocumentAction },
    { action: 'attending_event', label: projectMessages.attendingEventAction },
  ],
};

const ACCESS_ONLY_SUMMARIES = {
  volunteering: messages.signUpSummary,
  document_annotation: messages.annotateSummary,
} satisfies Partial<
  Record<ParticipationMethod, typeof messages.annotateSummary>
>;

interface Props {
  phase: IPhaseData;
}

const MethodSettings = ({ phase }: Props) => {
  const { formatMessage } = useIntl();
  const pageSave = usePageSave();
  const { setup_action } = useSearch({ strict: false });
  const openedSection = useRef<HTMLDivElement>(null);
  const campaigns = usePhaseEmailCampaigns(phase.id);
  const expandAll = useExpandAll();
  // Only voting shows the assignee card here; the other methods' cards fetch their own.
  const assigneeSummary = useAssigneeSummary(
    phase.attributes.participation_method === 'voting' ? phase.id : undefined
  );

  useEffect(() => {
    if (setup_action) {
      const section =
        setup_action === 'moderation'
          ? document.getElementById('phase-moderation-settings')
          : openedSection.current;
      section?.scrollIntoView({ block: 'nearest' });
    }
  }, [setup_action]);
  const { data: phaseWithRelationships } = usePhase(phase.id);
  const { mutateAsync: updatePhase } = useUpdatePhase();

  const [formData, setFormData] = useState<IUpdatedPhaseProperties>(
    phase.attributes
  );
  const [changes, setChanges] = useState<Partial<IUpdatedPhaseProperties>>({});
  const [errors, setErrors] = useState<CLErrors | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>(
    {}
  );

  const preview = usePhasePreviewPublisher('settings', phase.id);

  const participationMethod = phase.attributes.participation_method;
  const accessOnlyActions = ACCESS_ONLY_ACTIONS[participationMethod];
  const accessOnlySummary =
    participationMethod === 'volunteering' ||
    participationMethod === 'document_annotation'
      ? formatMessage(ACCESS_ONLY_SUMMARIES[participationMethod])
      : undefined;

  const handleChange = (
    config: IUpdatedPhaseProperties,
    changedFields: Partial<IUpdatedPhaseProperties>
  ) => {
    setErrors((errors) =>
      errors
        ? Object.fromEntries(
            Object.entries(errors).filter(
              ([field]) => !(field in changedFields)
            )
          )
        : null
    );
    preview.publish(changedFields);
    setChanges((changes) => ({ ...changes, ...changedFields }));
    setFormData(config);
  };

  const { checks, checkLanguages } = useLanguageChecks();

  const save = async () => {
    const languagesDone = checkLanguages();
    const { isValidated, errors } = validateParticipation(
      formData,
      formatMessage
    );

    setValidationErrors(errors);
    if (!isValidated || !languagesDone) {
      throw new Error('Invalid participation settings');
    }

    try {
      await updatePhase({ phaseId: phase.id, ...changes });
      preview.clear();
      setChanges({});
      setErrors(null);
    } catch (error) {
      if (isCLErrorsWrapper(error)) setErrors(error.errors);
      throw error;
    }
  };

  useRegisterPageSaver('settings', {
    dirty: Object.keys(changes).length > 0,
    save,
  });

  return (
    <LanguageChecksContext.Provider value={checks}>
      <ExpandAllContext.Provider value={expandAll}>
        <div className={styles.panel}>
          {accessOnlyActions ? (
            <>
              <div className={styles.heading}>
                <PanelHeading
                  label={formatMessage(configMessages.settingsGroup)}
                  expandable
                />
              </div>
              <ParticipantActionsGroup
                phaseId={phase.id}
                actions={accessOnlyActions}
                summary={accessOnlySummary}
              />
            </>
          ) : (
            <PhaseParticipationConfig
              phase={phaseWithRelationships}
              formData={formData}
              validationErrors={validationErrors}
              apiErrors={errors}
              onChange={handleChange}
              setValidationErrors={setValidationErrors}
              hideMethodPicker
              layout="panel"
              surveyPlacement={
                <SurveyPlacement
                  phase={phase}
                  hasUnsavedChanges={!!pageSave?.dirty}
                  onMoved={(updated) => setFormData(updated.attributes)}
                />
              }
            />
          )}

          <EditAccessButton
            phaseId={phase.id}
            initialOpened={setup_action === 'access'}
            showButton={
              !accessOnlyActions &&
              !METHODS_WITH_ACTION_ROWS.includes(participationMethod)
            }
            onClose={() => {
              if (setup_action === 'access') {
                removeSearchParams(['setup_action']);
              }
            }}
          />

          <div
            ref={setup_action === 'notifications' ? openedSection : undefined}
          >
            <PanelGroup
              label={formatMessage(messages.participantCommunications)}
              defaultOpen={setup_action === 'notifications'}
              summary={
                campaigns.loading
                  ? undefined
                  : formatMessage(messages.notificationsOnSummary, {
                      count: campaigns.campaigns.filter(
                        ({ attributes }) => attributes.enabled
                      ).length,
                    })
              }
              onClose={() => {
                if (setup_action === 'notifications') {
                  removeSearchParams(['setup_action']);
                }
              }}
            >
              <PhaseNotifications phase={phase} />
            </PanelGroup>
          </div>

          {participationMethod === 'voting' && (
            <div id="phase-moderation-settings">
              <PanelGroup
                label={formatMessage(postManagerMessages.assignee)}
                defaultOpen={setup_action === 'moderation'}
                summary={assigneeSummary}
              >
                <ModerationAssignee phaseId={phase.id} />
              </PanelGroup>
            </div>
          )}
        </div>
      </ExpandAllContext.Provider>
    </LanguageChecksContext.Provider>
  );
};

export default MethodSettings;
