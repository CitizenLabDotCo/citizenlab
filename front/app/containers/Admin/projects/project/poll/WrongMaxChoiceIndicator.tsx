import React from 'react';
import { isNilOrError } from 'utils/helperUtils';
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';
import { StyledIconTooltip, Indicator } from './WrongOptionsIndicator';
import styled from 'styled-components';
import usePollOptions from 'hooks/usePollOptions';

const StyledIndicator = styled(Indicator)`
  margin-right: 15px;
`;

interface Props {
  questionId: string;
  maxAnswers: number | null;
}

const WrongMaxChoiceIndicator = ({ maxAnswers, questionId }: Props) => {
  const options = usePollOptions(questionId);

  if (typeof maxAnswers === 'number') {
    return maxAnswers < 2 ? (
      <StyledIndicator>
        <StyledIconTooltip
          content={<FormattedMessage {...messages.maxUnderTheMinTooltip} />}
        />
        <FormattedMessage {...messages.wrongMax} />
      </StyledIndicator>
    ) : !isNilOrError(options) && options.length < maxAnswers ? (
      <StyledIndicator isWarning>
        <StyledIconTooltip
          content={<FormattedMessage {...messages.maxOverTheMaxTooltip} />}
        />
        <FormattedMessage {...messages.wrongMax} />
      </StyledIndicator>
    ) : null;
  }

  return null;
};

export default WrongMaxChoiceIndicator;
