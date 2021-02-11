import React, { PureComponent, FormEvent } from 'react';
import { adopt } from 'react-adopt';
import {
  isNilOrError,
  capitalizeParticipationContextType,
} from 'utils/helperUtils';
import { get, isEmpty, isUndefined } from 'lodash-es';

// services
import { updateBasket } from 'services/baskets';

// resources
import GetAppConfiguration, { GetTenantChildProps } from 'resources/GetTenant';
import GetAuthUser, { GetAuthUserChildProps } from 'resources/GetAuthUser';
import GetBasket, { GetBasketChildProps } from 'resources/GetBasket';
import GetProject, { GetProjectChildProps } from 'resources/GetProject';
import GetPhase, { GetPhaseChildProps } from 'resources/GetPhase';
import GetIdeaList, { GetIdeaListChildProps } from 'resources/GetIdeaList';

// styles
import { ScreenReaderOnly } from 'utils/a11y';
import { colors, fontSizes } from 'utils/styleUtils';
import styled from 'styled-components';
import { darken } from 'polished';

// components
import { Icon } from 'cl2-component-library';
import T from 'components/T';

// tracking
import { injectTracks } from 'utils/analytics';
import tracks from './tracks';

// utils
import { pastPresentOrFuture } from 'utils/dateUtils';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import { FormattedNumber } from 'react-intl';
import messages from 'containers/ProjectsShowPage/messages';

// typings
import { IIdeaData } from 'services/ideas';
import { IParticipationContextType } from 'typings';

const Container = styled.div`
  padding: 10px;
`;

const Empty = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const EmptyIcon = styled.svg`
  height: 120px;
  margin-top: 10px;
`;

const EmptyText = styled.div`
  width: 100%;
  color: ${colors.adminTextColor};
  font-size: ${fontSizes.base}px;
  line-height: 18px;
  font-weight: 500;
  text-align: center;
  display: flex;
  justify-content: center;
  margin-top: 25px;
  margin-bottom: 15px;
`;

const DropdownListItem = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 0px;
  margin-bottom: 25px;
  background: #fff;
  border-radius: ${(props: any) => props.theme.borderRadius};
  outline: none;

  &.last {
    margin-bottom: 0px;
  }
`;

const DropdownListItemContent = styled.div`
  display: flex;
  flex-direction: column;
`;

const IdeaTitle = styled.div`
  color: #333;
  font-size: ${fontSizes.base}px;
  font-weight: 500;
  line-height: 21px;
  text-align: left;
  overflow-wrap: break-word;
  word-wrap: break-word;
  word-break: break-word;
  margin-bottom: 6px;
`;

const IdeaBudget = styled.div`
  color: ${colors.label};
  font-size: ${fontSizes.small}px;
  font-weight: 400;
  line-height: 18px;
  text-align: left;
`;

const RemoveIconButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 15px;
`;

const RemoveIcon = styled(Icon)`
  height: 20px;
  fill: ${colors.clIconSecondary};
  cursor: pointer;

  &:hover {
    fill: ${darken(0.2, colors.clIconSecondary)};
  }
`;

interface InputProps {
  participationContextId: string | null;
  participationContextType: IParticipationContextType;
  className?: string;
}

interface DataProps {
  tenant: GetTenantChildProps;
  authUser: GetAuthUserChildProps;
  basket: GetBasketChildProps;
  project: GetProjectChildProps;
  phase: GetPhaseChildProps;
  ideaList: GetIdeaListChildProps;
}

interface Tracks {
  ideaRemovedFromBasket: () => void;
  ideaAddedToBasket: () => void;
}

interface Props extends InputProps, DataProps {}

interface State {}

class PBBasket extends PureComponent<Props & Tracks, State> {
  ideaRemovedFromBasket = (ideaIdToRemove: string) => async (
    event: FormEvent<any>
  ) => {
    event.preventDefault();

    const {
      authUser,
      basket,
      participationContextId,
      participationContextType,
    } = this.props;

    if (
      !isNilOrError(basket) &&
      !isNilOrError(authUser) &&
      participationContextId
    ) {
      const newIdeas = basket.relationships.ideas.data
        .filter((idea) => idea.id !== ideaIdToRemove)
        .map((idea) => idea.id);

      await updateBasket(basket.id, {
        user_id: authUser.id,
        participation_context_id: participationContextId,
        participation_context_type: capitalizeParticipationContextType(
          participationContextType
        ),
        idea_ids: newIdeas,
        submitted_at: null,
      });

      this.props.ideaRemovedFromBasket();
    }
  };

  render() {
    const {
      tenant,
      basket,
      phase,
      ideaList,
      participationContextType,
      className,
    } = this.props;

    if (!isNilOrError(tenant) && !isUndefined(basket)) {
      const ideas = !isNilOrError(ideaList)
        ? (ideaList.filter((idea) => !isNilOrError(idea)) as IIdeaData[])
        : null;
      let budgetingDisabled = false;

      if (
        participationContextType === 'phase' &&
        !isNilOrError(phase) &&
        pastPresentOrFuture([
          phase.attributes.start_at,
          phase.attributes.end_at,
        ]) !== 'present'
      ) {
        budgetingDisabled = true;
      }

      return (
        <Container className={className} aria-live="polite">
          {ideas &&
            ideas.length > 0 &&
            ideas.map((idea, index) => (
              <DropdownListItem
                key={idea.id}
                className={index === ideas.length - 1 ? 'last' : ''}
              >
                <DropdownListItemContent>
                  <IdeaTitle>
                    <T value={idea.attributes.title_multiloc} />
                  </IdeaTitle>
                  {idea.attributes.budget && (
                    <IdeaBudget>
                      <FormattedNumber
                        value={idea.attributes.budget}
                        style="currency"
                        currency={tenant.attributes.settings.core.currency}
                        minimumFractionDigits={0}
                        maximumFractionDigits={0}
                      />
                    </IdeaBudget>
                  )}
                </DropdownListItemContent>
                {!budgetingDisabled && (
                  <RemoveIconButton
                    onClick={this.ideaRemovedFromBasket(idea.id)}
                  >
                    <RemoveIcon ariaHidden name="remove" />
                    <ScreenReaderOnly>
                      <FormattedMessage {...messages.removeItem} />
                    </ScreenReaderOnly>
                  </RemoveIconButton>
                )}
              </DropdownListItem>
            ))}

          {isEmpty(ideas) && (
            <Empty>
              <EmptyIcon
                aria-hidden
                role="img"
                height="100%"
                viewBox="0 0 168 158"
                fill="none"
              >
                <path
                  d="M168 102.871C168 149.954 114.378 158 67.2 158C20.0218 158 0 105.054 0 57.9712C0 10.888 35.9675 0 83.1458 0C130.324 0 168 55.7872 168 102.871Z"
                  fill="#84939E"
                  fillOpacity="0.07"
                />
                <path
                  d="M93.2643 64.9551H74.738C74.0432 64.9551 73.5801 65.4222 73.5801 66.123C73.5801 66.8237 74.0432 67.2909 74.738 67.2909H93.2643C93.959 67.2909 94.4222 66.8237 94.4222 66.123C94.4222 65.4222 93.959 64.9551 93.2643 64.9551Z"
                  fill="#5C6E7D"
                  fillOpacity="0.5"
                />
                <path
                  d="M73.8111 61.9199C73.8111 62.387 74.2743 62.6206 74.7374 62.6206H93.2637C93.7269 62.6206 94.19 62.387 94.19 61.9199L98.8216 52.5767C99.0532 52.1095 99.0532 51.6423 98.59 51.1752C98.3585 50.9416 97.8953 50.9416 97.4321 51.1752L88.8637 55.3796L84.9269 51.4088C84.4637 50.9416 83.769 50.9416 83.3058 51.4088L79.1374 55.3796L70.569 51.1752C70.1058 50.9416 69.6427 50.9416 69.1795 51.1752C68.7164 51.4088 68.9479 52.1095 69.1795 52.5767L73.8111 61.9199V61.9199Z"
                  fill="#5C6E7D"
                  fillOpacity="0.5"
                />
                <path
                  d="M94.1895 70.0941C93.9579 69.8605 93.4947 69.627 93.2632 69.627H74.7368C74.5053 69.627 74.0421 69.8605 73.8105 70.0941C73.3474 70.5613 62 82.7074 62 89.4813C62 99.0581 71.9579 107 84 107C96.0421 107 106 99.0581 106 89.4813C106 82.7074 94.6526 70.5613 94.1895 70.0941ZM85.1579 97.6566V98.8245C85.1579 99.5252 84.6947 99.9924 84 99.9924C83.3053 99.9924 82.8421 99.5252 82.8421 98.8245V97.6566C80.2947 97.1894 78.4421 95.5544 78.2105 93.4521C78.2105 92.7514 78.6737 92.2842 79.3684 92.2842C80.0632 92.2842 80.5263 92.7514 80.5263 93.4521C80.5263 94.3865 81.6842 95.3208 82.8421 95.5544V90.8827C79.8316 90.182 78.2105 88.5469 78.2105 86.4447C78.2105 84.1089 80.2947 82.2403 82.8421 81.7731V80.6052C82.8421 79.9045 83.3053 79.4373 84 79.4373C84.6947 79.4373 85.1579 79.9045 85.1579 80.6052V81.306C87.7053 81.7731 89.5579 83.4082 89.7895 85.5104C89.7895 86.2111 89.3263 86.6783 88.6316 86.6783C87.9368 86.6783 87.4737 86.2111 87.4737 85.5104C87.4737 84.5761 86.3158 83.6418 85.1579 83.4082V88.0798C88.1684 88.7805 89.7895 90.4156 89.7895 92.5178C89.7895 95.3208 87.7053 97.1894 85.1579 97.6566V97.6566Z"
                  fill="#5C6E7D"
                  fillOpacity="0.5"
                />
                <path
                  d="M85.1582 90.8828V95.0873C86.5477 94.8537 87.474 93.9194 87.474 92.985C87.474 92.0507 86.7793 91.35 85.1582 90.8828V90.8828Z"
                  fill="#5C6E7D"
                  fillOpacity="0.5"
                />
                <path
                  d="M80.5273 85.9792C80.5273 86.9135 81.2221 87.6142 82.8431 88.0814V83.877C81.4537 84.1105 80.5273 85.0449 80.5273 85.9792Z"
                  fill="#5C6E7D"
                  fillOpacity="0.5"
                />
              </EmptyIcon>
              <EmptyText>
                <FormattedMessage {...messages.noExpenses} />
              </EmptyText>
            </Empty>
          )}
        </Container>
      );
    }

    return null;
  }
}

const Data = adopt<DataProps, InputProps>({
  tenant: <GetAppConfiguration />,
  authUser: <GetAuthUser />,
  project: ({ participationContextType, participationContextId, render }) => (
    <GetProject
      projectId={
        participationContextType === 'project' ? participationContextId : null
      }
    >
      {render}
    </GetProject>
  ),
  phase: ({ participationContextType, participationContextId, render }) => (
    <GetPhase
      id={participationContextType === 'phase' ? participationContextId : null}
    >
      {render}
    </GetPhase>
  ),
  basket: ({ participationContextType, project, phase, render }) => {
    let basketId: string | null = null;

    if (participationContextType === 'project') {
      basketId =
        !isNilOrError(project) && project.relationships.user_basket
          ? get(project.relationships.user_basket.data, 'id', null)
          : null;
    } else {
      basketId =
        !isNilOrError(phase) && phase.relationships.user_basket
          ? get(phase.relationships.user_basket.data, 'id', null)
          : null;
    }

    return <GetBasket id={basketId}>{render}</GetBasket>;
  },
  ideaList: ({ basket, render }) => (
    <GetIdeaList
      ids={
        !isNilOrError(basket)
          ? basket.relationships.ideas.data.map((idea) => idea.id)
          : null
      }
    >
      {render}
    </GetIdeaList>
  ),
});

const PBBasketWithHoCs = injectTracks<Props>({
  ideaRemovedFromBasket: tracks.ideaRemovedFromBasket,
  ideaAddedToBasket: tracks.ideaAddedToBasket,
})(PBBasket);

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {(dataProps) => <PBBasketWithHoCs {...inputProps} {...dataProps} />}
  </Data>
);
