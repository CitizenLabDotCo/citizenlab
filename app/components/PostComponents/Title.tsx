import React, { memo } from 'react';
import { isNilOrError } from 'utils/helperUtils';

// resources
import GetMachineTranslation from 'resources/GetMachineTranslation';

// typings
import { Locale } from 'typings';

// styling
import styled from 'styled-components';
import { media, fontSizes } from 'utils/styleUtils';

const Container = styled.div``;

const Title = styled.h1`
  width: 100%;
  color: ${({ theme }) => theme.colorText};
  font-size: ${fontSizes.xxxl}px;
  font-weight: 500;
  line-height: 40px;
  overflow-wrap: break-word;
  word-wrap: break-word;
  word-break: break-word;
  margin: 0;
  padding: 0;
  z-index: 1;

  ${media.smallerThanMaxTablet`
    font-size: ${fontSizes.xxl}px;
    line-height: 35px;
  `}
`;

interface Props {
  id: string;
  context: 'idea' | 'initiative';
  title: string;
  locale?: Locale;
  translateButtonClicked?: boolean;
  className?: string;
}

const PostTitle = memo<Props>(({ id, context, title, locale, translateButtonClicked, className }) => {
  return (
    <Container className={className}>
      {(locale && translateButtonClicked) ? (
        <GetMachineTranslation
          attributeName="title_multiloc"
          localeTo={locale}
          id={id}
          context={context}
        >
          {translation => {
            if (!isNilOrError(translation)) {
              return <Title>{translation.attributes.translation}</Title>;
            }

            return <Title>{title}</Title>;
          }}
        </GetMachineTranslation>
      ) : (
        <Title className={`e2e-${context}title`}>{title}</Title>
      )}
    </Container>
  );
});

export default PostTitle;
