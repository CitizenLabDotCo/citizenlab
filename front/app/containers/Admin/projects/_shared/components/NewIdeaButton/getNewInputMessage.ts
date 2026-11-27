import { InputTerm } from 'api/phases/types';

import { getInputTermMessage } from 'utils/i18n';

import messages from './messages';

const getNewInputMessage = (inputTerm: InputTerm) =>
  getInputTermMessage(inputTerm, {
    idea: messages.newIdea,
    option: messages.newOption,
    project: messages.newProject,
    question: messages.newQuestion,
    issue: messages.newIssue,
    contribution: messages.newContribution,
    proposal: messages.newProposal,
    initiative: messages.newInitiative,
    petition: messages.newPetition,
    comment: messages.newComment,
    response: messages.newResponse,
    suggestion: messages.newSuggestion,
    topic: messages.newTopic,
    post: messages.newPost,
    story: messages.newStory,
    observation: messages.newObservation,
  });

export default getNewInputMessage;
