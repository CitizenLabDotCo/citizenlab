import {
  Input,
  Radio,
  fontSizes,
  colors,
  stylingConsts,
} from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import { Section, SectionField } from 'components/admin/Section';
import Error, { ErrorProps } from 'components/UI/Error';
import Warning, { Props as WarningProps } from 'components/UI/Warning';

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

export const ReactingLimitInput = styled(Input)`
  width: 100px;
  height: ${stylingConsts.inputHeight}px !important;
`;

export const BudgetingAmountInput = styled(Input)`
  max-width: 288px;
`;

export const VotingAmountInputError = styled(Error)<ErrorProps>`
  max-width: 400px;
`;

export const StyledA = styled.a`
  &:hover {
    text-decoration: underline;
  }
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
    color: ${colors.textSecondary};
  }
`;

export const StyledWarning = styled(Warning)<WarningProps>`
  margin-bottom: 20px;
`;

export const LabelWrapper = styled.div`
  display: flex;
`;

export const SurveyServiceRadio = styled(Radio)`
  margin-bottom 14px;
`;
