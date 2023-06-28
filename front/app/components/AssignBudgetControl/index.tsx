import React, { memo } from 'react';

// api
import useIdeaById from 'api/ideas/useIdeaById';
import useProjectById from 'api/projects/useProjectById';
import usePhases from 'api/phases/usePhases';

// components
import { Box } from '@citizenlab/cl2-component-library';
import AddToBasketButton from './AddToBasketButton';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';
import FormattedBudget from 'utils/currency/FormattedBudget';

// styles
import styled from 'styled-components';
import { fontSizes, colors, defaultCardStyle, media } from 'utils/styleUtils';

// utils
import { getParticipationContext } from './utils';

// typings
import { ScreenReaderOnly } from 'utils/a11y';
import PBExpenses from 'containers/ProjectsShowPage/shared/pb/PBExpenses';

const IdeaPageContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  ${media.tablet`
    padding: 20px;
    background: ${colors.background};
  `}
`;

const BudgetWithButtonWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: center;
`;

const Budget = styled.div`
  width: 100%;
  height: 90px;
  color: ${(props) => props.theme.colors.tenantText};
  font-size: ${fontSizes.m}px;
  font-weight: 600;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 3px;
  ${defaultCardStyle};
`;

const StyledPBExpenses = styled(PBExpenses)`
  margin-top: 25px;
  padding: 20px;
`;

type TView = 'ideaCard' | 'ideaPage';

interface Props {
  view: TView;
  projectId: string;
  ideaId: string;
  className?: string;
}

const AssignBudgetControl = memo(
  ({ view, ideaId, className, projectId }: Props) => {
    const { data: idea } = useIdeaById(ideaId);
    const { data: project } = useProjectById(projectId);
    const { data: phases } = usePhases(projectId);

    const participationContext = getParticipationContext(project, idea, phases);
    const participationContextId = participationContext?.id;
    const participationContextType =
      project?.data.attributes.process_type === 'continuous'
        ? 'project'
        : 'phase';

    const ideaBudget = idea?.data.attributes.budget;
    const actionDescriptor = idea?.data.attributes.action_descriptor.voting;

    if (!actionDescriptor || !ideaBudget) return null;

    const isPermitted =
      actionDescriptor.enabled ||
      actionDescriptor.disabled_reason !== 'not_permitted';

    if (view === 'ideaCard') {
      return (
        <Box className={`e2e-assign-budget ${className || ''}`} width="100%">
          <AddToBasketButton
            ideaId={ideaId}
            projectId={projectId}
            inBasketMessage={messages.added}
            notInBasketMessage={messages.add}
          />
        </Box>
      );
    }

    return (
      <IdeaPageContainer
        className={`pbAssignBudgetControlContainer e2e-assign-budget ${
          className || ''
        }`}
      >
        <BudgetWithButtonWrapper>
          <Budget>
            <ScreenReaderOnly>
              <FormattedMessage {...messages.a11y_price} />
            </ScreenReaderOnly>
            <FormattedBudget value={ideaBudget} />
          </Budget>
          <AddToBasketButton
            ideaId={ideaId}
            projectId={projectId}
            inBasketMessage={messages.removeFromMyBasket}
            notInBasketMessage={messages.addToMyBasket}
          />
        </BudgetWithButtonWrapper>
        {isPermitted && participationContextId && (
          <StyledPBExpenses
            participationContextId={participationContextId}
            participationContextType={participationContextType}
            viewMode="column"
          />
        )}
      </IdeaPageContainer>
    );
  }
);

export default AssignBudgetControl;
