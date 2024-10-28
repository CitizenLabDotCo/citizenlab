import { FormatMessage } from 'typings';

import { IPhase } from 'api/phases/types';
import { IProject } from 'api/projects/types';

import { Localize } from 'hooks/useLocalize';

import { getInputTermMessage } from 'utils/i18n';

import messages from './messages';

interface Params {
  phase: IPhase;
  project: IProject;
  formatMessage: FormatMessage;
  localize: Localize;
}

const getCTAMessage = ({ phase, project, formatMessage, localize }: Params) => {
  const { participation_method, voting_method } = phase.data.attributes;
  const { action_descriptors } = project.data.attributes;

  const canPost = action_descriptors.posting_idea.enabled;
  const canReact = action_descriptors.reacting_idea.enabled;
  const canComment = action_descriptors.commenting_idea.enabled;
  const { input_term } = phase.data.attributes;

  if (participation_method === 'voting') {
    if (voting_method === 'budgeting') {
      return formatMessage(messages.allocateYourBudget);
    } else {
      return formatMessage(messages.vote);
    }
  } else if (participation_method === 'information') {
    return formatMessage(messages.learnMore);
  } else if (participation_method === 'survey') {
    return formatMessage(messages.takeTheSurvey);
  } else if (participation_method === 'native_survey') {
    return localize(phase.data.attributes.native_survey_button_multiloc);
  } else if (participation_method === 'document_annotation') {
    return formatMessage(messages.reviewDocument);
  } else if (participation_method === 'poll') {
    return formatMessage(messages.takeThePoll);
  } else if (
    participation_method === 'ideation' ||
    participation_method === 'proposals'
  ) {
    if (canPost) {
      return formatMessage(
        getInputTermMessage(input_term, {
          idea: messages.submitYourIdea,
          option: messages.addYourOption,
          project: messages.submitYourProject,
          question: messages.joinDiscussion,
          issue: messages.submitAnIssue,
          contribution: messages.contributeYourInput,
          initiative: messages.submitYourInitiative,
          proposal: messages.submitYourProposal,
          petition: messages.submitYourPetition,
        })
      );
    } else if (canReact) {
      return formatMessage(messages.reaction);
    } else if (canComment) {
      return formatMessage(messages.comment);
    } else {
      return formatMessage(
        getInputTermMessage(input_term, {
          idea: messages.viewTheIdeas,
          option: messages.viewTheOptions,
          project: messages.viewTheProjects,
          question: messages.viewTheQuestions,
          issue: messages.viewTheIssues,
          contribution: messages.viewTheContributions,
          proposal: messages.viewTheProposals,
          initiative: messages.viewTheInitiatives,
          petition: messages.viewThePetitions,
        })
      );
    }
  }

  return undefined;
};

export default getCTAMessage;
