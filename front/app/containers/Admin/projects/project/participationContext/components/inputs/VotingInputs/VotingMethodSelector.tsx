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
  Title,
} from '@citizenlab/cl2-component-library';
import BudgetingIcon from './BudgetingIcon';

// types
import { VotingMethodType } from 'containers/Admin/projects/project/participationContext/utils/votingMethodUtils';

type VotingMethodSelectorProps = {
  voting_method?: VotingMethodType | null;
  handleVotingMethodOnChange: (voting_method: VotingMethodType) => void;
};

const VotingMethodSelector = ({
  voting_method,
  handleVotingMethodOnChange,
}: VotingMethodSelectorProps) => {
  const { formatMessage } = useIntl();
  const selected = voting_method === 'budgeting';

  return (
    <Box mb="20px">
      <Title
        mt="0px"
        fontSize="l"
        color="primary"
        fontWeight="normal"
        display="flex"
      >
        {formatMessage(messages.votingMethodSelectorTitle)}
        <IconTooltip
          content={formatMessage(messages.votingMethodSelectorTooltip)}
          ml="6px"
          mt="-1px"
        />
      </Title>
      <Text mt="0px" mb="23px" color="textSecondary">
        {formatMessage(messages.votingMethodSelectorSubtitle)}
      </Text>
      <CardButton
        selected={selected}
        icon={<BudgetingIcon selected={selected} />}
        onClick={(e) => {
          e.preventDefault();
          handleVotingMethodOnChange('budgeting');
        }}
        title={formatMessage(messages.budgetingVotingMethodTitle)}
        subtitle={formatMessage(messages.budgetingVotingMethodSubtitle)}
      />
    </Box>
  );
};

export default VotingMethodSelector;
