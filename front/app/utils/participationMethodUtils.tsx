import React, { ReactNode } from 'react';

// intl
import { FormattedMessage } from './cl-intl';
import messages from './participationMethodUtilsMessages';

// services
import {
  ParticipationMethod,
  getInputTerm,
} from 'services/participationContexts';
import { IPhaseData } from 'services/phases';
import { IProjectData } from 'services/projects';

// components
import SharingModalContent from 'components/PostShowComponents/SharingModalContent';

// utils
import { isNilOrError } from './helperUtils';
import clHistory from 'utils/cl-router/history';
import { IIdea } from 'services/ideas';

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

type ParticipationMethodConfig = {
  /** We currently have 2 UIs for admins to edit the form definition. This
   * defines which UI, if any, the method uses */
  formEditor: 'simpleFormEditor' | 'surveyEditor' | null;
  onFormSubmission: (props: FormSubmissionMethodProps) => void;
  getModalContent: (
    props: ModalContentMethodProps
  ) => ReactNode | JSX.Element | null;
  getFormTitle?: (props: FormTitleMethodProps) => void;
  showInputManager: boolean;
};

const ideationConfig: ParticipationMethodConfig = {
  formEditor: 'simpleFormEditor',
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
};

const nativeSurveyConfig: ParticipationMethodConfig = {
  formEditor: 'surveyEditor',
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
  getModalContent: (props: ModalContentMethodProps) => {
    return (
      <FormattedMessage
        {...messages.onSurveySubmission}
        {...props}
        data-cy="survey-success-message"
      />
    );
  },
  getFormTitle: (props: FormTitleMethodProps) => {
    return <FormattedMessage {...messages.surveyTitle} {...props} />;
  },
  showInputManager: false,
};

const informationConfig: ParticipationMethodConfig = {
  formEditor: null,
  getModalContent: () => {
    return null;
  },
  onFormSubmission: () => {
    return;
  },
  showInputManager: false,
};

const surveyConfig: ParticipationMethodConfig = {
  formEditor: null,
  getModalContent: () => {
    return null;
  },
  onFormSubmission: () => {
    return;
  },
  showInputManager: false,
};

const budgetingConfig: ParticipationMethodConfig = {
  formEditor: 'simpleFormEditor',
  getModalContent: () => {
    return null;
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
};

const pollConfig: ParticipationMethodConfig = {
  formEditor: null,
  getModalContent: () => {
    return null;
  },
  onFormSubmission: () => {
    return;
  },
  showInputManager: false,
};

const volunteeringConfig: ParticipationMethodConfig = {
  formEditor: null,
  getModalContent: () => {
    return null;
  },
  onFormSubmission: () => {
    return;
  },
  showInputManager: false,
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
