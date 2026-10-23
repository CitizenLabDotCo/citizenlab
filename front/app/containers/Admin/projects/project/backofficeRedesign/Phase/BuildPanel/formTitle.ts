import { InputTerm } from 'api/phases/types';

import { getInputTermMessage } from 'utils/i18n';

import messages from '../../messages';

/** The input form's title, named after what participants submit. */
const formTitle = (inputTerm: InputTerm) =>
  getInputTermMessage(inputTerm, {
    idea: messages.ideaFormTitle,
    option: messages.optionFormTitle,
    project: messages.projectFormTitle,
    question: messages.questionFormTitle,
    issue: messages.issueFormTitle,
    contribution: messages.contributionFormTitle,
    proposal: messages.proposalFormTitle,
    initiative: messages.initiativeFormTitle,
    petition: messages.petitionFormTitle,
    comment: messages.commentFormTitle,
    response: messages.responseFormTitle,
    suggestion: messages.suggestionFormTitle,
    topic: messages.topicFormTitle,
    post: messages.postFormTitle,
    story: messages.storyFormTitle,
    observation: messages.observationFormTitle,
  });

export default formTitle;
