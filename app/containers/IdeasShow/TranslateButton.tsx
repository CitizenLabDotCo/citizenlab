import React from 'react';
import { Locale } from 'typings';
import { GetIdeaChildProps } from 'resources/GetIdea';
import { isNilOrError } from 'utils/helperUtils';

import Button from 'components/UI/Button';

import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

import { colors } from 'utils/styleUtils';
import { lighten } from 'polished';

interface Props {
  locale: Locale;
  idea: GetIdeaChildProps;
  translateButtonClicked: boolean;
  translationsLoading: boolean;
  translateIdea: () => void;
  backToOriginalContent: () => void;
  className?: string;
}

const TranslateButton = (props: Props) => {
  const {
    locale,
    idea,
    translateButtonClicked,
    translationsLoading,
    translateIdea,
    backToOriginalContent,
    className
   } = props;

  const showTranslateButton = !isNilOrError(idea) && !isNilOrError(locale)
    && !idea.attributes.title_multiloc[locale];

  if (showTranslateButton) {
    if (!translateButtonClicked) {
      return (
        <Button
          style="secondary-outlined"
          onClick={translateIdea}
          processing={translationsLoading}
          spinnerColor={colors.label}
          borderColor={lighten(.4, colors.label)}
          className={className}
        >
          <FormattedMessage {...messages.translateIdea} />
        </Button>
      );
    } else {
      return (
        <Button
          style="secondary-outlined"
          onClick={backToOriginalContent}
          processing={translationsLoading}
          spinnerColor={colors.label}
          borderColor={lighten(.4, colors.label)}
          className={className}
        >
          <FormattedMessage {...messages.backToOriginalContent} />
        </Button>
      );
    }
  }
  return null;
};

export default TranslateButton;
