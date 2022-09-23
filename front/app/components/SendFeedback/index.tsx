import React from 'react';

// components
import { Icon } from '@citizenlab/cl2-component-library';

// style
import styled from 'styled-components';
import { media, colors, fontSizes } from 'utils/styleUtils';
import { ScreenReaderOnly } from 'utils/a11y';

// import i18n
import messages from './messages';
import { WrappedComponentProps } from 'react-intl';
import { FormattedMessage } from 'utils/cl-intl';
import { injectIntl } from 'react-intl';

const SendFeedbackText = styled.span`
  color: ${colors.label};
  font-size: ${fontSizes.s}px;
  font-weight: 400;
  text-decoration: underline;
  transition: all 100ms ease-out;
`;

const SendFeedbackIcon = styled(Icon)`
  fill: ${colors.label};
  width: 22px;
  height: 22px;
  transition: all 100ms ease-out;
  margin-right: 8px;

  ${media.phone`
    display: none;
  `}
`;

const Container = styled.a`
  display: flex;
  align-items: center;
  cursor: pointer;

  &:hover {
    ${SendFeedbackText} {
      color: #000;
    }

    ${SendFeedbackIcon} {
      fill: #000;
    }
  }
`;

interface Props {
  showFeedbackText: boolean;
  className?: string;
}

const SendFeedbackComponent = React.memo<Props>(
  (props: Props & WrappedComponentProps) => {
    const {
      showFeedbackText,
      className,
      intl: { formatMessage },
    } = props;

    return (
      <Container
        className={className}
        target="_blank"
        href={formatMessage(messages.sendFeedbackLink, { url: location.href })}
      >
        <SendFeedbackIcon name="questionMark" className="send-feedback-icon" />
        <SendFeedbackText>
          {showFeedbackText ? (
            <FormattedMessage {...messages.sendFeedback} />
          ) : (
            <ScreenReaderOnly>
              {formatMessage(messages.sendFeedback)}
            </ScreenReaderOnly>
          )}
        </SendFeedbackText>
      </Container>
    );
  }
);

export default injectIntl(SendFeedbackComponent);
