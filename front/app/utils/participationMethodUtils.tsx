import React, { ReactNode } from 'react';

// intl
import { FormattedMessage } from './cl-intl';
import messages from './messages';

// services
import {
  ParticipationMethod,
  getInputTerm,
} from 'services/participationContexts';
import { getCurrentPhase, IPhaseData } from 'services/phases';
import { IProjectData } from 'services/projects';

// components
import SharingModalContent from 'components/PostShowComponents/SharingModalContent';
import { IdeationCTABar } from 'components/ParticipationCTABars/IdeationCTABar';
import { NativeSurveyCTABar } from 'components/ParticipationCTABars/NativeSurveyCTABar';
import { EmbeddedSurveyCTABar } from 'components/ParticipationCTABars/EmbeddedSurveyCTABar';
import { BudgetingCTABar } from 'components/ParticipationCTABars/BudgetingCTABar';
import { VolunteeringCTABar } from 'components/ParticipationCTABars/VolunteeringCTABar';
import { PollCTABar } from 'components/ParticipationCTABars/PollCTABar';

import { CTABarProps } from 'components/ParticipationCTABars/utils';

// utils
import { isNilOrError } from './helperUtils';
import clHistory from 'utils/cl-router/history';
import { IIdea } from 'api/ideas/types';

export const defaultSortingOptions = [
  { text: <FormattedMessage {...messages.trending} />, value: 'trending' },
  { text: <FormattedMessage {...messages.random} />, value: 'random' },
  { text: <FormattedMessage {...messages.mostVoted} />, value: 'popular' },
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
  phases: [IPhaseData];
  phaseFromUrl?: IPhaseData;
};

type PostSortingOptionType = { text: JSX.Element; value: string };

export type ParticipationMethodConfig = {
  /** We currently have 2 UIs for admins to edit the form definition. This
   * defines which UI, if any, the method uses */
  formEditor: 'simpleFormEditor' | 'surveyEditor' | null;
  onFormSubmission: (props: FormSubmissionMethodProps) => void;
  getModalContent: (
    props: ModalContentMethodProps
  ) => ReactNode | JSX.Element | null;
  getFormTitle?: (props: FormTitleMethodProps) => void;
  getMethodPickerMessage: () => ReactNode | JSX.Element | null;
  showInputManager: boolean;
  isMethodLocked: boolean;
  postType: 'defaultInput' | 'nativeSurvey';
  renderCTABar: (props: CTABarProps) => ReactNode | JSX.Element | null;
  postSortingOptions?: PostSortingOptionType[];
};

const ideationConfig: ParticipationMethodConfig = {
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
};

const nativeSurveyConfig: ParticipationMethodConfig = {
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
};

const informationConfig: ParticipationMethodConfig = {
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
  renderCTABar: () => {
    return null;
  },
};

const surveyConfig: ParticipationMethodConfig = {
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

const budgetingConfig: ParticipationMethodConfig = {
  formEditor: 'simpleFormEditor',
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
    return <BudgetingCTABar project={props.project} phases={props.phases} />;
  },
  postSortingOptions: defaultSortingOptions.filter(
    (option) => option.value !== 'trending' && option.value !== 'popular'
  ),
};

const pollConfig: ParticipationMethodConfig = {
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
  budgeting: budgetingConfig,
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
  phases: Error | IPhaseData[] | null | undefined | null,
  phaseId?: string
): ParticipationMethod | undefined => {
  if (isNilOrError(project)) {
    return undefined;
  }
  const { process_type, participation_method: projectParticipationMethod } =
    project.attributes;

  if (process_type === 'continuous') {
    return projectParticipationMethod;
  } else if (process_type === 'timeline') {
    const phase =
      (!isNilOrError(phases) ? phases : []).find(
        (phase) => phase.id === phaseId
      ) || getCurrentPhase(phases);
    return phase?.attributes.participation_method;
  }
  throw `Unknown process_type ${project.attributes.process_type}`;
};

/** Returns the phase for a given phaseID */
export function getPhase(
  phaseId: string,
  phases: IPhaseData[]
): IPhaseData | null {
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
