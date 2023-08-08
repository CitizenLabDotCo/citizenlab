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

const Container = styled.li`
  display: flex;
  align-items: center;
  list-style: none;
  margin: 0;
  margin-left: 1px;
  padding: 0;
`;

const LikeIcon = styled(Icon)`
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

  &.enabled.reacted,
  &.disabled.reacted {
    color: ${colors.success};

    ${LikeIcon} {
      fill: ${colors.success};
    }
  }

  &.enabled:not(.reacted),
  &.disabled:not(.reacted) {
    color: ${colors.textSecondary};

    ${LikeIcon} {
      fill: ${colors.textSecondary};
    }
  }

  &.enabled:not(.reacted):hover {
    color: ${colors.black};

    ${LikeIcon} {
      fill: ${colors.black};
    }
  }

  &.disabled {
    cursor: auto;
  }
`;

const LikeCount = styled.div`
  margin-left: 6px;
  ${isRtl`
    margin-right: 6px;
    margin-left: auto;
  `}
`;

interface Props {
  className?: string;
  disabled: boolean;
  reacted: boolean;
  likeCount: number;
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

const LikeButton = ({
  className,
  disabled,
  reacted,
  likeCount,
  onClick,
}: Props) => {
  const { formatMessage } = useIntl();

  return (
    <Container
      id="e2e-comment-like-button"
      className={`reaction ${className || ''}`}
    >
      <ButtonWrapper
        onClick={onClick}
        disabled={disabled}
        className={`
          e2e-comment-reaction
          ${reacted ? 'reacted' : 'notreacted'}
          ${disabled ? 'disabled' : 'enabled'}
        `}
      >
        <>
          <LikeIcon
            name="vote-up"
            className={`
            ${reacted ? 'reacted' : 'notreacted'}
            ${disabled ? 'disabled' : 'enabled'}
          `}
          />
          <ScreenReaderOnly>
            {!reacted
              ? formatMessage(messages.likeComment)
              : formatMessage(messages.a11y_undoLike)}
          </ScreenReaderOnly>
        </>
        {likeCount > 0 && (
          <LikeCount
            className={`
          ${reacted ? 'reacted' : 'notreacted'}
          ${disabled ? 'disabled' : 'enabled'}
        `}
          >
            {likeCount}
          </LikeCount>
        )}
      </ButtonWrapper>
      <ScreenReaderOnly aria-live="polite">
        {formatMessage(messages.a11y_likeCount, {
          likeCount,
        })}
      </ScreenReaderOnly>
    </Container>
  );
};

export default LikeButton;
