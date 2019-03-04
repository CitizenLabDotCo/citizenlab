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

const SendFeedbackText = styled.span`
  color: ${colors.secondaryText};
  font-size: ${fontSizes.base}px;
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
  margin-top: 3px;
  transition: all 100ms ease-out;
`;

const SendFeedback = styled.a`
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
