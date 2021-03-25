import React from 'react';

import { Title } from 'components/PostShowComponents/Title';
import GetMachineTranslation, {
  GetMachineTranslationChildProps,
} from 'modules/machine_translations/resources/GetMachineTranslation';
import { isNilOrError } from 'utils/helperUtils';

const parseTranslation = (
  translation: GetMachineTranslationChildProps,
  title
) => {
  if (!isNilOrError(translation)) {
    return translation.attributes.translation;
  }

  return title;
};

const PostShowTranslatedTitle = ({
  locale,
  translateButtonClicked,
  postId,
  postType,
  color,
  align,
  title,
}) => {
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
