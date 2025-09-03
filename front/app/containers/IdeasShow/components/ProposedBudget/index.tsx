import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import useCustomFields from 'api/custom_fields/useCustomFields';
import useIdeaById from 'api/ideas/useIdeaById';

import { FormattedMessage } from 'utils/cl-intl';

import messages from '../../messages';

import IdeaProposedBudget from './IdeaProposedBudget';

const BodySectionTitle = styled.h2`
  font-size: ${(props) => props.theme.fontSizes.l}px;
  font-weight: 500;
  line-height: 28px;
  padding: 0;
  margin: 0;
  margin-bottom: 15px;
`;

interface Props {
  projectId: string;
  ideaId: string;
}

const ProposedBudget = ({ projectId, ideaId }: Props) => {
  const { data: idea } = useIdeaById(ideaId);

  const { data: customFields } = useCustomFields({ projectId });

  const proposedBudgetEnabled = customFields?.find(
    (field) => field.key === 'proposed_budget'
  )?.enabled;

  // TODO: Fix this the next time the file is edited.
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  const proposedBudget = idea?.data.attributes?.proposed_budget;

  if (!proposedBudgetEnabled || !proposedBudget) return null;

  return (
    <>
      <BodySectionTitle>
        <FormattedMessage {...messages.proposedBudgetTitle} />
      </BodySectionTitle>
      <Box mb="20px">
        <IdeaProposedBudget proposedBudget={proposedBudget} />
      </Box>
      <BodySectionTitle>
        <FormattedMessage {...messages.bodyTitle} />
      </BodySectionTitle>
    </>
  );
};

export default ProposedBudget;
