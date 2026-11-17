import React from 'react';

import { IconTooltip, colors } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import usePollOptions from 'api/poll_options/usePollOptions';

import { TextCell } from 'components/admin/ResourceList';

import IconButton from 'design-system/IconButton';

import { FormattedMessage, useIntl } from 'utils/cl-intl';

import messages from '../messages';
import { useIsPanelPoll } from '../PollVariantContext';

import styles from './PollQuestions.module.css';

const Indicator = styled(TextCell)`
  display: flex;
  color: ${colors.error};
`;

const StyledIconTooltip = styled(IconTooltip)`
  margin-right: 5px;
`;

interface Props {
  questionId: string;
}

const WrongOptionsIndicator = ({ questionId }: Props) => {
  const { data: options } = usePollOptions(questionId);
  const isPanel = useIsPanelPoll();
  const { formatMessage } = useIntl();

  if (isPanel) {
    if (!options || options.data.length > 1) return null;

    const isEmpty = options.data.length === 0;

    return (
      <div className={styles.indicator}>
        <IconButton
          icon="info-16"
          size={24}
          aria-label={formatMessage(
            isEmpty ? messages.noOptionsTooltip : messages.oneOptionsTooltip
          )}
        />
        <FormattedMessage
          {...(isEmpty ? messages.noOptions : messages.oneOption)}
        />
      </div>
    );
  }

  return options ? (
    options.data.length === 0 ? (
      <Indicator>
        <StyledIconTooltip
          content={<FormattedMessage {...messages.noOptionsTooltip} />}
        />
        <FormattedMessage {...messages.noOptions} />
      </Indicator>
    ) : options.data.length === 1 ? (
      <Indicator>
        <StyledIconTooltip
          content={<FormattedMessage {...messages.oneOptionsTooltip} />}
        />
        <FormattedMessage {...messages.oneOption} />
      </Indicator>
    ) : null
  ) : null;
};

export default WrongOptionsIndicator;
