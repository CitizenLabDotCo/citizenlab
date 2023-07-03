import React from 'react';

// api
import useIdeaJsonFormSchema from 'api/idea_json_form_schema/useIdeaJsonFormSchema';
import useLocale from 'hooks/useLocale';
import useIdeaById from 'api/ideas/useIdeaById';

// components
import { Box } from '@citizenlab/cl2-component-library';
import IdeaProposedBudget from './IdeaProposedBudget';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../../messages';

// styling
import styled from 'styled-components';

// utils
import { isFieldEnabled } from 'utils/projectUtils';

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
  const { data: ideaCustomFieldsSchema } = useIdeaJsonFormSchema({
    projectId,
    inputId: ideaId,
  });
  const locale = useLocale();
  const { data: idea } = useIdeaById(ideaId);

  if (!ideaCustomFieldsSchema) return null;

  const proposedBudgetEnabled = isFieldEnabled(
    'proposed_budget',
    ideaCustomFieldsSchema.data.attributes,
    locale
  );

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
