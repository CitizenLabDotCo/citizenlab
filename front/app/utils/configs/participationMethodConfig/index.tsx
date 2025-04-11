import React, { ReactNode } from 'react';

import { IPhaseData, ParticipationMethod } from 'api/phases/types';
import { getCurrentPhase, getInputTerm } from 'api/phases/utils';
import { IProjectData } from 'api/projects/types';

import DocumentAnnotationCTABar from 'components/ParticipationCTABars/DocumentAnnotationCTABar';
import EmbeddedSurveyCTABar from 'components/ParticipationCTABars/EmbeddedSurveyCTABar';
import EventsCTABar from 'components/ParticipationCTABars/EventsCTABar';
import IdeationCTABar from 'components/ParticipationCTABars/IdeationCTABar';
import NativeSurveyCTABar from 'components/ParticipationCTABars/NativeSurveyCTABar';
import PollCTABar from 'components/ParticipationCTABars/PollCTABar';
import { CTABarProps } from 'components/ParticipationCTABars/utils';
import VolunteeringCTABar from 'components/ParticipationCTABars/VolunteeringCTABar';
import VotingCTABar from 'components/ParticipationCTABars/VotingCTABar';
import SharingModalContent from 'components/PostShowComponents/SharingModalContent';

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

type ModalContentMethodProps = {
  ideaId?: string;
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
getFormTitle?:  Gets the title of the input form
getModalContent: Returns modal content to be displayed on project page.
showInputManager: Returns whether the input manager should be shown in the admin view.
postType: Returns the type of input that is being posted.
renderCTABar: Returns whether the CTA bar should be rendered.
postSortingOptions?: Returns the sorting options for posts.
showInputCount: Returns the input count to be used on project cards.
inputsPageSize?: Returns the page size the ideas endpoint should use.
*/

export type ParticipationMethodConfig = {
  /** When adding a new property, please add a description in the above comment */
  formEditor: 'simpleFormEditor' | 'surveyEditor' | null;
  getModalContent:
    | null
    | ((props: ModalContentMethodProps) => ReactNode | JSX.Element | null);
  getFormTitle?: (props: FormTitleMethodProps) => React.ReactNode;
  showInputManager: boolean;
  inputManagerName?: string;
  postType: 'defaultInput' | 'nativeSurvey';
  renderCTABar: (props: CTABarProps) => ReactNode | JSX.Element | null;
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
  postType: 'defaultInput',
  getModalContent: (props: ModalContentMethodProps) => {
    if (props.ideaId && props.title && props.subtitle) {
      return (
        <SharingModalContent
          postId={props.ideaId}
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
  renderCTABar: (props: CTABarProps) => {
    return <IdeationCTABar project={props.project} phases={props.phases} />;
  },
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
  postType: 'defaultInput',
  getModalContent: (props: ModalContentMethodProps) => {
    if (props.ideaId && props.title && props.subtitle) {
      return (
        <SharingModalContent
          postId={props.ideaId}
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
  renderCTABar: (props: CTABarProps) => {
    return <IdeationCTABar project={props.project} phases={props.phases} />;
  },
  postSortingOptions: defaultSortingOptions,
  hideAuthorOnIdeas: false,
};

const nativeSurveyConfig: ParticipationMethodConfig = {
  showInputCount: true,
  formEditor: 'surveyEditor',
  postType: 'nativeSurvey',
  getModalContent: null,
  showInputManager: false,
  renderCTABar: (props: CTABarProps) => {
    return <NativeSurveyCTABar project={props.project} phases={props.phases} />;
  },
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

  postType: 'defaultInput',
  showInputManager: false,
  renderCTABar: (props: CTABarProps) => (
    <EventsCTABar project={props.project} phases={props.phases} />
  ),
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
  postType: 'defaultInput',
  showInputManager: false,
  renderCTABar: (props: CTABarProps) => {
    return (
      <EmbeddedSurveyCTABar project={props.project} phases={props.phases} />
    );
  },
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

  postType: 'defaultInput',
  showInputManager: false,
  renderCTABar: (props: CTABarProps) => {
    return (
      <DocumentAnnotationCTABar project={props.project} phases={props.phases} />
    );
  },
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
  renderCTABar: (props: CTABarProps) => {
    return <VotingCTABar project={props.project} phases={props.phases} />;
  },
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

  postType: 'defaultInput',
  showInputManager: false,
  renderCTABar: (props: CTABarProps) => {
    return <PollCTABar project={props.project} phases={props.phases} />;
  },
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
  postType: 'defaultInput',
  showInputManager: false,
  renderCTABar: (props: CTABarProps) => {
    return <VolunteeringCTABar project={props.project} phases={props.phases} />;
  },
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
  community_monitor_survey: nativeSurveyConfig,
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
