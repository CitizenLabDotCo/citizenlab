import React from 'react';

import {
  Box,
  CardButton,
  IconTooltip,
  Text,
} from '@citizenlab/cl2-component-library';

import RadioGroup from 'design-system/RadioGroup';

import { VotingMethod } from 'api/phases/types';

import ChoiceRadio from 'containers/Admin/projects/_shared/components/ChoiceRadio';

import { SubSectionTitle } from 'components/admin/Section';

import { useIntl } from 'utils/cl-intl';

import BudgetingIcon from './CardIcons/BudgetingIcon';
import MultipleVotingIcon from './CardIcons/MultipleVotingIcon';
import SingleVotingIcon from './CardIcons/SingleVotingIcon';
import messages from './messages';
import 'design-system/tokens.css';

const VOTING_METHODS = [
  {
    method: 'single_voting',
    title: messages.singleVotingMethodTitle,
    subtitle: messages.singleVotingMethodSubtitle2,
  },
  {
    method: 'multiple_voting',
    title: messages.multipleVotingMethodTitle,
    subtitle: messages.multipleVotingMethodSubtitle2,
  },
  {
    method: 'budgeting',
    title: messages.budgetingVotingMethodTitle,
    subtitle: messages.budgetingVotingMethodSubtitle2,
  },
] as const;

type VotingMethodSelectorProps = {
  voting_method?: VotingMethod | null;
  handleVotingMethodOnChange: (voting_method: VotingMethod) => void;
  /** 'panel' shows the methods as a narrow list of radios. */
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
      <RadioGroup
        aria-label={formatMessage(messages.votingMethodSelectorTitle)}
        name="voting_method"
        value={voting_method ?? null}
        onChange={(value) => {
          const option = VOTING_METHODS.find(({ method }) => method === value);
          if (option) handleVotingMethodOnChange(option.method);
        }}
      >
        {VOTING_METHODS.map(({ method, title, subtitle }) => (
          <ChoiceRadio
            key={method}
            value={method}
            title={formatMessage(title)}
            description={formatMessage(subtitle)}
          />
        ))}
      </RadioGroup>
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
