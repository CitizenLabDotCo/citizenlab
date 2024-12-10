import React, { ReactNode } from 'react';

import { IIdea } from 'api/ideas/types';
import { IPhaseData, ParticipationMethod } from 'api/phases/types';
import { getCurrentPhase, getInputTerm } from 'api/phases/utils';
import { IProjectData } from 'api/projects/types';

import SharingModalContent from 'components/PostShowComponents/SharingModalContent';

import clHistory from 'utils/cl-router/history';

import { FormattedMessage } from '../../cl-intl';
import { isNilOrError, NilOrError } from '../../helperUtils';
import messages from '../../messages';

export const defaultSortingOptions = [
  { text: <FormattedMessage {...messages.trending} />, value: 'trending' },
  {
    text: <FormattedMessage {...messages.mostDiscussed} />,
    value: 'comments_count',
  },
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
showInputManager: Returns whether the input manager should be shown in the admin view.
postType: Returns the type of input that is being posted.
postSortingOptions?: Returns the sorting options for posts.
showInputCount: Returns the input count to be used on project cards.
inputsPageSize?: Returns the page size the ideas endpoint should use.
*/

type ParticipationMethodConfig = {
  /** When adding a new property, please add a description in the above comment */
  formEditor: 'simpleFormEditor' | 'surveyEditor' | null;
  onFormSubmission: (props: FormSubmissionMethodProps) => void;
  getModalContent: (
    props: ModalContentMethodProps
  ) => ReactNode | JSX.Element | null;
  getFormTitle?: (props: FormTitleMethodProps) => React.ReactNode;
  showInputManager: boolean;
  inputManagerName?: string;
  postType: 'defaultInput' | 'nativeSurvey';
  postSortingOptions?: PostSortingOptionType[];
  showInputCount: boolean;
  hideAuthorOnIdeas?: boolean; // Hides the author on the idea pages/cards
  showIdeaFilters?: boolean; // Shows filters on the idea list
  inputsPageSize?: number;
  /** Does this method support the reactions (likes, maybe dislikes) mechanism? */
  supportsReactions: boolean;
  /** Does this method support the voting mechanism? */
  supportsVotes: boolean;
  /** Does this method support commenting? */
  supportsComments: boolean;
  /** Does this method support having the topic field in its form? */
  supportsTopicsCustomField: boolean;
};

const ideationConfig: ParticipationMethodConfig = {
  showInputCount: true,
  showIdeaFilters: true,
  formEditor: 'simpleFormEditor',
  inputsPageSize: 24,
  supportsReactions: true,
  supportsVotes: true,
  supportsComments: true,
  supportsTopicsCustomField: true,
  onFormSubmission: (props: FormSubmissionMethodProps) => {
    if (props.ideaId && props.idea) {
      const urlParameters = `?new_idea_id=${props.ideaId}`;
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
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
          issue: messages.issueFormTitle1,
          contribution: messages.contributionFormTitle,
          proposal: messages.proposalFormTitle,
          petition: messages.petitionFormTitle,
          initiative: messages.initiativeFormTitle,
        }[getInputTerm(props.phases, props.phaseFromUrl)]}
      />
    );
  },
  showInputManager: true,
  inputManagerName: 'ideas',
  postSortingOptions: defaultSortingOptions,
  hideAuthorOnIdeas: false,
};

const proposalsConfig: ParticipationMethodConfig = {
  showInputCount: true,
  showIdeaFilters: true,
  formEditor: 'simpleFormEditor',
  inputsPageSize: 24,
  supportsReactions: true,
  supportsVotes: false,
  supportsComments: true,
  supportsTopicsCustomField: true,
  onFormSubmission: (props: FormSubmissionMethodProps) => {
    if (props.ideaId && props.idea) {
      const urlParameters = `?new_idea_id=${props.ideaId}`;
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
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
          issue: messages.issueFormTitle1,
          contribution: messages.contributionFormTitle,
          proposal: messages.proposalFormTitle,
          petition: messages.petitionFormTitle,
          initiative: messages.initiativeFormTitle,
        }[getInputTerm(props.phases, props.phaseFromUrl)]}
      />
    );
  },
  showInputManager: true,
  inputManagerName: 'proposals',
  postSortingOptions: defaultSortingOptions,
  hideAuthorOnIdeas: false,
};

const nativeSurveyConfig: ParticipationMethodConfig = {
  showInputCount: true,
  formEditor: 'surveyEditor',
  onFormSubmission: (props: FormSubmissionMethodProps) => {
    if (props.project) {
      clHistory.push({
        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
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
  showInputManager: false,
  supportsReactions: false,
  supportsVotes: false,
  supportsComments: false,
  supportsTopicsCustomField: false,
};

const informationConfig: ParticipationMethodConfig = {
  showInputCount: false,
  formEditor: null,
  getModalContent: () => {
    return null;
  },
  onFormSubmission: () => {
    return;
  },
  postType: 'defaultInput',
  showInputManager: false,
  supportsReactions: false,
  supportsVotes: false,
  supportsComments: false,
  supportsTopicsCustomField: false,
};

const surveyConfig: ParticipationMethodConfig = {
  showInputCount: false,
  formEditor: null,
  getModalContent: () => {
    return null;
  },
  onFormSubmission: () => {
    return;
  },
  postType: 'defaultInput',
  showInputManager: false,
  supportsReactions: false,
  supportsVotes: false,
  supportsComments: false,
  supportsTopicsCustomField: false,
};

const documentAnnotationConfig: ParticipationMethodConfig = {
  showInputCount: false,
  formEditor: null,
  getModalContent: () => {
    return null;
  },
  onFormSubmission: () => {
    return;
  },
  postType: 'defaultInput',
  showInputManager: false,
  supportsReactions: false,
  supportsVotes: false,
  supportsComments: false,
  supportsTopicsCustomField: false,
};

const votingConfig: ParticipationMethodConfig = {
  showInputCount: false,
  formEditor: 'simpleFormEditor',
  showIdeaFilters: false,
  inputsPageSize: 100,
  supportsReactions: false,
  supportsVotes: true,
  supportsComments: true,
  getModalContent: () => {
    return null;
  },
  postType: 'defaultInput',
  onFormSubmission: (props: FormSubmissionMethodProps) => {
    if (props.ideaId && props.idea) {
      const urlParameters = `?new_idea_id=${props.ideaId}`;
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
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
          issue: messages.issueFormTitle1,
          contribution: messages.contributionFormTitle,
        }[getInputTerm(props.phases, props.phaseFromUrl)]}
      />
    );
  },
  showInputManager: true,
  inputManagerName: 'ideas',
  postSortingOptions: defaultSortingOptions.filter(
    (option) => option.value !== 'trending' && option.value !== 'popular'
  ),
  hideAuthorOnIdeas: true,
  supportsTopicsCustomField: true,
};

const pollConfig: ParticipationMethodConfig = {
  showInputCount: false,
  formEditor: null,
  getModalContent: () => {
    return null;
  },
  onFormSubmission: () => {
    return;
  },
  postType: 'defaultInput',
  showInputManager: false,
  supportsReactions: false,
  supportsVotes: false,
  supportsComments: false,
  supportsTopicsCustomField: false,
};

const volunteeringConfig: ParticipationMethodConfig = {
  showInputCount: false,
  formEditor: null,
  getModalContent: () => {
    return null;
  },
  onFormSubmission: () => {
    return;
  },
  postType: 'defaultInput',
  showInputManager: false,
  supportsReactions: false,
  supportsVotes: false,
  supportsComments: false,
  supportsTopicsCustomField: false,
};

const methodToConfig: {
  [method in ParticipationMethod]: ParticipationMethodConfig;
} = {
  ideation: ideationConfig,
  proposals: proposalsConfig,
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

/** Given the project and its phases, it returns the participation method
 * used in the project, or current phase if phases are provided and phaseId is not provided.
 * If the phaseId is provided, then it returns the participation method of the phase whose
 * phaseId is the same as the provided phaseId.
 * Returns undefined when there is no currently active phase.
 */
export const getParticipationMethod = (
  project: IProjectData | null | undefined,
  phases: IPhaseData[] | undefined,
  phaseId?: string
): ParticipationMethod | undefined => {
  if (!project) return;

  const phaseFromId = phases?.find((phase) => phase.id === phaseId);
  const participationContext = phaseFromId ?? getCurrentPhase(phases);
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
  phases?: Error | IPhaseData[] | null | undefined
): boolean {
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
  return false;
}
