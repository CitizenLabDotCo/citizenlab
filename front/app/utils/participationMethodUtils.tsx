import React from 'react';
import {
  getInputTerm,
  ParticipationMethod,
} from 'services/participationContexts';
import { IPhaseData } from 'services/phases';
import { IProjectData } from 'services/projects';
import { FormattedMessage } from 'utils/cl-intl';
import messages from './participationMethodUtilsMessages';

type ParticipationMethodConfig = {
  /** We currently have 2 UIs for admins to edit the form definition. This
   * defines which UI, if any, the method uses */
  formEditor: 'simpleFormEditor' | 'surveyEditor' | null;
  getFormTitle?: any;
};

const ideationConfig: ParticipationMethodConfig = {
  formEditor: 'simpleFormEditor',
  getFormTitle: (project, phases) => {
    return (
      <FormattedMessage
        {...{
          idea: messages.ideaFormTitle,
          option: messages.optionFormTitle,
          project: messages.projectFormTitle,
          question: messages.questionFormTitle,
          issue: messages.issueFormTitle,
          contribution: messages.contributionFormTitle,
        }[getInputTerm(project?.attributes.process_type, project, phases)]}
      />
    );
  },
};

const nativeSurveyConfig: ParticipationMethodConfig = {
  formEditor: 'surveyEditor',
  getFormTitle: (_project, _phases) => {
    return <FormattedMessage {...messages.surveyTitle} />;
  },
};

const informationConfig: ParticipationMethodConfig = {
  formEditor: null,
};

const surveyConfig: ParticipationMethodConfig = {
  formEditor: null,
};

const budgetingConfig: ParticipationMethodConfig = {
  formEditor: 'simpleFormEditor',
};

const pollConfig: ParticipationMethodConfig = {
  formEditor: null,
};

const volunteeringConfig: ParticipationMethodConfig = {
  formEditor: null,
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
