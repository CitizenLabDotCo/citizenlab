import React, { useState } from 'react';
import { isNilOrError } from 'utils/helperUtils';
import { round } from 'lodash-es';
import moment from 'moment';
import Tippy from '@tippyjs/react';

// services
import { updateBasket } from 'services/baskets';

// typings
import { IParticipationContextType } from 'typings';

// components
import Button from 'components/UI/Button';
import { Icon } from 'cl2-component-library';
import PBBasket from './PBBasket';
import ButtonWithDropdown from 'components/UI/ButtonWithDropdown';

// tracking
import { trackEventByName } from 'utils/analytics';
import tracks from './tracks';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import injectIntl from 'utils/cl-intl/injectIntl';
import messages from 'containers/ProjectsShowPage/messages';
import FormattedBudget from 'utils/currency/FormattedBudget';

// styling
import styled from 'styled-components';
import { colors, fontSizes, defaultCardStyle } from 'utils/styleUtils';
import { ScreenReaderOnly } from 'utils/a11y';

// a11y
import { LiveMessage } from 'react-aria-live';

// hooks
import useAppConfiguration from 'hooks/useAppConfiguration';
import useBasket from 'hooks/useBasket';
import useProject from 'hooks/useProject';
import usePhase from 'hooks/usePhase';
import useLocale from 'hooks/useLocale';

const Container = styled.div`
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

const TitleIcon = styled(Icon)<{ viewMode?: 'row' | 'column' }>`
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

const BudgetItem = styled(Budget)<{ isLastBudgetItem: boolean }>`
  ${({ isLastBudgetItem }) => !isLastBudgetItem && `margin-bottom: 10px;`}
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
  border: solid 1px #e0e0e0;
  background: repeating-linear-gradient(
    -45deg,
    #f8f8f8,
    #f8f8f8 10px,
    #e8e8e8 10px,
    #e8e8e8 20px
  );

  ${({ viewMode }) =>
    viewMode === 'column' &&
    `
    margin-top: 15px;
    margin-bottom: 15px;
  `}
`;

const ProgressBarOverlay: any = styled.div`
  width: ${(props: any) => props.progress}%;
  height: 100%;
  background: ${colors.label};
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
  margin-bottom: 30px;
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

const ManageBudgetButtonWithDropdown = styled(ButtonWithDropdown)`
  min-width: 200px;
  z-index: 900;
`;

const SubmitExpensesButton = styled(Button)<{ viewMode: 'row' | 'column' }>`
  margin-left: 10px;

  ${({ viewMode }) =>
    viewMode === 'column' &&
    `
    margin-left: 0px;
    margin-top: 12px;
  `}
`;

const TooltipContent = styled.div`
  display: flex;
  align-items: center;
  padding: 10px 4px 10px 10px;
`;

const TooltipContentIcon = styled(Icon)`
  flex: 0 0 25px;
  width: 20px;
  height: 25px;
  margin-right: 1rem;
`;

const TooltipContentText = styled.div`
  flex: 1 1 auto;
  color: ${({ theme }) => theme.colorText};
  font-size: ${fontSizes.base}px;
  line-height: normal;
  font-weight: 400;
  overflow-wrap: break-word;
  word-wrap: break-word;
  word-break: break-word;
`;

interface Props {
  participationContextId: string | null;
  participationContextType: IParticipationContextType;
  viewMode: 'row' | 'column';
  className?: string;
}

const PBExpenses = ({
  participationContextType,
  participationContextId,
  className,
  viewMode,
  intl: { formatMessage },
}: Props & InjectedIntlProps) => {
  const [processing, setProcessing] = useState(false);
  const locale = useLocale();
  const appConfiguration = useAppConfiguration();
  const project = useProject({
    projectId:
      participationContextType === 'project' ? participationContextId : null,
  });
  const phase = usePhase(
    participationContextType === 'phase' ? participationContextId : null
  );
  function getBasketId() {
    let basketId: string | null = null;

    if (participationContextType === 'project') {
      basketId = !isNilOrError(project)
        ? project.relationships.user_basket?.data?.id || null
        : null;
    } else {
      basketId = !isNilOrError(phase)
        ? phase.relationships.user_basket?.data?.id || null
        : null;
    }

    return basketId;
  }
  const basketId = getBasketId();
  const basket = useBasket(basketId);

  const handleSubmitExpensesOnClick = async () => {
    if (!isNilOrError(basket)) {
      const now = moment().format();
      setProcessing(true);
      try {
        await updateBasket(basket.id, { submitted_at: now });
      } catch {
        // Do nothing
      }
      trackEventByName(tracks.basketSubmitted);
      setProcessing(false);
    }
  };

  if (
    !isNilOrError(locale) &&
    !isNilOrError(appConfiguration) &&
    ((participationContextType === 'project' && !isNilOrError(project)) ||
      (participationContextType === 'phase' && !isNilOrError(phase)))
  ) {
    const currency = appConfiguration.data.attributes.settings.core.currency;
    const spentBudget = !isNilOrError(basket)
      ? basket.attributes.total_budget
      : 0;
    const budgetExceedsLimit = !isNilOrError(basket)
      ? (basket.attributes['budget_exceeds_limit?'] as boolean)
      : false;
    const submittedAt = !isNilOrError(basket)
      ? basket.attributes.submitted_at
      : null;
    let minBudget = 0;
    let maxBudget = 0;
    let progress = 0;
    let validationStatus:
      | 'notValidated'
      | 'validationSuccess'
      | 'validationError' = 'notValidated';
    let validationStatusMessage = '';
    let progressBarColor: 'green' | 'red' | '' = '';

    if (participationContextType === 'project' && !isNilOrError(project)) {
      if (typeof project.attributes.min_budget === 'number') {
        minBudget = project.attributes.min_budget;
      }
      if (typeof project.attributes.max_budget === 'number') {
        maxBudget = project.attributes.max_budget;
      }
    } else if (participationContextType === 'phase' && !isNilOrError(phase)) {
      if (typeof phase.attributes.min_budget === 'number') {
        minBudget = phase.attributes.min_budget;
      }
      if (typeof phase.attributes.max_budget === 'number') {
        maxBudget = phase.attributes.max_budget;
      }
    }

    if (maxBudget > 0 && spentBudget > 0) {
      progress = round((spentBudget / maxBudget) * 100, 1);
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
      validationStatusMessage = formatMessage(messages.selectionExceedsBudget);
    } else if (validationStatus === 'validationSuccess') {
      validationStatusMessage = formatMessage(messages.basketSubmitted);
    }

    const minBudgetRequired = minBudget > 0;
    const minBudgetReached = spentBudget >= minBudget;
    const minBudgetRequiredNotReached = minBudgetRequired && !minBudgetReached;
    const minBudgetRequiredReached = minBudgetRequired && minBudgetReached;
    const showMinRequiredBudget = minBudgetRequired && minBudget < maxBudget;
    const showFixedRequiredBudget =
      minBudgetRequired && minBudget === maxBudget;

    const maxBudgetCopy = (
      <FormattedMessage
        {...(showFixedRequiredBudget
          ? messages.requiredSelection
          : messages.yourBudget)}
      />
    );
    return (
      <Container className={`e2e-pb-expenses-box ${className || ''}`}>
        <InnerContainer>
          <Header>
            <Title className={validationStatus}>
              {validationStatus === 'notValidated' && (
                <>
                  <TitleIcon name="basket" ariaHidden />
                  <FormattedMessage {...messages.myBasket} />
                </>
              )}
              {validationStatus === 'validationError' && (
                <>
                  <TitleIcon name="error" ariaHidden viewMode={viewMode} />
                  {showFixedRequiredBudget ? (
                    <FormattedMessage {...messages.requiredSelectionExceeded} />
                  ) : (
                    <FormattedMessage {...messages.selectionExceedsBudget} />
                  )}
                </>
              )}
              {validationStatus === 'validationSuccess' && (
                <>
                  <TitleIcon name="checkmark" ariaHidden viewMode={viewMode} />
                  <FormattedMessage {...messages.basketSubmitted} />
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
                <BudgetLabel>{maxBudgetCopy}:</BudgetLabel>
                <BudgetAmount className={budgetExceedsLimit ? 'red' : ''}>
                  <FormattedBudget value={maxBudget} />
                </BudgetAmount>
              </TotalBudget>
            )}
          </Header>

          <ProgressBar aria-hidden viewMode={viewMode}>
            <ProgressBarOverlay
              className={progressBarColor}
              progress={budgetExceedsLimit ? 100 : progress}
            >
              <ProgressBarPercentage className={progress === 0 ? 'hidden' : ''}>
                {progress}%
              </ProgressBarPercentage>
            </ProgressBarOverlay>
          </ProgressBar>

          <Footer viewMode={viewMode}>
            {viewMode === 'column' && (
              <TotalBudgetColumn aria-hidden>
                <BudgetLabel>{maxBudgetCopy}:</BudgetLabel>
                <BudgetAmount>
                  <FormattedBudget value={maxBudget} />
                </BudgetAmount>
              </TotalBudgetColumn>
            )}
            <Budgets>
              <BudgetItem
                aria-hidden
                isLastBudgetItem={
                  !showMinRequiredBudget || showFixedRequiredBudget
                }
              >
                <BudgetLabel>
                  <FormattedMessage {...messages.addedToBasket} />:
                </BudgetLabel>
                <BudgetAmount className={progressBarColor}>
                  <FormattedBudget value={spentBudget} />
                </BudgetAmount>
              </BudgetItem>
              {showMinRequiredBudget && (
                <BudgetItem aria-hidden isLastBudgetItem>
                  <BudgetLabel>
                    <FormattedMessage {...messages.minBudgetRequired} />:
                  </BudgetLabel>
                  <BudgetAmount
                    className={minBudgetRequiredNotReached ? 'red' : ''}
                  >
                    <FormattedBudget value={minBudget} />
                  </BudgetAmount>
                </BudgetItem>
              )}
              {/*
                  Only the dynamic value (spentBudget) is in an aria-live box
                  to reduce information overload on every update for screen readers
                */}
              <ScreenReaderOnly>
                {maxBudgetCopy}:
                <FormattedBudget value={maxBudget} />
              </ScreenReaderOnly>
              <ScreenReaderOnly aria-live="polite">
                <FormattedMessage {...messages.addedToBasket} />:
                {`${spentBudget} ${currency}`}
                <ScreenReaderOnly>
                  {showMinRequiredBudget && (
                    <>
                      <FormattedMessage {...messages.minBudgetRequired} />:
                      {`${minBudget} ${currency}`}
                    </>
                  )}
                </ScreenReaderOnly>
              </ScreenReaderOnly>
            </Budgets>
            <Spacer />
            <Buttons viewMode={viewMode}>
              <ManageBudgetButtonWithDropdown
                buttonComponent={
                  <ManageBudgetButton
                    iconAriaHidden
                    buttonStyle="white"
                    borderColor="#ccc"
                    boxShadow="none"
                    boxShadowHover="none"
                  >
                    <FormattedMessage {...messages.manageBasket} />
                  </ManageBudgetButton>
                }
                dropdownContent={
                  <PBBasket
                    participationContextType={participationContextType}
                    participationContextId={participationContextId}
                  />
                }
                trackName={tracks.expensesDropdownOpened}
              />

              <Tippy
                disabled={!minBudgetRequired || minBudgetRequiredReached}
                interactive={true}
                placement="bottom"
                content={
                  <TooltipContent>
                    <TooltipContentIcon name="lock-outlined" ariaHidden />
                    <TooltipContentText>
                      <FormattedMessage
                        // This will only show when there's a min budget that is not reached,
                        // so there are only two options: (1) min = max budget (aka fixed selection)
                        // then we show the first message
                        // (2) min budget < max budget we show the second
                        // (We can be sure here that min budget is not bigger than max budget)
                        {...(showFixedRequiredBudget
                          ? messages.meetMinSelectionRequirement
                          : messages.meetMinBudgetRequirement)}
                      />
                    </TooltipContentText>
                  </TooltipContent>
                }
                theme="light"
                hideOnClick={false}
              >
                <div>
                  <SubmitExpensesButton
                    onClick={handleSubmitExpensesOnClick}
                    bgColor={colors.adminTextColor}
                    disabled={
                      validationStatus === 'validationSuccess' ||
                      budgetExceedsLimit ||
                      spentBudget === 0 ||
                      minBudgetRequiredNotReached
                    }
                    processing={processing}
                    viewMode={viewMode}
                  >
                    <FormattedMessage {...messages.submitMyBasket} />
                  </SubmitExpensesButton>
                </div>
              </Tippy>
            </Buttons>
          </Footer>
        </InnerContainer>
      </Container>
    );
  }

  return null;
};
export default injectIntl(PBExpenses);
