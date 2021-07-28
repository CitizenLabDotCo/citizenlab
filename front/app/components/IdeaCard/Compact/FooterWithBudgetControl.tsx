import React, { memo } from 'react';
import FormattedBudget from 'utils/currency/FormattedBudget';

// components
import { Icon } from 'cl2-component-library';
import AssignBudgetControl from 'components/AssignBudgetControl';

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

const CommentsCount = styled.span`
  color: ${colors.label};
  font-size: ${fontSizes.base}px;
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const CommentIcon = styled(Icon)`
  width: 20px;
  height: 20px;
  fill: ${colors.label};
  margin-right: 8px;
`;

interface Props {
  idea: IIdeaData;
  participationContextId?: string | null;
  participationContextType?: IParticipationContextType | null;
}

const FooterWithBudgetControl = memo<Props>(
  ({ idea, participationContextId, participationContextType }) => {
    const projectId = idea?.relationships?.project.data?.id;
    const ideaBudget = idea?.attributes?.budget;

    return (
      <Footer>
        <CommentsCount className="e2e-ideacard-comment-count">
          <CommentIcon name="comments" />
          {idea.attributes.comments_count}
        </CommentsCount>
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
  }
);

export default FooterWithBudgetControl;
