import React from 'react';

import { colors, IconTooltip } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import usePollOptions from 'api/poll_options/usePollOptions';

import IconButton from 'design-system/IconButton';

import { TextCell } from 'components/admin/ResourceList';

import { FormattedMessage, useIntl } from 'utils/cl-intl';

import messages from '../messages';
import { useIsPanelPoll } from '../PollVariantContext';

import styles from './PollQuestions.module.css';

const StyledIconTooltip = styled(IconTooltip)`
  margin-right: 5px;
`;

const Indicator = styled(TextCell)<{ isWarning?: boolean }>`
  display: flex;
  color: ${({ isWarning }) => (isWarning ? colors.orange500 : colors.error)};
  margin-right: 15px;
`;

interface Props {
  questionId: string;
  maxAnswers: number | null;
}

const WrongMaxChoiceIndicator = ({ maxAnswers, questionId }: Props) => {
  const { data: options } = usePollOptions(questionId);
  const isPanel = useIsPanelPoll();
  const { formatMessage } = useIntl();

  if (!options || typeof maxAnswers !== 'number') {
    return null;
  }

  if (isPanel) {
    return options.data.length < maxAnswers ? (
      <div
        className={`${styles.indicator} ${styles.warning} ${styles.maxChoiceIndicator}`}
        data-testid="wrongMaxChoiceIndicator"
      >
        <IconButton
          icon="info-16"
          size={24}
          aria-label={formatMessage(messages.maxOverTheMaxTooltip)}
        />
        <FormattedMessage {...messages.wrongMax} />
      </div>
    ) : null;
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
