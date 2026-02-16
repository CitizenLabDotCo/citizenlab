import React from 'react';

import { Box, Button, colors } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import { InputTerm } from 'api/phases/types';

import { FormattedMessage } from 'utils/cl-intl';
import { getInputTermMessage } from 'utils/i18n';

import messages from '../messages';

const StickyButtonContainer = styled(Box)`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 16px;
  background: linear-gradient(to top, ${colors.white} 80%, transparent);
`;

interface Props {
  inputTerm: InputTerm;
  onClose: () => void;
}

const SeeAllButton = ({ inputTerm, onClose }: Props) => {
  return (
    <StickyButtonContainer>
      <Button width="100%" buttonStyle="secondary-outlined" onClick={onClose}>
        <FormattedMessage
          {...getInputTermMessage(inputTerm, {
            idea: messages.showAllIdeas,
            option: messages.showAllOptions,
            project: messages.showAllProjects,
            question: messages.showAllQuestions,
            issue: messages.showAllIssues,
            contribution: messages.showAllContributions,
            proposal: messages.showAllProposals,
            initiative: messages.showAllInitiatives,
            petition: messages.showAllPetitions,
            comment: messages.showAllComments,
            response: messages.showAllResponses,
            suggestion: messages.showAllSuggestions,
            topic: messages.showAllTopics,
            post: messages.showAllPosts,
            story: messages.showAllStories,
          })}
        />
      </Button>
    </StickyButtonContainer>
  );
};

export default SeeAllButton;
