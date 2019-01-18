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
  margin-right: 20px;

  ${media.largePhone`
    margin-right: 0;
  `}
`;

const SendFeedbackText = styled.span`
  display: none;
`;

const SendFeedbackIcon = styled(Icon)`
  fill: ${colors.clIconSecondary};
  height: 34px;

  &:hover {
    cursor: pointer;
    fill: #000;
  }
`;

interface InputProps {}

interface DataProps {
  locale: GetLocaleChildProps;
}

interface Props extends InputProps, DataProps {}

const SendFeedbackComponent = (props: Props) => {
  const { locale } = props;
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
      <SendFeedbackText>
        <FormattedMessage {...messages.sendFeedback} />
      </SendFeedbackText>
      <SendFeedbackIcon name="questionMark" />
    </SendFeedback>
  );
};

export default () => (
  <GetLocale>
    {locale => <SendFeedbackComponent locale={locale} />}
  </GetLocale>
);
