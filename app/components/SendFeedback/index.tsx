import React from 'react';

// components
import Icon from 'components/UI/Icon';

// style
import styled from 'styled-components';
import { media, colors } from 'utils/styleUtils';

// import i18n
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';

// resources
import GetLocale, { GetLocaleChildProps } from 'resources/GetLocale';

const SendFeedback = styled.a`
  display: flex;
  align-items; center;
  flex-grow: 1;
  margin-right: 20px;

  ${media.largePhone`
    margin-right: 0;
  `}
`;

const SendFeedbackText = styled.span`
  display: none;

  &.show {
    display: inline;
  }
`;

const SendFeedbackIcon = styled(Icon)`
  fill: ${colors.clIconSecondary};
  height: 34px;
  margin-right: 10px;

  &:hover {
    cursor: pointer;
    fill: #000;
  }
`;

interface InputProps {
  showFeedbackText: boolean;
}

interface DataProps {
  locale: GetLocaleChildProps;
}

interface Props extends InputProps, DataProps {}

const SendFeedbackComponent = (props: Props) => {
  const { locale, showFeedbackText } = props;
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
    <SendFeedback target="_blank" href={surveyLink}>
      <SendFeedbackIcon name="questionMark" />
      {/* Text has to be always here for pa11y, so we use a class and not conditional render to display it */}
      <SendFeedbackText className={showFeedbackText ? 'show' : ''}>
        <FormattedMessage {...messages.sendFeedback} />
      </SendFeedbackText>
    </SendFeedback>
  );
};

 export default ({ showFeedbackText }: InputProps) => (
  <GetLocale>
    {locale => <SendFeedbackComponent showFeedbackText={showFeedbackText} locale={locale} />}
  </GetLocale>
);
