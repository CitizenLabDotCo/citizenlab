import React, { PureComponent } from 'react';
import { adopt } from 'react-adopt';
import { isNilOrError } from 'utils/helperUtils';
import { get, round } from 'lodash-es';
import moment from 'moment';

// services
import { updateBasket } from 'services/baskets';

// typings
import { IParticipationContextType } from 'typings';

// resources
import GetLocale, { GetLocaleChildProps } from 'resources/GetLocale';
import GetAppConfiguration, { GetTenantChildProps } from 'resources/GetTenant';
import GetBasket, { GetBasketChildProps } from 'resources/GetBasket';
import GetProject, { GetProjectChildProps } from 'resources/GetProject';
import GetPhase, { GetPhaseChildProps } from 'resources/GetPhase';

// components
import Button from 'components/UI/Button';
import { Icon } from 'cl2-component-library';
import PBBasket from './PBBasket';
import ButtonWithDropdown from 'components/UI/ButtonWithDropdown';

// tracking
import { injectTracks } from 'utils/analytics';
import tracks from './tracks';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import { FormattedNumber, InjectedIntlProps } from 'react-intl';
import injectIntl from 'utils/cl-intl/injectIntl';
import messages from 'containers/ProjectsShowPage/messages';

// styling
import styled from 'styled-components';
import { colors, fontSizes, defaultCardStyle } from 'utils/styleUtils';
import { ScreenReaderOnly } from 'utils/a11y';

// a11y
import { LiveMessage } from 'react-aria-live';

const Container = styled.div`
  background: #fff;
  padding: 20px;
  ${defaultCardStyle};
`;

const InnerContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Title = styled.h2`
  min-height: 20px;
  color: ${(props: any) => props.theme.colorText};
  font-size: ${fontSizes.large}px;
  line-height: normal;
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

const TitleIcon = styled(Icon)<{ viewMode: 'row' | 'column' }>`
  flex: 0 0 18px;
  height: 18px;
  margin-right: 10px;

  ${({ viewMode }) =>
    viewMode === 'column' &&
    `
    display: none;
  `}
`;

const Spacer = styled.div`
  flex: 1;
`;

const Budget = styled.div`
  color: ${(props: any) => props.theme.colorText};
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
  font-weight: 600;

  &.red {
    color: ${colors.clRedError};
  }

  &.green {
    color: ${colors.clGreenSuccess};
  }
`;

const ProgressBar = styled.div<{ viewMode: 'row' | 'column' }>`
  width: 100%;
  height: 30px;
  border-radius: ${(props: any) => props.theme.borderRadius};
  margin-top: 30px;
  margin-bottom: 30px;
  background: repeating-linear-gradient(
    -45deg,
    #eff1f2,
    #eff1f2 10px,
    #e6e9ec 10px,
    #e6e9ec 20px
  );

  ${({ viewMode }) =>
    viewMode === 'column' &&
    `
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

const Footer = styled.div<{ viewMode: 'row' | 'column' }>`
  display: flex;

  ${({ viewMode }) =>
    viewMode === 'row' &&
    `
    align-items: center;
  `}

  ${({ viewMode }) =>
    viewMode === 'column' &&
    `
    flex-direction: column;
  `}
`;

const Budgets = styled.div`
  display: flex;
  flex-direction: column;
`;

const TotalBudget = styled(Budget)`
  white-space: nowrap;
`;

const TotalBudgetColumn = styled(Budget)`
  margin-top: 10px;
`;

const Buttons = styled.div<{ viewMode: 'row' | 'column' }>`
  display: flex;

  ${({ viewMode }) =>
    viewMode === 'column' &&
    `
    margin-top: 20px;
    flex-direction: column;
  `}
`;

const ManageBudgetButton = styled(Button)``;

const ManageBudgetButtonWithDropdown = styled(ButtonWithDropdown)``;

const SubmitExpensesButton = styled(Button)<{ viewMode: 'row' | 'column' }>`
  margin-left: 10px;

  ${({ viewMode }) =>
    viewMode === 'column' &&
    `
    margin-left: 0px;
    margin-top: 12px;
  `}
`;

interface InputProps {
  participationContextId: string | null;
  participationContextType: IParticipationContextType;
  viewMode: 'row' | 'column';
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
}

interface Props extends InputProps, DataProps {}

interface State {
  processing: boolean;
}

class PBExpenses extends PureComponent<
  Props & InjectedIntlProps & Tracks,
  State
> {
  constructor(props) {
    super(props);
    this.state = {
      processing: false,
    };
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
  };

  render() {
    const {
      locale,
      tenant,
      participationContextType,
      participationContextId,
      project,
      phase,
      basket,
      className,
      viewMode,
      intl: { formatMessage },
    } = this.props;
    const { processing } = this.state;

    if (
      !isNilOrError(locale) &&
      !isNilOrError(tenant) &&
      ((participationContextType === 'project' && !isNilOrError(project)) ||
        (participationContextType === 'phase' && !isNilOrError(phase)))
    ) {
      const currency = tenant.attributes.settings.core.currency;
      const spentBudget = !isNilOrError(basket)
        ? basket.attributes.total_budget
        : 0;
      const budgetExceedsLimit = !isNilOrError(basket)
        ? (basket.attributes['budget_exceeds_limit?'] as boolean)
        : false;
      const submittedAt = !isNilOrError(basket)
        ? basket.attributes.submitted_at
        : null;
      let totalBudget = 0;
      let progress = 0;
      let validationStatus:
        | 'notValidated'
        | 'validationSuccess'
        | 'validationError' = 'notValidated';
      let validationStatusMessage: string = '';
      let progressBarColor: 'green' | 'red' | '' = '';

      if (participationContextType === 'project' && !isNilOrError(project)) {
        totalBudget = project.attributes.max_budget as number;
      } else if (participationContextType === 'phase' && !isNilOrError(phase)) {
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

      if (validationStatus === 'validationError') {
        validationStatusMessage = formatMessage(messages.budgetExceeded);
      } else if (validationStatus === 'validationSuccess') {
        validationStatusMessage = formatMessage(messages.budgetValidated);
      }

      return (
        <Container className={`e2e-pb-expenses-box ${className || ''}`}>
          <InnerContainer>
            <Header>
              <Title className={validationStatus}>
                {validationStatus === 'notValidated' && (
                  <FormattedMessage {...messages.myExpenses} />
                )}
                {validationStatus === 'validationError' && (
                  <>
                    <TitleIcon name="error" ariaHidden viewMode={viewMode} />
                    <FormattedMessage {...messages.budgetExceeded} />
                  </>
                )}
                {validationStatus === 'validationSuccess' && (
                  <>
                    <TitleIcon
                      name="checkmark"
                      ariaHidden
                      viewMode={viewMode}
                    />
                    <FormattedMessage {...messages.budgetValidated} />
                  </>
                )}
                <LiveMessage
                  message={validationStatusMessage}
                  aria-live="polite"
                />
              </Title>
              <Spacer />
              {viewMode === 'row' && (
                <TotalBudget aria-hidden>
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
                </TotalBudget>
              )}
            </Header>

            <ProgressBar aria-hidden viewMode={viewMode}>
              <ProgressBarOverlay
                className={progressBarColor}
                progress={budgetExceedsLimit ? 100 : progress}
              >
                <ProgressBarPercentage
                  className={progress === 0 ? 'hidden' : ''}
                >
                  {progress}%
                </ProgressBarPercentage>
              </ProgressBarOverlay>
            </ProgressBar>

            <Footer viewMode={viewMode}>
              <Budgets>
                <Budget aria-hidden>
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
                {viewMode === 'column' && (
                  <TotalBudgetColumn aria-hidden>
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
                  </TotalBudgetColumn>
                )}
                <ScreenReaderOnly aria-live="polite">
                  <FormattedMessage {...messages.totalBudget} />:
                  {`${totalBudget} ${currency}`}
                  <FormattedMessage {...messages.spentBudget} />:
                  {`${spentBudget} ${currency}`}
                </ScreenReaderOnly>
              </Budgets>
              <Spacer />
              <Buttons viewMode={viewMode}>
                <ManageBudgetButtonWithDropdown
                  buttonComponent={
                    <ManageBudgetButton
                      icon="basket"
                      iconAriaHidden
                      buttonStyle="primary-inverse"
                      borderColor={colors.separation}
                      bgColor="transparent"
                      borderThickness="2px"
                    >
                      <FormattedMessage {...messages.manageBudget} />
                    </ManageBudgetButton>
                  }
                  dropdownContent={
                    <PBBasket
                      participationContextType={participationContextType}
                      participationContextId={participationContextId}
                    />
                  }
                  trackName={tracks.expensesDropdownOpened.name}
                />

                <SubmitExpensesButton
                  onClick={this.handleSubmitExpensesOnClick}
                  icon="submit"
                  bgColor={colors.adminTextColor}
                  disabled={
                    validationStatus === 'validationSuccess' ||
                    budgetExceedsLimit ||
                    spentBudget === 0
                  }
                  processing={processing}
                  viewMode={viewMode}
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
  tenant: <GetAppConfiguration />,
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
});

const PBExpensesWithHoCs = injectIntl(
  injectTracks<Props>({
    ideaRemovedFromBasket: tracks.ideaRemovedFromBasket,
    ideaAddedToBasket: tracks.ideaAddedToBasket,
    basketSubmitted: tracks.basketSubmitted,
  })(PBExpenses)
);

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {(dataProps) => <PBExpensesWithHoCs {...inputProps} {...dataProps} />}
  </Data>
);
