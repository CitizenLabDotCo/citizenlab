import React from 'react';
import { isNilOrError } from 'utils/helperUtils';
import messages from '../messages';
import { FormattedMessage } from 'utils/cl-intl';
import { TextCell } from 'components/admin/ResourceList';
import styled from 'styled-components';
import usePollOptions from 'hooks/usePollOptions';
import { colors, IconTooltip } from '@citizenlab/cl2-component-library';

const StyledIconTooltip = styled(IconTooltip)`
  margin-right: 5px;
`;

const Indicator = styled(TextCell)<{ isWarning?: boolean }>`
  display: flex;
  color: ${({ isWarning }) => (isWarning ? colors.orange : colors.error)};
  margin-right: 15px;
`;

interface Props {
  questionId: string;
  maxAnswers: number | null;
}

const WrongMaxChoiceIndicator = ({ maxAnswers, questionId }: Props) => {
  const options = usePollOptions(questionId);

  if (isNilOrError(options) || typeof maxAnswers !== 'number') {
    return null;
  }

  return options.length < maxAnswers ? (
    <Indicator isWarning data-testid="wrongMaxChoiceIndicator">
      <StyledIconTooltip
        content={<FormattedMessage {...messages.maxOverTheMaxTooltip} />}
      />
      <FormattedMessage {...messages.wrongMax} />
    </Indicator>
  ) : null;
};

export default WrongMaxChoiceIndicator;
