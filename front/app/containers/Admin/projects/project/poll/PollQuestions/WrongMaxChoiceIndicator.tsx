import React from 'react';
import messages from '../messages';
import { FormattedMessage } from 'utils/cl-intl';
import { TextCell } from 'components/admin/ResourceList';
import styled from 'styled-components';
import usePollOptions from 'api/poll_options/usePollOptions';
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
  const { data: options } = usePollOptions(questionId);

  if (!options || typeof maxAnswers !== 'number') {
    return null;
  }

  return options.data.length < maxAnswers ? (
    <Indicator isWarning data-testid="wrongMaxChoiceIndicator">
      <StyledIconTooltip
        content={<FormattedMessage {...messages.maxOverTheMaxTooltip} />}
      />
      <FormattedMessage {...messages.wrongMax} />
    </Indicator>
  ) : null;
};

export default WrongMaxChoiceIndicator;
