import React from 'react';

import {
  Box,
  CardButton,
  IconTooltip,
  Text,
} from '@citizenlab/cl2-component-library';

import { VotingMethod } from 'api/phases/types';

import { SubSectionTitle } from 'components/admin/Section';

import { useIntl } from 'utils/cl-intl';

import BudgetingIcon from './CardIcons/BudgetingIcon';
import MultipleVotingIcon from './CardIcons/MultipleVotingIcon';
import SingleVotingIcon from './CardIcons/SingleVotingIcon';
import messages from './messages';

const VOTING_METHODS = [
  { method: 'single_voting', title: messages.singleVotingMethodTitle },
  { method: 'multiple_voting', title: messages.multipleVotingMethodTitle },
  { method: 'budgeting', title: messages.budgetingVotingMethodTitle },
] as const;

type VotingMethodSelectorProps = {
  voting_method?: VotingMethod | null;
  handleVotingMethodOnChange: (voting_method: VotingMethod) => void;
  /** 'panel' shows the methods as a narrow list of titles. */
  layout?: 'page' | 'panel';
};

const VotingMethodSelector = ({
  voting_method,
  handleVotingMethodOnChange,
  layout = 'page',
}: VotingMethodSelectorProps) => {
  const { formatMessage } = useIntl();

  if (layout === 'panel') {
    return (
      <Box mb="24px">
        <SubSectionTitle>
          {formatMessage(messages.votingMethodSelectorTitle)}
        </SubSectionTitle>
        <Box display="flex" flexDirection="column" gap="12px">
          {VOTING_METHODS.map(({ method, title }) => (
            <CardButton
              key={method}
              width="100%"
              minHeight="auto"
              selected={voting_method === method}
              onClick={(e) => {
                e.preventDefault();
                handleVotingMethodOnChange(method);
              }}
              title={formatMessage(title)}
            />
          ))}
        </Box>
      </Box>
    );
  }

  return (
    <Box mb="35px" maxWidth="800px">
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
      <Box display="flex" gap="16px" flexWrap="wrap">
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
