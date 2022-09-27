import React from 'react';
import { ParticipationMethod } from 'services/participationContexts';
import { IPhaseData } from 'services/phases';
import { IProjectData } from 'services/projects';
import clHistory from 'utils/cl-router/history';
import { FormattedMessage } from './cl-intl';
import messages from './participationMethodUtilsMessages';

type ParticipationMethodConfig = {
  /** We currently have 2 UIs for admins to edit the form definition. This
   * defines which UI, if any, the method uses */
  formEditor: 'simpleFormEditor' | 'surveyEditor' | null;
  onFormSubmission?: any;
  getModalContent: any;
};

const ideationConfig: ParticipationMethodConfig = {
  formEditor: 'simpleFormEditor',
  onFormSubmission: (_project, _ideaId, _idea) => {
    clHistory.push({
      pathname: `/ideas/${_idea.data.attributes.slug}`,
      search: `?new_idea_id=${_ideaId}`,
    });
  },
  getModalContent: () => {
    return null;
  },
};

const nativeSurveyConfig: ParticipationMethodConfig = {
  formEditor: 'surveyEditor',
  onFormSubmission: (_project, _ideaId, _idea) => {
    clHistory.push({
      pathname: `/projects/${_project?.attributes.slug}`,
      search: `?show_modal=true`,
    });
  },
  getModalContent: () => {
    return <FormattedMessage {...messages.onSurveySubmission} />;
  },
};

const informationConfig: ParticipationMethodConfig = {
  formEditor: null,
  getModalContent: () => {
    return null;
  },
};

const surveyConfig: ParticipationMethodConfig = {
  formEditor: null,
  getModalContent: () => {
    return null;
  },
};

const budgetingConfig: ParticipationMethodConfig = {
  formEditor: 'simpleFormEditor',
  getModalContent: () => {
    return null;
  },
};

const pollConfig: ParticipationMethodConfig = {
  formEditor: null,
  getModalContent: () => {
    return null;
  },
};

const volunteeringConfig: ParticipationMethodConfig = {
  formEditor: null,
  getModalContent: () => {
    return null;
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
