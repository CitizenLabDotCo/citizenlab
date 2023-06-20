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

// types
import { VotingMethod } from 'services/participationContexts';
import CumulativeIcon from './CardIcons/CumulativeIcon';

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
    <Box mb="35px">
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
          selected={voting_method === 'cumulative'}
          icon={<CumulativeIcon selected={voting_method === 'cumulative'} />}
          onClick={(e) => {
            e.preventDefault();
            handleVotingMethodOnChange('cumulative');
          }}
          title={formatMessage(messages.cumulativeVotingMethodTitle)}
          subtitle={formatMessage(messages.cumulativeVotingMethodSubtitle)}
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
