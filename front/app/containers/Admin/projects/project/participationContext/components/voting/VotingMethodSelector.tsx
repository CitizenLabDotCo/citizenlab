import React from 'react';

// intl
import messages from './messages';
import { FormattedMessage, useIntl } from 'utils/cl-intl';

// components
import {
  Box,
  CardButton,
  IconTooltip,
  Text,
  colors,
} from '@citizenlab/cl2-component-library';
import { SectionField, SubSectionTitle } from 'components/admin/Section';

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

  return (
    <SectionField>
      <SubSectionTitle>
        <FormattedMessage {...messages.votingMethodSelectorTitle} />
        <IconTooltip
          content={
            <FormattedMessage {...messages.votingMethodSelectorTooltip} />
          }
        />
      </SubSectionTitle>
      <Text mt="0px" color="textSecondary">
        {formatMessage(messages.votingMethodSelectorSubtitle)}
      </Text>
      <CardButton
        selected={voting_method === 'budgeting'}
        customIconSection={
          <Box borderRadius="3px" background={colors.teal200} p="4px">
            Vote Icon/Image: To Do
          </Box>
        }
        onClick={() => {
          handleVotingMethodOnChange('budgeting');
        }}
        title={formatMessage(messages.budgetingVotingMethodTitle)}
        subtitle={formatMessage(messages.budgetingVotingMethodSubtitle)}
      />
    </SectionField>
  );
};

export default VotingMethodSelector;
