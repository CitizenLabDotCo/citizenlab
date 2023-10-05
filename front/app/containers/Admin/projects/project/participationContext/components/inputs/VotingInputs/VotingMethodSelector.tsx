import React from 'react';

// intl
import messages from './messages';
import { useIntl } from 'utils/cl-intl';

// components
import {
  Box,
  CardButton,
  IconTooltip,
  Text,
} from '@citizenlab/cl2-component-library';
import BudgetingIcon from './CardIcons/BudgetingIcon';
import { SubSectionTitle } from 'components/admin/Section';
import MultipleVotingIcon from './CardIcons/MultipleVotingIcon';
import SingleVotingIcon from './CardIcons/SingleVotingIcon';

// types
import { VotingMethod } from 'utils/participationContexts';

type VotingMethodSelectorProps = {
  voting_method?: VotingMethod | null;
  handleVotingMethodOnChange: (voting_method: VotingMethod) => void;
};

const VotingMethodSelector = ({
  voting_method,
  handleVotingMethodOnChange,
}: VotingMethodSelectorProps) => {
  const { formatMessage } = useIntl();

  return (
    <Box mb="35px" width="800px">
      <SubSectionTitle>
        {formatMessage(messages.votingMethodSelectorTitle)}
        <IconTooltip
          content={formatMessage(messages.votingMethodSelectorTooltip)}
          ml="6px"
          mt="-1px"
        />
      </SubSectionTitle>
      <Text mt="0px" mb="24px" color="textSecondary">
        {formatMessage(messages.votingMethodSelectorSubtitle)}
      </Text>
      <Box display="flex" gap="16px">
        <CardButton
          selected={voting_method === 'single_voting'}
          icon={
            <SingleVotingIcon selected={voting_method === 'single_voting'} />
          }
          onClick={(e) => {
            e.preventDefault();
            handleVotingMethodOnChange('single_voting');
          }}
          title={formatMessage(messages.singleVotingMethodTitle)}
          subtitle={formatMessage(messages.singleVotingMethodSubtitle)}
        />
        <CardButton
          selected={voting_method === 'multiple_voting'}
          icon={
            <MultipleVotingIcon
              selected={voting_method === 'multiple_voting'}
            />
          }
          onClick={(e) => {
            e.preventDefault();
            handleVotingMethodOnChange('multiple_voting');
          }}
          title={formatMessage(messages.multipleVotingMethodTitle)}
          subtitle={formatMessage(messages.multipleVotingMethodSubtitle)}
        />
        <CardButton
          selected={voting_method === 'budgeting'}
          icon={<BudgetingIcon selected={voting_method === 'budgeting'} />}
          onClick={(e) => {
            e.preventDefault();
            handleVotingMethodOnChange('budgeting');
          }}
          title={formatMessage(messages.budgetingVotingMethodTitle)}
          subtitle={formatMessage(messages.budgetingVotingMethodSubtitle)}
        />
      </Box>
    </Box>
  );
};

export default VotingMethodSelector;
