import { FormatMessage } from 'typings';

import { IPhaseData } from 'api/phases/types';
import { PhaseMiniData } from 'api/phases_mini/types';
import { ActionDescriptors } from 'api/projects/types';

import { Localize } from 'hooks/useLocalize';

import { getInputTermMessage } from 'utils/i18n';

import messages from './messages';

interface Params {
  phase: IPhaseData | PhaseMiniData;
  actionDescriptors: ActionDescriptors;
  formatMessage: FormatMessage;
  localize: Localize;
  hasPublicReport: boolean;
}

const getCTAMessage = ({
  phase,
  actionDescriptors,
  formatMessage,
  localize,
  hasPublicReport,
}: Params) => {
  const {
    participation_method,
    voting_method,
    input_term,
    native_survey_button_multiloc,
  } = phase.attributes;

  const canPost = actionDescriptors.posting_idea.enabled;
  const canReact = actionDescriptors.reacting_idea.enabled;
  const canComment = actionDescriptors.commenting_idea.enabled;

  if (participation_method === 'voting') {
    if (voting_method === 'budgeting') {
      return formatMessage(messages.allocateYourBudget);
    } else {
      return formatMessage(messages.vote);
    }
  } else if (participation_method === 'information') {
    return hasPublicReport
      ? formatMessage(messages.readTheReport)
      : formatMessage(messages.learnMore);
  } else if (participation_method === 'survey') {
    return formatMessage(messages.takeTheSurvey);
  } else if (participation_method === 'native_survey') {
    return localize(native_survey_button_multiloc);
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
          comment: messages.addYourComment,
          statement: messages.addYourStatement,
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
          comment: messages.viewTheComments,
          statement: messages.viewTheStatements,
        })
      );
    }
  }

  return undefined;
};

export default getCTAMessage;
