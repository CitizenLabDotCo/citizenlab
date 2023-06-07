import React from 'react';

// intl
import messages from './messages';
import { FormattedMessage, useIntl } from 'utils/cl-intl';

// components
import {
  CardButton,
  IconTooltip,
  Text,
} from '@citizenlab/cl2-component-library';
import { SectionField, SubSectionTitle } from 'components/admin/Section';
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
        selected={selected}
        icon={<BudgetingIcon selected={selected} />}
        onClick={(e) => {
          e.preventDefault();
          handleVotingMethodOnChange('budgeting');
        }}
        title={formatMessage(messages.budgetingVotingMethodTitle)}
        subtitle={formatMessage(messages.budgetingVotingMethodSubtitle)}
      />
    </SectionField>
  );
};

export default VotingMethodSelector;
