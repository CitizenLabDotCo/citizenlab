import React from 'react';

// components
import { Icon } from '@citizenlab/cl2-component-library';
import { ScreenReaderOnly } from 'utils/a11y';

// i18n
import { useIntl } from 'utils/cl-intl';
import messages from '../../messages';

// styling
import styled from 'styled-components';
import { colors, fontSizes, isRtl } from 'utils/styleUtils';
import { lighten } from 'polished';

const Container = styled.li`
  display: flex;
  align-items: center;
  list-style: none;
  margin: 0;
  margin-left: 1px;
  padding: 0;
`;

const UpvoteIcon = styled(Icon)`
  fill: ${colors.textSecondary};
  flex: 0 0 20px;
  width: 20px;
  height: 20px;
`;

const ButtonWrapper = styled.button`
  color: ${colors.textSecondary};
  font-size: ${fontSizes.s}px;
  font-weight: 400;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  margin: 0;
  padding: 0;
  border: none;
  cursor: pointer;

  &.disabled {
    cursor: auto;
  }

  &.enabled:not(.voted):hover {
    color: #000;

    ${UpvoteIcon} {
      fill: #000;
    }
  }

  &.enabled.voted {
    color: ${colors.success};

    ${UpvoteIcon} {
      fill: ${colors.success};
    }
  }

  &.disabled:not(.voted) {
    color: ${lighten(0.25, colors.textSecondary)};

    ${UpvoteIcon} {
      fill: ${lighten(0.25, colors.textSecondary)};
    }
  }

  &.disabled.voted {
    color: ${lighten(0.25, colors.success)};

    ${UpvoteIcon} {
      fill: ${lighten(0.25, colors.success)};
    }
  }
`;

const UpvoteCount = styled.div`
  margin-left: 6px;
  ${isRtl`
    margin-right: 6px;
    margin-left: auto;
  `}
`;

interface Props {
  className?: string;
  disabled: boolean;
  voted: boolean;
  upvoteCount: number;
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

const UpvoteButton = ({
  className,
  disabled,
  voted,
  upvoteCount,
  onClick,
}: Props) => {
  const { formatMessage } = useIntl();

  return (
    <Container
      id="e2e-comment-upvote-button"
      className={`vote ${className || ''}`}
    >
      <ButtonWrapper
        onClick={onClick}
        disabled={disabled}
        className={`
          e2e-comment-vote
          ${voted ? 'voted' : 'notVoted'}
          ${disabled ? 'disabled' : 'enabled'}
        `}
      >
        <>
          <UpvoteIcon
            name="vote-up"
            className={`
            ${voted ? 'voted' : 'notVoted'}
            ${disabled ? 'disabled' : 'enabled'}
          `}
          />
          <ScreenReaderOnly>
            {!voted
              ? formatMessage(messages.upvoteComment)
              : formatMessage(messages.a11y_undoUpvote)}
          </ScreenReaderOnly>
        </>
        {upvoteCount > 0 && (
          <UpvoteCount
            className={`
          ${voted ? 'voted' : 'notVoted'}
          ${disabled ? 'disabled' : 'enabled'}
        `}
          >
            {upvoteCount}
          </UpvoteCount>
        )}
      </ButtonWrapper>
      <ScreenReaderOnly aria-live="polite">
        {formatMessage(messages.a11y_upvoteCount, {
          upvoteCount,
        })}
      </ScreenReaderOnly>
    </Container>
  );
};

export default UpvoteButton;
