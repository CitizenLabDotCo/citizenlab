import React, { PureComponent } from 'react';
import { adopt } from 'react-adopt';
import { isNilOrError, getFormattedBudget } from 'utils/helperUtils';
import { get, round } from 'lodash-es';
import moment from 'moment';

// services
import { updateBasket } from 'services/baskets';

// resources
import GetLocale, { GetLocaleChildProps } from 'resources/GetLocale';
import GetTenant, { GetTenantChildProps } from 'resources/GetTenant';
import GetBasket, { GetBasketChildProps } from 'resources/GetBasket';
import GetProject, { GetProjectChildProps } from 'resources/GetProject';
import GetPhase, { GetPhaseChildProps } from 'resources/GetPhase';

// components
import Button from 'components/UI/Button';
import Dropdown from 'components/UI/Dropdown';
import Icon from 'components/UI/Icon';
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
  min-height: 20px;
  color: ${colors.text};
  font-size: ${fontSizes.large}px;
  line-height: 21px;
  font-weight: 500;
  display: flex;
  align-items: center;
  padding: 0;
  margin: 0;
  margin-right: 15px;

  &.validationError {
    color: ${colors.clRedError};
    fill: ${colors.clRedError};
  }

  &.validationSuccess {
    color: ${colors.clGreenSuccess};
    fill: ${colors.clGreenSuccess};
  }
`;

const TitleIcon = styled(Icon)`
  height: 20px;
  margin-right: 10px;
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

  &.red {
    color: ${colors.clRedError};
  }

  &.green {
    color: ${colors.clGreenSuccess};
  }
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
  background: ${colors.adminTextColor};
  border-radius: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 350ms cubic-bezier(0.19, 1, 0.22, 1);

  &.red {
    background: ${colors.clRedError};
  }

  &.green {
    background: ${colors.clGreenSuccess};
  }
`;

const ProgressBarPercentage = styled.span`
  color: #fff;
  font-size: 14px;
  font-weight: 500;

  &.hidden {
    display: none;
  }
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
  white-space: nowrap;

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

const ManageBudgetButton = styled(Button)``;

const DropdownWrapper = styled.div`
  width: 100%;
  flex: 0 0 0px;
  position: relative;
  display: flex;
  justify-content: center;
`;

const SubmitExpensesButton = styled(Button)`
  margin-left: 10px;

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
}

interface Props extends InputProps, DataProps {}

interface State {
  dropdownOpened: boolean;
  submitState: 'clean' | 'dirty';
  processing: boolean;
}

class PBExpenses extends PureComponent<Props, State> {
  constructor(props) {
    super(props);
    this.state = {
      dropdownOpened: false,
      submitState: 'clean',
      processing: false
    };
  }

  componentDidUpdate(prevProps: Props) {
    const { basket } = this.props;
    const prevSubmittedAt = get(prevProps, 'basket.attributes.submitted_at', null);
    const submittedAt = get(basket, 'attributes.submitted_at', null);

    if ((prevProps.basket !== basket) && (prevSubmittedAt === submittedAt)) {
      this.setState({ submitState: 'dirty' });
    }
  }

  toggleExpensesDropdown = () => {
    this.setState(({ dropdownOpened }) => ({ dropdownOpened: !dropdownOpened }));
  }

  handleSubmitExpensesOnClick = () => {
    const { basket } = this.props;
    const now = moment().format();

    if (!isNilOrError(basket)) {
      this.setState({ processing: true });

      updateBasket(basket.id, {
        submitted_at: now
      }).then(() => {
        this.setState({ submitState: 'clean', processing: false });
      }).catch((_error) => {
        this.setState({ submitState: 'clean', processing: false });
      });
    }
  }

  render() {
    const { locale, tenant } = this.props;
    const { submitState, processing } = this.state;

    if (!isNilOrError(locale) && !isNilOrError(tenant)) {
      const { participationContextType, participationContextId, project, phase, basket, className } = this.props;
      const { dropdownOpened } = this.state;
      const currency = tenant.attributes.settings.core.currency;
      const spentBudget = (!isNilOrError(basket) ? basket.attributes.total_budget : 0);
      const budgetExceedsLimit = (!isNilOrError(basket) ? basket.attributes['budget_exceeds_limit?'] as boolean : false);
      const submittedAt = (!isNilOrError(basket) ? basket.attributes.submitted_at : null);
      let totalBudget = 0;
      let progress = 0;
      let validationStatus: 'notValidated' | 'validationSuccess' | 'validationError' = 'notValidated';
      let progressBarColor: 'green' | 'red' | '' = '';

      if (participationContextType === 'Project' && !isNilOrError(project)) {
        totalBudget = project.attributes.max_budget as number;
      } else if (participationContextType === 'Phase' && !isNilOrError(phase)) {
        totalBudget = phase.attributes.max_budget as number;
      }

      if (totalBudget > 0 && spentBudget > 0) {
        progress = round((spentBudget / totalBudget) * 100, 1);
      }

      if (budgetExceedsLimit) {
        validationStatus = 'validationError';
      } else if (submittedAt && submitState === 'clean' && !budgetExceedsLimit && spentBudget > 0) {
        validationStatus = 'validationSuccess';
      }

      if (validationStatus === 'validationSuccess' && submitState === 'clean') {
        progressBarColor = 'green';
      } else if (budgetExceedsLimit) {
        progressBarColor = 'red';
      }

      return (
        <Container className={className}>
          <InnerContainer>
            <Header>
              <Title className={validationStatus}>
                {validationStatus === 'notValidated' &&
                  <FormattedMessage {...messages.yourExpenses} />
                }
                {validationStatus === 'validationError' &&
                  <>
                    <TitleIcon name="error" />
                    <FormattedMessage {...messages.budgetExceeded} />
                  </>
                }
                {validationStatus === 'validationSuccess' &&
                  <>
                    <TitleIcon name="checkmark" />
                    <FormattedMessage {...messages.budgetValidated} />
                  </>
                }
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
              <ProgressBarOverlay
                className={progressBarColor}
                progress={budgetExceedsLimit ? 100 : progress}
              >
                <ProgressBarPercentage className={progress === 0 ? 'hidden' : ''}>{progress}%</ProgressBarPercentage>
              </ProgressBarOverlay>
            </ProgressBar>

            <Footer>
              <Budgets />
                <Budget>
                  <BudgetLabel>
                    <FormattedMessage {...messages.spentBudget} />:
                  </BudgetLabel>
                  <BudgetAmount className={progressBarColor}>
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
                      top="10px"
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
                  disabled={submitState === 'clean' || progress === 0 || budgetExceedsLimit}
                  processing={processing}
                >
                  <FormattedMessage {...messages.submitMyExpenses} />
                </SubmitExpensesButton>
              </Buttons>
            </Footer>
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
  }
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataProps => <PBExpenses {...inputProps} {...dataProps} />}
  </Data>
);
