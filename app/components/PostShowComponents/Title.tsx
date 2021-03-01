import React, { memo } from 'react';
import { isNilOrError } from 'utils/helperUtils';

// resources
import GetMachineTranslation, {
  GetMachineTranslationChildProps,
} from 'resources/GetMachineTranslation';

// typings
import { Locale } from 'typings';

// styling
import styled from 'styled-components';
import { media, fontSizes } from 'utils/styleUtils';

const Container = styled.div<{ align: 'left' | 'center' }>`
  width: ${({ align }) => (align === 'left' ? '100%' : 'auto')};
`;

const Title = styled.h1<{
  color: string | undefined;
  align: 'left' | 'center';
}>`
  width: 100%;
  color: ${({ color, theme }) => color || theme.colorText};
  font-size: ${fontSizes.xxxl}px;
  font-weight: 500;
  line-height: normal;
  overflow-wrap: break-word;
  word-wrap: break-word;
  word-break: break-word;
  margin: 0;
  padding: 0;
  z-index: 1;

  ${media.smallerThanMaxTablet`
    font-size: ${fontSizes.xxl}px;
  `}
`;

interface Props {
  postId: string;
  postType: 'idea' | 'initiative';
  title: string;
  locale?: Locale;
  translateButtonClicked?: boolean;
  className?: string;
  color?: string;
  align?: 'left' | 'center';
}

const parseTranslation = (
  translation: GetMachineTranslationChildProps,
  title
) => {
  if (!isNilOrError(translation)) {
    return translation.attributes.translation;
  }

  return title;
};

const PostTitle = memo<Props>(
  ({
    postId,
    postType,
    title,
    locale,
    translateButtonClicked,
    className,
    color,
    align = 'center',
  }) => {
    return (
      <Container className={className} align={align}>
        {locale && translateButtonClicked ? (
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
        ) : (
          <Title id={`e2e-${postType}-title`} color={color} align={align}>
            {title}
          </Title>
        )}
      </Container>
    );
  }
);

export default PostTitle;
