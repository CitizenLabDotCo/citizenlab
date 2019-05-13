import React, { memo } from 'react';
import { isNilOrError } from 'utils/helperUtils';

// resources
import GetMachineTranslation from 'resources/GetMachineTranslation';

// typings
import { Locale } from 'typings';

// styling
import styled from 'styled-components';
import { media, fontSizes } from 'utils/styleUtils';

const Container = styled.div`
  width: 100%;
  margin-top: -5px;
  margin-bottom: 28px;

  ${media.smallerThanMaxTablet`
    margin-top: 0px;
    margin-bottom: 0px;
  `}
`;

const IdeaTitle = styled.h1`
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

  ${media.smallerThanMaxTablet`
    font-size: ${fontSizes.xxxl}px;
    line-height: 35px;
    margin-right: 12px;
  `}
`;

interface Props {
  ideaId: string;
  ideaTitle: string;
  locale?: Locale;
  translateButtonClicked?: boolean;
  className?: string;
}

const IdeaHeader = memo<Props>((props: Props) => {
  const { ideaId, ideaTitle, locale, translateButtonClicked, className } = props;

  return (
    <Container className={className}>
      {(locale && translateButtonClicked) ? (
        <GetMachineTranslation attributeName="title_multiloc" localeTo={locale} ideaId={ideaId}>
          {translation => {
            if (!isNilOrError(translation)) {
              return <IdeaTitle>{translation.attributes.translation}</IdeaTitle>;
            }

            return <IdeaTitle>{ideaTitle}</IdeaTitle>;
          }}
        </GetMachineTranslation>
      ) : (
        <IdeaTitle className="e2e-ideatitle">{ideaTitle}</IdeaTitle>
      )}
    </Container>
  );
});

export default IdeaHeader;
