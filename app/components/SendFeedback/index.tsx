import React from 'react';

// components
import Icon from 'components/UI/Icon';

// style
import styled from 'styled-components';
import { media, colors, fontSizes } from 'utils/styleUtils';

// import i18n
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';

// resources
import GetLocale, { GetLocaleChildProps } from 'resources/GetLocale';

const SendFeedback = styled.a`
  display: flex;
  align-items; center;

  ${media.largePhone`
    margin-right: 0;
  `}

  &:hover {
    cursor: pointer;

    .send-feedback-text {
      color: #000;
    }

    .send-feedback-icon {
      fill: #000;
    }
  }
`;

const SendFeedbackText = styled.span`
  display: none;
  font-size: ${fontSizes.base}px;
  color: ${colors.clIconSecondary};
  margin-top: -3px;

  &.show {
    display: flex;
    align-items: center;
  }
`;

const SendFeedbackIcon = styled(Icon)`
  fill: ${colors.clIconSecondary};
  height: 34px;
  margin-right: 10px;
`;

interface InputProps {
  showFeedbackText: boolean;
  className?: string;
}

interface DataProps {
  locale: GetLocaleChildProps;
}

interface Props extends InputProps, DataProps {}

const SendFeedbackComponent = (props: Props) => {
  const { locale, showFeedbackText, className } = props;

  let surveyLink: string | null = null;

  if (locale === 'fr-BE' || locale === 'fr-FR') {
    surveyLink = 'https://citizenlabco.typeform.com/to/Cgn9hg';
  } else if (locale === 'nl-BE' || locale === 'nl-NL') {
    surveyLink = 'https://citizenlabco.typeform.com/to/gOuYim';
  } else {
    // English survey when language is not French or Dutch
    surveyLink = 'https://citizenlabco.typeform.com/to/z7baRP';
  }

  return (
    <SendFeedback className={className} target="_blank" href={surveyLink}>
      <SendFeedbackIcon name="questionMark" className="send-feedback-icon" />
      {/* Text has to be always here for pa11y, so we use a class and not conditional render to display it */}
      <SendFeedbackText className={`send-feedback-text  ${showFeedbackText ? 'show' : ''}`}>
        <FormattedMessage {...messages.sendFeedback} />
      </SendFeedbackText>
    </SendFeedback>
  );
};

 export default (inputProps: InputProps) => (
  <GetLocale>
    {locale => <SendFeedbackComponent
      showFeedbackText={inputProps.showFeedbackText}
      locale={locale}
      {...inputProps}
    />}
  </GetLocale>
);
