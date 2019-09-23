import React from 'react';

// components
import Icon from 'components/UI/Icon';

// style
import styled from 'styled-components';
import { media, colors, fontSizes, invisibleA11yText } from 'utils/styleUtils';

// import i18n
import messages from './messages';
import { InjectedIntlProps } from 'react-intl';
import { FormattedMessage, injectIntl } from 'utils/cl-intl';

const SendFeedbackText = styled.span`
  color: ${colors.secondaryText};
  font-size: ${fontSizes.base}px;
  font-weight: 300;
  transition: all 100ms ease-out;

  .screenreader-only {
    ${invisibleA11yText}
  }
`;

const SendFeedbackIcon = styled(Icon)`
  fill: ${colors.secondaryText};
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

const SendFeedbackComponent = React.memo<Props>((props: Props & InjectedIntlProps) => {
  const { showFeedbackText, className, intl: { formatMessage } } = props;

  return (
    <Container className={className} target="_blank" href={formatMessage(messages.sendFeedbackLink,  { url: location.href })}>
      <SendFeedbackIcon name="questionMark" ariaHidden title={formatMessage(messages.sendFeedback)} className="send-feedback-icon" />
      <SendFeedbackText>
        {showFeedbackText ?
          <FormattedMessage {...messages.sendFeedback} />
          :
          <span className="screenreader-only">{formatMessage(messages.sendFeedback)}</span>
        }
      </SendFeedbackText>
    </Container>
  );
});

 export default injectIntl(SendFeedbackComponent);
