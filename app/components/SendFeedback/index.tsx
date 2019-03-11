import React from 'react';

// components
import Icon from 'components/UI/Icon';

// style
import styled from 'styled-components';
import { media, colors, fontSizes } from 'utils/styleUtils';

// import i18n
import messages from './messages';
import { InjectedIntlProps } from 'react-intl';
import { FormattedMessage, injectIntl } from 'utils/cl-intl';

const SendFeedbackText = styled.span`
  color: ${colors.secondaryText};
  font-size: ${fontSizes.base}px;
  font-weight: 300;
  transition: all 100ms ease-out;
  margin-left: 8px;

  &:not(.show) {
    display: none;
  }
`;

const SendFeedbackIcon = styled(Icon)`
  fill: ${colors.secondaryText};
  width: 22px;
  height: 22px;
  transition: all 100ms ease-out;
`;

const Container = styled.a`
  display: flex;
  align-items: center;
  cursor: pointer;

  ${media.largePhone`
    margin-right: 0;
  `}

  &:hover {
    ${SendFeedbackText} {
      color: #000;
    }

    ${SendFeedbackIcon} {
      fill: #000;
    }
  }
`;

interface InputProps {
  showFeedbackText: boolean;
  className?: string;
}

interface DataProps {}

interface Props extends InputProps, DataProps {}

const SendFeedbackComponent = (props: Props & InjectedIntlProps) => {
  const { showFeedbackText, className, intl: { formatMessage } } = props;

  return (
    <Container className={className} target="_blank" href={formatMessage(messages.sendFeedbackLink,  { url: location.href })}>
      <SendFeedbackIcon name="questionMark" className="send-feedback-icon" />
      {/* Text has to be always here for pa11y, so we use a class and not conditional render to display it */}
      <SendFeedbackText className={`send-feedback-text  ${showFeedbackText ? 'show' : ''}`}>
        <FormattedMessage {...messages.sendFeedback} />
      </SendFeedbackText>
    </Container>
  );
};

 export default injectIntl(SendFeedbackComponent);
