import React, { PureComponent } from 'react';
import { adopt } from 'react-adopt';
import { isNilOrError } from 'utils/helperUtils';
import { get, round } from 'lodash-es';
import moment from 'moment';
import bowser from 'bowser';

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

// tracking
import { injectTracks } from 'utils/analytics';
import tracks from './tracks';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import { FormattedNumber } from 'react-intl';
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
  border-radius: ${(props: any) => props.theme.borderRadius};
  background: #fff;
  border: solid 1px ${colors.separation};

  ${media.smallerThanMaxTablet`
    padding: 20px;
  `}
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
  height: 18px;
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
  margin-bottom: 10px;
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
  border-radius: ${(props: any) => props.theme.borderRadius};
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
  border-radius: ${(props: any) => props.theme.borderRadius};
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
  font-weight: 600;

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
  display: flex;
  flex-direction: column;
`;

const TotalBudgetDesktop = styled(Budget)`
  white-space: nowrap;

  ${media.smallerThanMinTablet`
    display: none;
  `}
`;

const TotalBudgetMobile = styled(Budget)`
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

interface Tracks {
  ideaRemovedFromBasket: () => void;
  ideaAddedToBasket: () => void;
  basketSubmitted: () => void;
  expensesDropdownOpened: () => void;
}

interface Props extends InputProps, DataProps {}

interface State {
  dropdownOpened: boolean;
  processing: boolean;
}

class PBExpenses extends PureComponent<Props & Tracks, State> {
  constructor(props) {
    super(props);
    this.state = {
      dropdownOpened: false,
      processing: false
    };
  }

  toggleExpensesDropdown = () => {
    this.setState(({ dropdownOpened }) => {
      if (!dropdownOpened) {
        this.props.expensesDropdownOpened();
      }

      return { dropdownOpened: !dropdownOpened };
    });
  }

  handleSubmitExpensesOnClick = async () => {
    const { basket } = this.props;

    if (!isNilOrError(basket)) {
      const now = moment().format();
      this.setState({ processing: true });
      await updateBasket(basket.id, { submitted_at: now });
      this.props.basketSubmitted();
      this.setState({ processing: false });
    }
  }

  render() {
    const { locale, tenant, participationContextType, participationContextId, project, phase, basket, className } = this.props;
    const { processing, dropdownOpened } = this.state;

    if (!isNilOrError(locale) &&
        !isNilOrError(tenant) &&
        (
          (participationContextType === 'Project' && !isNilOrError(project)) ||
          (participationContextType === 'Phase' && !isNilOrError(phase))
        )
    ) {
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
      } else if (submittedAt && spentBudget > 0) {
        validationStatus = 'validationSuccess';
      }

      if (validationStatus === 'validationSuccess') {
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
                  <FormattedNumber
                    value={totalBudget}
                    style="currency"
                    currency={currency}
                    minimumFractionDigits={0}
                    maximumFractionDigits={0}
                  />
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
              <Budgets>
                <Budget>
                  <BudgetLabel>
                    <FormattedMessage {...messages.spentBudget} />:
                  </BudgetLabel>
                  <BudgetAmount className={progressBarColor}>
                    <FormattedNumber
                      value={spentBudget}
                      style="currency"
                      currency={currency}
                      minimumFractionDigits={0}
                      maximumFractionDigits={0}
                    />
                  </BudgetAmount>
                </Budget>
                <TotalBudgetMobile>
                  <BudgetLabel>
                    <FormattedMessage {...messages.totalBudget} />:
                  </BudgetLabel>
                  <BudgetAmount>
                    <FormattedNumber
                      value={totalBudget}
                      style="currency"
                      currency={currency}
                      minimumFractionDigits={0}
                      maximumFractionDigits={0}
                    />
                  </BudgetAmount>
                </TotalBudgetMobile>
              </Budgets>
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
                      left={bowser.msie ? '-5px' : 'auto'}
                      mobileWidth="250px"
                      mobileLeft="-5px"
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
                  disabled={validationStatus === 'validationSuccess' || budgetExceedsLimit || spentBudget === 0}
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
      basketId = (!isNilOrError(project) && project.relationships.user_basket ? get(project.relationships.user_basket.data, 'id', null) : null);
    } else {
      basketId = (!isNilOrError(phase) && phase.relationships.user_basket ? get(phase.relationships.user_basket.data, 'id', null) : null);
    }

    return <GetBasket id={basketId}>{render}</GetBasket>;
  }
});

const PBExpensesWithHoCs = injectTracks<Props>({
  ideaRemovedFromBasket: tracks.ideaRemovedFromBasket,
  ideaAddedToBasket: tracks.ideaAddedToBasket,
  basketSubmitted: tracks.basketSubmitted,
  expensesDropdownOpened: tracks.expensesDropdownOpened
})(PBExpenses);

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataProps => <PBExpensesWithHoCs {...inputProps} {...dataProps} />}
  </Data>
);
