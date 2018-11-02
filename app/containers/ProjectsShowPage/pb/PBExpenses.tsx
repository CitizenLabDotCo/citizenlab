import React, { PureComponent } from 'react';
import { adopt } from 'react-adopt';
import { isNilOrError, getFormattedBudget } from 'utils/helperUtils';
import { get, isNumber, round } from 'lodash-es';

// services
import { IIdeaData } from 'services/ideas';

// resources
import GetLocale, { GetLocaleChildProps } from 'resources/GetLocale';
import GetTenant, { GetTenantChildProps } from 'resources/GetTenant';
import GetBasket, { GetBasketChildProps } from 'resources/GetBasket';
import GetProject, { GetProjectChildProps } from 'resources/GetProject';
import GetPhase, { GetPhaseChildProps } from 'resources/GetPhase';
import GetIdeaList, { GetIdeaListChildProps } from 'resources/GetIdeaList';

// components
import Button from 'components/UI/Button';
import Dropdown from 'components/UI/Dropdown';
// import Icon from 'components/UI/Icon';
import PBBasket from './PBBasket';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

// styling
import styled from 'styled-components';
import { colors, fontSizes, media } from 'utils/styleUtils';

const Container = styled.div``;

const InnerContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: strech;
  padding: 30px;
  border-radius: 5px;
  border: solid 1px ${colors.separation};
  background: #fff;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
`;

const Title = styled.h1`
  color: ${colors.text};
  font-size: ${fontSizes.large}px;
  line-height: ${fontSizes.large}px;
  font-weight: 500;
  padding: 0;
  margin: 0;
`;

const Spacer = styled.div`
  flex: 1;
`;

const Budget = styled.div`
  color: ${colors.text};
  font-size: ${fontSizes.base}px;
  line-height: ${fontSizes.base}px;
  display: flex;
  align-items: center;
`;

const BudgetLabel = styled.span`
  font-weight: 300;
  margin-right: 5px;
`;

const BudgetAmount = styled.span`
  font-weight: 500;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 30px;
  border-radius: 5px;
  margin-top: 30px;
  margin-bottom: 30px;
  background: repeating-linear-gradient(-45deg, #eff1f2, #eff1f2 10px, #e6e9ec 10px, #e6e9ec 20px);

  ${media.smallerThanMinTablet`
    margin-top: 20px;
    margin-bottom: 20px;
  `}
`;

const ProgressBarOverlay: any = styled.div`
  width: ${(props: any) => props.progress}%;
  height: 100%;
  background: ${colors. adminTextColor};
  border-radius: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ProgressBarPercentage = styled.span`
  color: #fff;
  font-size: 14px;
  font-weight: 500;
`;

const Footer = styled.div`
  display: flex;

  ${media.biggerThanMinTablet`
    align-items: center;
  `}

  ${media.smallerThanMinTablet`
    flex-direction: column;
  `}
`;

const Budgets = styled.div`
  ${media.smallerThanMinTablet`
    display: flex;
    flex-direction: column;
  `}
`;

const TotalBudgetDesktop = Budget.extend`
  ${media.smallerThanMinTablet`
    display: none;
  `}
`;

const TotalBudgetMobile = Budget.extend`
  margin-top: 10px;

  ${media.biggerThanMinTablet`
    display: none;
  `}
`;

const Buttons = styled.div`
  display: flex;

  ${media.smallerThanMinTablet`
    margin-top: 20px;
  `}
`;

const ManageBudgetWrapper = styled.div`
  height: 100%;
  position: relative;
  display: flex;
  flex-direction: column;
`;

const ManageBudgetButton = styled(Button)`
  margin-right: 10px;
`;

const DropdownWrapper = styled.div`
  width: 100%;
  flex: 0 0 0px;
  position: relative;
  display: flex;
  justify-content: center;
`;

const SubmitExpensesButton = styled(Button)`
  ${media.smallerThanMinTablet`
    display: none;
  `}
`;

interface InputProps {
  participationContextId: string | null;
  participationContextType: 'Project' | 'Phase';
  className?: string;
}

interface DataProps {
  locale: GetLocaleChildProps;
  tenant: GetTenantChildProps;
  basket: GetBasketChildProps;
  project: GetProjectChildProps;
  phase: GetPhaseChildProps;
  ideaList: GetIdeaListChildProps;
}

interface Props extends InputProps, DataProps {}

interface State {
  dropdownOpened: boolean;
}

class PBExpenses extends PureComponent<Props, State> {
  constructor(props) {
    super(props);
    this.state = {
      dropdownOpened: false
    };
  }

  toggleExpensesDropdown = () => {
    this.setState(({ dropdownOpened }) => ({ dropdownOpened: !dropdownOpened }));
  }

  handleManageBudgetOnClick = () => {

  }

  handleSubmitExpensesOnClick = () => {

  }

  render() {
    const { locale, tenant } = this.props;

    if (!isNilOrError(locale) && !isNilOrError(tenant)) {
      const { participationContextType, participationContextId, project, phase, basket, ideaList, className } = this.props;
      const { dropdownOpened } = this.state;
      const currency = tenant.attributes.settings.core.currency;
      let totalBudget = 0;
      let spentBudget = 0;
      let progress = 0;

      if (participationContextType === 'Project' && !isNilOrError(project)) {
        totalBudget = project.attributes.max_budget as number;
      } else if (participationContextType === 'Phase' && !isNilOrError(phase)) {
        totalBudget = phase.attributes.max_budget as number;
      }

      if (!isNilOrError(ideaList) && ideaList.length > 0) {
        spentBudget = ideaList.filter((idea) => {
          return !isNilOrError(idea) && idea.attributes.budget && isNumber(idea.attributes.budget);
        })
        .map((idea: IIdeaData) => {
          return idea.attributes.budget as number;
        })
        .reduce((total, ideaBudget) => {
          const newTotal = total + ideaBudget;
          return newTotal;
        }, 0);
      }

      progress = round((spentBudget / totalBudget) * 100, 1);

      console.log('tenant');
      console.log(tenant);
      console.log('phase:');
      console.log(phase);
      console.log('basket:');
      console.log(basket);
      console.log('ideaList:');
      console.log(ideaList);
      console.log('totalBudget: ' + totalBudget);
      console.log('spentBudget: ' + spentBudget);
      console.log('progress: ' + progress);
      console.log('currency: ' + currency);

      return (
        <Container className={className}>
          <InnerContainer>
  `            <Header>
              <Title>
                <FormattedMessage {...messages.yourExpenses} />
              </Title>
              <Spacer />
              <TotalBudgetDesktop>
                <BudgetLabel>
                  <FormattedMessage {...messages.totalBudget} />:
                </BudgetLabel>
                <BudgetAmount>
                  {getFormattedBudget(locale, totalBudget, currency)}
                </BudgetAmount>
              </TotalBudgetDesktop>
            </Header>

            <ProgressBar>
              <ProgressBarOverlay progress={progress}>
                <ProgressBarPercentage>{progress}%</ProgressBarPercentage>
              </ProgressBarOverlay>
            </ProgressBar>

            <Footer>
              <Budgets />
                <Budget>
                  <BudgetLabel>
                    <FormattedMessage {...messages.spentBudget} />:
                  </BudgetLabel>
                  <BudgetAmount>
                    {getFormattedBudget(locale, spentBudget, currency)}
                  </BudgetAmount>
                </Budget>
                <TotalBudgetMobile>
                  <BudgetLabel>
                    <FormattedMessage {...messages.totalBudget} />:
                  </BudgetLabel>
                  <BudgetAmount>
                    {getFormattedBudget(locale, totalBudget, currency)}
                  </BudgetAmount>
                </TotalBudgetMobile>
              <Budgets />
              <Spacer />
              <Buttons>
                <ManageBudgetWrapper>
                  <ManageBudgetButton
                    onClick={this.toggleExpensesDropdown}
                    icon="moneybag"
                    textColor={colors.adminTextColor}
                    bgColor="transparent"
                    bgHoverColor="transparent"
                    borderColor={colors.separation}
                    borderThickness="2px"
                  >
                    <FormattedMessage {...messages.manageBudget} />
                  </ManageBudgetButton>

                  <DropdownWrapper>
                    <Dropdown
                      top="-5px"
                      opened={dropdownOpened}
                      onClickOutside={this.toggleExpensesDropdown}
                      content={
                        <PBBasket
                          participationContextType={participationContextType}
                          participationContextId={participationContextId}
                        />
                      }
                    />
                  </DropdownWrapper>
                </ManageBudgetWrapper>

                <SubmitExpensesButton
                  onClick={this.handleSubmitExpensesOnClick}
                  icon="submit"
                  iconPos="right"
                  bgColor={colors.adminTextColor}
                >
                  <FormattedMessage {...messages.submitMyExpenses} />
                </SubmitExpensesButton>
              </Buttons>
            </Footer>`
          </InnerContainer>
        </Container>
      );
    }

    return null;
  }
}

const Data = adopt<DataProps, InputProps>({
  locale: <GetLocale />,
  tenant: <GetTenant />,
  project: ({ participationContextType, participationContextId, render }) => <GetProject id={participationContextType === 'Project' ? participationContextId : null}>{render}</GetProject>,
  phase: ({ participationContextType, participationContextId, render }) => <GetPhase id={participationContextType === 'Phase' ? participationContextId : null}>{render}</GetPhase>,
  basket: ({ participationContextType, project, phase, render }) => {
    let basketId: string | null = null;

    if (participationContextType === 'Project') {
      basketId = (!isNilOrError(project) ? get(project.relationships.user_basket.data, 'id', null) : null);
    } else {
      basketId = (!isNilOrError(phase) ? get(phase.relationships.user_basket.data, 'id', null) : null);
    }

    return <GetBasket id={basketId}>{render}</GetBasket>;
  },
  ideaList: ({ basket, render }) => <GetIdeaList ids={!isNilOrError(basket) ? basket.relationships.ideas.data.map(idea => idea.id) : null} >{render}</GetIdeaList>
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataProps => <PBExpenses {...inputProps} {...dataProps} />}
  </Data>
);
