import React from 'react';

import { Title } from 'components/PostShowComponents/Title';
import GetMachineTranslation, {
  GetMachineTranslationChildProps,
} from 'modules/commercial/machine_translations/resources/GetMachineTranslation';
import { isNilOrError } from 'utils/helperUtils';
import { Locale } from 'typings';

const parseTranslation = (
  translation: GetMachineTranslationChildProps,
  title
) => {
  if (!isNilOrError(translation)) {
    return translation.attributes.translation;
  }

  return title;
};

interface Props {
  postId: string;
  postType: 'idea' | 'initiative';
  title: string;
  locale?: Locale;
  translateButtonClicked?: boolean;
  color?: string;
  align: 'left' | 'center';
}

const PostShowTranslatedTitle = ({
  locale,
  translateButtonClicked,
  postId,
  postType,
  color,
  align,
  title,
}: Props) => {
  if (locale && translateButtonClicked) {
    return (
      <GetMachineTranslation
        attributeName="title_multiloc"
        localeTo={locale}
        id={postId}
        context={postType}
      >
        {(translation) => (
          <Title
            id={`e2e-${postType}-title`}
            color={color}
            align={align}
            aria-live="polite"
          >
            {parseTranslation(translation, title)}
          </Title>
        )}
      </GetMachineTranslation>
    );
  }

  return (
    <Title id={`e2e-${postType}-title`} color={color} align={align}>
      {title}
    </Title>
  );
};

export default PostShowTranslatedTitle;
