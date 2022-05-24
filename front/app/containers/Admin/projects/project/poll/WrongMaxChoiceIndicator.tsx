import React from 'react';
import GetPollOptions, {
  GetPollOptionsChildProps,
} from 'resources/GetPollOptions';
import { adopt } from 'react-adopt';
import { isNilOrError } from 'utils/helperUtils';
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';
import { StyledIconTooltip, Indicator } from './WrongOptionsIndicator';
import styled from 'styled-components';

const StyledIndicator = styled(Indicator)`
  margin-right: 15px;
`;

interface InputProps {
  questionId: string;
  maxAnswers: number | null;
}

interface DataProps {
  options: GetPollOptionsChildProps;
}

interface Props extends InputProps, DataProps {}

export const WrongMaxChoiceIndicator = ({ options, maxAnswers }: Props) =>
  typeof maxAnswers === 'number' && maxAnswers < 2 ? (
    <StyledIndicator>
      <StyledIconTooltip
        content={<FormattedMessage {...messages.maxUnderTheMinTooltip} />}
      />
      <FormattedMessage {...messages.wrongMax} />
    </StyledIndicator>
  ) : !isNilOrError(options) && maxAnswers && options.length < maxAnswers ? (
    <StyledIndicator isWarning>
      <StyledIconTooltip
        content={<FormattedMessage {...messages.maxOverTheMaxTooltip} />}
      />
      <FormattedMessage {...messages.wrongMax} />
    </StyledIndicator>
  ) : null;

const Data = adopt<DataProps, InputProps>({
  options: ({ questionId, render }) => (
    <GetPollOptions questionId={questionId}>{render}</GetPollOptions>
  ),
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {(dataprops) => <WrongMaxChoiceIndicator {...inputProps} {...dataprops} />}
  </Data>
);
