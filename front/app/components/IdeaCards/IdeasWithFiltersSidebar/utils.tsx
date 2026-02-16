import { InputTerm } from 'api/phases/types';

import messages from '../messages';

export const getInputCountMessage = (inputTerm: InputTerm) => {
  switch (inputTerm) {
    case 'idea':
      return messages.xIdeas;
    case 'option':
      return messages.xOptions;
    case 'project':
      return messages.xProjects;
    case 'question':
      return messages.xQuestions;
    case 'issue':
      // We use "comment" instead of "issue" as of 2021
      // see: https://docs.google.com/spreadsheets/d/1ZAdsuCiApii-nIrcFnEXFAUeZXaygYwvI4Z_XhrpJRg
      return messages.xComments;
    case 'contribution':
      return messages.xContributions;
    case 'proposal':
      return messages.xProposals;
    case 'initiative':
      return messages.xInitiatives;
    case 'petition':
      return messages.xPetitions;
    case 'comment':
      return messages.xCommentsTerm;
    case 'response':
      return messages.xResponses;
    case 'suggestion':
      return messages.xSuggestions;
    case 'topic':
      return messages.xTopics;
    case 'post':
      return messages.xPosts;
    case 'story':
      return messages.xStories;
    default:
      return messages.xIdeas;
  }
};
