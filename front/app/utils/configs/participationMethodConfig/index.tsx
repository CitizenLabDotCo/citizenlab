import React, { ReactNode } from 'react';

// intl
import { FormattedMessage } from '../../cl-intl';
import messages from '../../messages';

// services
import { ParticipationMethod, getInputTerm } from 'utils/participationContexts';
import { getCurrentParticipationContext } from 'api/phases/utils';
import { IProjectData } from 'api/projects/types';
import { IPhaseData } from 'api/phases/types';

// components
import SharingModalContent from 'components/PostShowComponents/SharingModalContent';
import { IdeationCTABar } from 'components/ParticipationCTABars/IdeationCTABar';
import { NativeSurveyCTABar } from 'components/ParticipationCTABars/NativeSurveyCTABar';
import { EmbeddedSurveyCTABar } from 'components/ParticipationCTABars/EmbeddedSurveyCTABar';
import { VotingCTABar } from 'components/ParticipationCTABars/VotingCTABar';
import { VolunteeringCTABar } from 'components/ParticipationCTABars/VolunteeringCTABar';
import { PollCTABar } from 'components/ParticipationCTABars/PollCTABar';
import { DocumentAnnotationCTABar } from 'components/ParticipationCTABars/DocumentAnnotationCTABar';

import { CTABarProps } from 'components/ParticipationCTABars/utils';

// utils
import { isNilOrError, NilOrError } from '../../helperUtils';
import clHistory from 'utils/cl-router/history';
import { IIdea } from 'api/ideas/types';
import { EventsCTABar } from 'components/ParticipationCTABars/EventsCTABar';

export const defaultSortingOptions = [
  { text: <FormattedMessage {...messages.trending} />, value: 'trending' },
  { text: <FormattedMessage {...messages.random} />, value: 'random' },
  { text: <FormattedMessage {...messages.mostReacted} />, value: 'popular' },
  { text: <FormattedMessage {...messages.newest} />, value: 'new' },
  { text: <FormattedMessage {...messages.oldest} />, value: '-new' },
];

type FormSubmissionMethodProps = {
  project?: IProjectData;
  ideaId?: string;
  idea?: IIdea;
  phaseId?: string;
};

type ModalContentMethodProps = {
  ideaIdForSocialSharing?: string;
  title?: string;
  subtitle?: string;
};

type FormTitleMethodProps = {
  project: IProjectData;
  phases: IPhaseData[] | undefined;
  phaseFromUrl?: IPhaseData | NilOrError;
};

type PostSortingOptionType = { text: JSX.Element; value: string };

/* 
Configuration Description
---------------------------------
formEditor: We currently have 2 UIs for admins to edit the form definition. This defines which UI, if any, the method uses.
onFormSubmission: Called after input form submission.
getFormTitle?:  Gets the title of the input form
getModalContent: Returns modal content to be displayed on project page.
getMethodPickerMessage: Returns the message to be displayed in the admin participation method picker.
showInputManager: Returns whether the input manager should be shown in the admin view.
isMethodLocked: Returns whether a method can be selected in the participation method picker.
postType: Returns the type of input that is being posted.
renderCTABar: Returns whether the CTA bar should be rendered.
postSortingOptions?: Returns the sorting options for posts.
showInputCount: Returns the input count to be used on project cards.
useProjectClosedCTABarStyle?: Used to determine if the CTA bar should display "closed" styling.
*/

export type ParticipationMethodConfig = {
  /** When adding a new property, please add a description in the above comment */
  formEditor: 'simpleFormEditor' | 'surveyEditor' | null;
  onFormSubmission: (props: FormSubmissionMethodProps) => void;
  getModalContent: (
    props: ModalContentMethodProps
  ) => ReactNode | JSX.Element | null;
  getFormTitle?: (props: FormTitleMethodProps) => React.ReactNode;
  getMethodPickerMessage: () => ReactNode | JSX.Element | null;
  showInputManager: boolean;
  isMethodLocked: boolean;
  postType: 'defaultInput' | 'nativeSurvey';
  renderCTABar: (props: CTABarProps) => ReactNode | JSX.Element | null;
  postSortingOptions?: PostSortingOptionType[];
  showInputCount: boolean;
  hideAuthorOnIdeas?: boolean; // Hides the author on the idea pages/cards
  showIdeaFilters?: boolean; // Shows filters on the idea list
  useProjectClosedCTABarStyle?: (
    participationContext: IPhaseData | IProjectData
  ) => boolean;
};

const ideationConfig: ParticipationMethodConfig = {
  showInputCount: true,
  showIdeaFilters: true,
  formEditor: 'simpleFormEditor',
  getMethodPickerMessage: () => {
    return <FormattedMessage {...messages.inputAndFeedback} />;
  },
  onFormSubmission: (props: FormSubmissionMethodProps) => {
    if (props.ideaId && props.idea) {
      const urlParameters = `?new_idea_id=${props.ideaId}`;
      if (props.idea) {
        clHistory.push({
          pathname: `/ideas/${props.idea.data.attributes.slug}`,
          search: urlParameters.concat(
            props.phaseId ? `&phase_id=${props.phaseId}` : ''
          ),
        });
      }
    }
  },
  postType: 'defaultInput',
  getModalContent: (props: ModalContentMethodProps) => {
    if (props.ideaIdForSocialSharing && props.title && props.subtitle) {
      return (
        <SharingModalContent
          postType="idea"
          postId={props.ideaIdForSocialSharing}
          title={props.title}
          subtitle={props.subtitle}
        />
      );
    }
    return null;
  },
  getFormTitle: (props: FormTitleMethodProps) => {
    return (
      <FormattedMessage
        {...{
          idea: messages.ideaFormTitle,
          option: messages.optionFormTitle,
          project: messages.projectFormTitle,
          question: messages.questionFormTitle,
          issue: messages.issueFormTitle,
          contribution: messages.contributionFormTitle,
        }[
          getInputTerm(
            props.project?.attributes.process_type,
            props.project,
            props.phases,
            props.phaseFromUrl
          )
        ]}
      />
    );
  },
  showInputManager: true,
  isMethodLocked: false,
  renderCTABar: (props: CTABarProps) => {
    return <IdeationCTABar project={props.project} phases={props.phases} />;
  },
  postSortingOptions: defaultSortingOptions,
  hideAuthorOnIdeas: false,
  useProjectClosedCTABarStyle: (participationContext) => {
    const { commenting_enabled, reacting_enabled, posting_enabled } =
      participationContext.attributes;

    return !commenting_enabled && !reacting_enabled && !posting_enabled;
  },
};

const nativeSurveyConfig: ParticipationMethodConfig = {
  showInputCount: true,
  formEditor: 'surveyEditor',
  getMethodPickerMessage: () => {
    return <FormattedMessage {...messages.createNativeSurvey} />;
  },
  onFormSubmission: (props: FormSubmissionMethodProps) => {
    if (props.project) {
      clHistory.push({
        pathname: `/projects/${props.project?.attributes.slug}`,
        search: `?show_modal=true`.concat(
          props.phaseId ? `&phase_id=${props.phaseId}` : ''
        ),
      });
    }
  },
  postType: 'nativeSurvey',
  getModalContent: (props: ModalContentMethodProps) => {
    return (
      <FormattedMessage
        {...messages.onSurveySubmission}
        {...props}
        data-cy="e2e-survey-success-message"
      />
    );
  },
  getFormTitle: (props: FormTitleMethodProps) => {
    return <FormattedMessage {...messages.surveyTitle} {...props} />;
  },
  showInputManager: false,
  isMethodLocked: true,
  renderCTABar: (props: CTABarProps) => {
    return <NativeSurveyCTABar project={props.project} phases={props.phases} />;
  },
  useProjectClosedCTABarStyle: (participationContext) => {
    if (!participationContext.attributes.posting_enabled) {
      return true;
    }
    return false;
  },
};

const informationConfig: ParticipationMethodConfig = {
  showInputCount: false,
  formEditor: null,
  getMethodPickerMessage: () => {
    return <FormattedMessage {...messages.shareInformation} />;
  },
  getModalContent: () => {
    return null;
  },
  onFormSubmission: () => {
    return;
  },
  postType: 'defaultInput',
  showInputManager: false,
  isMethodLocked: false,
  renderCTABar: (props: CTABarProps) => {
    return <EventsCTABar project={props.project} phases={props.phases} />;
  },
};

const surveyConfig: ParticipationMethodConfig = {
  showInputCount: false,
  formEditor: null,
  getMethodPickerMessage: () => {
    return <FormattedMessage {...messages.createSurveyText} />;
  },
  getModalContent: () => {
    return null;
  },
  onFormSubmission: () => {
    return;
  },
  postType: 'defaultInput',
  showInputManager: false,
  isMethodLocked: false,
  renderCTABar: (props: CTABarProps) => {
    return (
      <EmbeddedSurveyCTABar project={props.project} phases={props.phases} />
    );
  },
};

const documentAnnotationConfig: ParticipationMethodConfig = {
  showInputCount: false,
  formEditor: null,
  getMethodPickerMessage: () => {
    return <FormattedMessage {...messages.createDocumentAnnotation} />;
  },
  getModalContent: () => {
    return null;
  },
  onFormSubmission: () => {
    return;
  },
  postType: 'defaultInput',
  showInputManager: false,
  isMethodLocked: false,
  renderCTABar: (props: CTABarProps) => {
    return (
      <DocumentAnnotationCTABar project={props.project} phases={props.phases} />
    );
  },
};

const votingConfig: ParticipationMethodConfig = {
  showInputCount: false,
  formEditor: 'simpleFormEditor',
  showIdeaFilters: false,
  getMethodPickerMessage: () => {
    return <FormattedMessage {...messages.conductParticipatoryBudgetingText} />;
  },
  getModalContent: () => {
    return null;
  },
  postType: 'defaultInput',
  onFormSubmission: (props: FormSubmissionMethodProps) => {
    if (props.ideaId && props.idea) {
      const urlParameters = `?new_idea_id=${props.ideaId}`;
      if (props.idea) {
        clHistory.push({
          pathname: `/ideas/${props.idea.data.attributes.slug}`,
          search: urlParameters.concat(
            props.phaseId ? `&phase_id=${props.phaseId}` : ''
          ),
        });
      }
    }
  },
  getFormTitle: (props: FormTitleMethodProps) => {
    return (
      <FormattedMessage
        {...{
          idea: messages.ideaFormTitle,
          option: messages.optionFormTitle,
          project: messages.projectFormTitle,
          question: messages.questionFormTitle,
          issue: messages.issueFormTitle,
          contribution: messages.contributionFormTitle,
        }[
          getInputTerm(
            props.project?.attributes.process_type,
            props.project,
            props.phases,
            props.phaseFromUrl
          )
        ]}
      />
    );
  },
  showInputManager: true,
  isMethodLocked: false,
  renderCTABar: (props: CTABarProps) => {
    return <VotingCTABar project={props.project} phases={props.phases} />;
  },
  postSortingOptions: defaultSortingOptions.filter(
    (option) => option.value !== 'trending' && option.value !== 'popular'
  ),
  hideAuthorOnIdeas: true,
};

const pollConfig: ParticipationMethodConfig = {
  showInputCount: false,
  formEditor: null,
  getMethodPickerMessage: () => {
    return <FormattedMessage {...messages.createPoll} />;
  },
  getModalContent: () => {
    return null;
  },
  onFormSubmission: () => {
    return;
  },
  postType: 'defaultInput',
  showInputManager: false,
  isMethodLocked: false,
  renderCTABar: (props: CTABarProps) => {
    return <PollCTABar project={props.project} phases={props.phases} />;
  },
};

const volunteeringConfig: ParticipationMethodConfig = {
  showInputCount: false,
  formEditor: null,
  getMethodPickerMessage: () => {
    return <FormattedMessage {...messages.findVolunteers} />;
  },
  getModalContent: () => {
    return null;
  },
  onFormSubmission: () => {
    return;
  },
  postType: 'defaultInput',
  showInputManager: false,
  isMethodLocked: false,
  renderCTABar: (props: CTABarProps) => {
    return <VolunteeringCTABar project={props.project} phases={props.phases} />;
  },
};

const methodToConfig: {
  [method in ParticipationMethod]: ParticipationMethodConfig;
} = {
  ideation: ideationConfig,
  native_survey: nativeSurveyConfig,
  information: informationConfig,
  survey: surveyConfig,
  voting: votingConfig,
  poll: pollConfig,
  volunteering: volunteeringConfig,
  document_annotation: documentAnnotationConfig,
};

/** Get the configuration object for the given participation method
 */
export function getMethodConfig(
  participationMethod: ParticipationMethod
): ParticipationMethodConfig {
  return methodToConfig[participationMethod];
}

/** Given the project and its phases, returns an array of all participation methods
 * used in the project
 */
export function getAllParticipationMethods(
  project: IProjectData,
  phases: IPhaseData[] | null
): ParticipationMethod[] {
  const { process_type, participation_method } = project.attributes;
  if (process_type === 'continuous') {
    return [participation_method];
  } else if (process_type === 'timeline' && !phases) {
    return [];
  } else if (process_type === 'timeline' && phases) {
    return phases.map((phase) => phase.attributes.participation_method);
  } else {
    throw `Unknown process_type ${project.attributes.process_type}`;
  }
}

/** Given the project and its phases, it returns the participation method
 * used in the project, or current phase if phases are provided and phaseId is not provided.
 * If the phaseId is provided, then it returns the participation method of the phase whose
 * phaseId is the same as the provided phaseId
 */
export const getParticipationMethod = (
  project: IProjectData | null | undefined,
  phases: IPhaseData[] | undefined,
  phaseId?: string
): ParticipationMethod | undefined => {
  if (!project) return;

  const phaseFromId = phases?.find((phase) => phase.id === phaseId);
  const participationContext =
    phaseFromId ?? getCurrentParticipationContext(project, phases);
  return participationContext?.attributes.participation_method;
};

/** Returns the phase for a given phaseID */
export function getPhase(
  phaseId: string,
  phases: IPhaseData[]
): IPhaseData | undefined {
  return phases.filter((phase) => phase.id === phaseId)[0];
}

/** Given a project and its (optional) phases, returns whether the InputManager
 *  should be shown in the back office.
 */
export function showInputManager(
  project: IProjectData,
  phases?: Error | IPhaseData[] | null | undefined
): boolean {
  if (project.attributes.process_type === 'continuous') {
    return getMethodConfig(project.attributes.participation_method)
      .showInputManager;
  }
  if (project.attributes.process_type === 'timeline') {
    if (!isNilOrError(phases)) {
      if (
        phases.some(
          (phase) =>
            getMethodConfig(phase.attributes.participation_method)
              .showInputManager
        )
      ) {
        return true;
      }
    }
  }
  return false;
}
