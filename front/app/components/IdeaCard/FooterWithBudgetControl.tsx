import React from 'react';
import FormattedBudget from 'utils/currency/FormattedBudget';

// components
import AssignBudgetControl from 'components/AssignBudgetControl';
import CommentCount from './CommentCount';

// types
import { IParticipationContextType } from 'typings';
import { IIdeaData } from 'services/ideas';

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
  color: ${colors.label};
  font-size: ${fontSizes.base}px;
  color: ${(props) => props.theme.colorText};
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
`;

interface Props {
  idea: IIdeaData;
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
  const projectId = idea.relationships.project.data.id;
  const ideaBudget = idea.attributes.budget;

  return (
    <Footer>
      {showCommentCount && (
        <CommentCount commentCount={idea.attributes.comments_count} />
      )}{' '}
      {participationContextId && participationContextType && ideaBudget && (
        <BudgetControl>
          <IdeaBudget>
            <FormattedBudget value={ideaBudget} />
          </IdeaBudget>
          <AssignBudgetControl
            view="ideaCard"
            projectId={projectId}
            ideaId={idea.id}
          />
        </BudgetControl>
      )}
    </Footer>
  );
};
export default FooterWithBudgetControl;
