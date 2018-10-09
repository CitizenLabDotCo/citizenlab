import React, { PureComponent, FormEvent } from 'react';

// components
import Button from 'components/UI/Button';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

// styling
import styled from 'styled-components';
import { darken } from 'polished';
import { colors, fontSizes, media } from 'utils/styleUtils';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: strech;
  padding: 30px;
  border-radius: 5px;
  box-shadow: 0px 0px 4px 0px rgba(0, 0, 0, 0.25);
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

const ProgressBarOverlay = styled.div`
  width: 25%;
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

const ManageBudgetButton = styled(Button)`
  margin-right: 10px;
`;

const SubmitExpensesButton = styled(Button)`
  ${media.smallerThanMinTablet`
    display: none;
  `}
`;

interface Props {}

interface State {}

class ExpensesBox extends PureComponent<Props, State> {

  handleManageBudgetOnClick = () => {

  }

  handleSubmitExpensesOnClick = () => {

  }

  render() {
    const className = this.props['className'];
    const totalBudget = '100$';
    const spentBudget = '100$';

    return (
      <Container className={className}>
        <Header>
          <Title>
            <FormattedMessage {...messages.yourExpenses} />
          </Title>
          <Spacer />
          <TotalBudgetDesktop>
            <BudgetLabel>
              <FormattedMessage {...messages.totalBudget} />:
            </BudgetLabel>
            <BudgetAmount>
              {totalBudget}
            </BudgetAmount>
          </TotalBudgetDesktop>
        </Header>

        <ProgressBar>
          <ProgressBarOverlay>
            <ProgressBarPercentage>25%</ProgressBarPercentage>
          </ProgressBarOverlay>
        </ProgressBar>

        <Footer>
          <Budgets />
            <Budget>
              <BudgetLabel>
                <FormattedMessage {...messages.spentBudget} />:
              </BudgetLabel>
              <BudgetAmount>
                {spentBudget}
              </BudgetAmount>
            </Budget>
            <TotalBudgetMobile>
              <BudgetLabel>
                <FormattedMessage {...messages.totalBudget} />:
              </BudgetLabel>
              <BudgetAmount>
                {totalBudget}
              </BudgetAmount>
            </TotalBudgetMobile>
          <Budgets />
          <Spacer />
          <Buttons>
            <ManageBudgetButton
              onClick={this.handleManageBudgetOnClick}
              icon="moneybag"
              textColor={colors.adminTextColor}
              bgColor="transparent"
              bgHoverColor="transparent"
              borderColor={colors.separation}
              borderThickness="2px"
            >
              <FormattedMessage {...messages.manageBudget} />
            </ManageBudgetButton>
            <SubmitExpensesButton
              onClick={this.handleSubmitExpensesOnClick}
              icon="submit"
              iconPos="right"
              bgColor={colors.adminTextColor}
            >
              <FormattedMessage {...messages.submitMyExpenses} />
            </SubmitExpensesButton>
          </Buttons>
        </Footer>
      </Container>
    );
  }
}

export default ExpensesBox;
