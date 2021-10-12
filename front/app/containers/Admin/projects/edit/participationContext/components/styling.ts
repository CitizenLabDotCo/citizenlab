// components
import { Input, Radio, Label, Select } from 'cl2-component-library';
import Error from 'components/UI/Error';
import Warning from 'components/UI/Warning';
import { Section, SectionField } from 'components/admin/Section';

// style
import styled from 'styled-components';
import { fontSizes, colors } from 'utils/styleUtils';

export const Container = styled.div``;

export const StyledSection = styled(Section)`
  margin-bottom: 0;
`;

export const StyledSectionField = styled(SectionField)`
  width: 100%;
`;

const Row = styled.div`
  display: flex;
  flex-direction: row;
`;

export const ToggleRow = styled(Row)`
  width: 100%;
  max-width: 288px;
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;

  &.last {
    margin-bottom: 0px;
  }
`;

export const ToggleLabel = styled(Label)`
  flex: 1;
  color: #333;
  font-size: ${fontSizes.base}px;
  font-weight: 400;
  margin-right: 15px;
`;

export const VotingLimitInput = styled(Input)`
  width: 100px;
  height: 46px !important;
`;

export const BudgetingAmountInput = styled(Input)`
  max-width: 288px;
`;

export const BudgetingAmountInputError = styled(Error)`
  max-width: 288px;
`;

export const StyledA = styled.a`
  &:hover {
    text-decoration: underline;
  }
`;

export const StyledRadio = styled(Radio)`
  margin-bottom: 25px;
`;

export const LabelText = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: -2px;

  &.disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .header {
    padding: 0;
    margin: 0;
    margin-bottom: 3px;
    font-weight: 600;
    font-size: ${fontSizes.base}px;
  }

  .description {
    color: ${colors.adminSecondaryTextColor};
  }
`;

export const StyledWarning = styled(Warning)`
  margin-bottom: 20px;
`;

export const StyledSelect = styled(Select)`
  max-width: 288px;
`;

export const LabelWrapper = styled.div`
  display: flex;
`;
