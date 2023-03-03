import React from 'react';
import FormattedBudget from 'utils/currency/FormattedBudget';

// components
import AssignBudgetControl from 'components/AssignBudgetControl';
import CommentCount from './CommentCount';

// types
import { IParticipationContextType } from 'typings';
import { IIdea } from 'api/ideas/types';

// styles
import styled from 'styled-components';
import { colors, fontSizes } from 'utils/styleUtils';

const Footer = styled.footer`
  display: flex;
  justify-content: space-between;
`;

const BudgetControl = styled.div`
  display: flex;
  align-items: center;
`;

const IdeaBudget = styled.span`
  color: ${colors.textSecondary};
  font-size: ${fontSizes.base}px;
  color: ${(props) => props.theme.colors.tenantText};
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
`;

interface Props {
  idea: IIdea;
  participationContextId?: string | null;
  participationContextType?: IParticipationContextType | null;
  showCommentCount: boolean;
}

const FooterWithBudgetControl = ({
  idea,
  participationContextId,
  participationContextType,
  showCommentCount,
}: Props) => {
  const projectId = idea.data.relationships.project.data.id;
  const ideaBudget = idea.data.attributes.budget;

  return (
    <Footer>
      {showCommentCount && (
        <CommentCount commentCount={idea.data.attributes.comments_count} />
      )}{' '}
      {participationContextId && participationContextType && ideaBudget && (
        <BudgetControl>
          <IdeaBudget>
            <FormattedBudget value={ideaBudget} />
          </IdeaBudget>
          <AssignBudgetControl
            view="ideaCard"
            projectId={projectId}
            ideaId={idea.data.id}
          />
        </BudgetControl>
      )}
    </Footer>
  );
};
export default FooterWithBudgetControl;
