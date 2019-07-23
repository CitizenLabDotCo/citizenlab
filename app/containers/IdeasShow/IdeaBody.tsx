import React, { memo } from 'react';
import { adopt } from 'react-adopt';
import { isNilOrError } from 'utils/helperUtils';

// components
import Fragment from 'components/Fragment';
import QuillEditedContent from 'components/UI/QuillEditedContent';

// resources
import GetMachineTranslation from 'resources/GetMachineTranslation';
import GetWindowSize, { GetWindowSizeChildProps } from 'resources/GetWindowSize';

// typings
import { Locale } from 'typings';

// styling
import styled, { withTheme } from 'styled-components';
import { viewportWidths } from 'utils/styleUtils';

const Container = styled.div``;

interface InputProps {
  ideaId: string;
  ideaBody: string;
  locale?: Locale;
  translateButtonClicked?: boolean;
  className?: string;
}

interface DataProps {
  windowSize: GetWindowSizeChildProps;
}

interface Props extends InputProps, DataProps {
  theme: any;
}

const IdeaBody = memo<Props>(({ ideaId, ideaBody, locale, translateButtonClicked, theme, windowSize, className }) => {
  const smallerThanSmallTablet = windowSize ? windowSize <= viewportWidths.smallTablet : false;

  return (
    <Container id="e2e-idea-description" className={className}>
      <Fragment name={`ideas/${ideaId}/body`}>
        <QuillEditedContent
          textColor={theme.colorText}
          fontSize={smallerThanSmallTablet ? 'base' : 'large'}
          fontWeight={300}
        >
          {(translateButtonClicked && locale) ?
            <GetMachineTranslation context="idea" id={ideaId} attributeName="body_multiloc" localeTo={locale}>
              {translation => {
                if (!isNilOrError(translation)) {
                  return <span dangerouslySetInnerHTML={{ __html: translation.attributes.translation }} />;
                }

                return <span dangerouslySetInnerHTML={{ __html: ideaBody }} />;
              }}
            </GetMachineTranslation>
            :
            <span dangerouslySetInnerHTML={{ __html: ideaBody }} />
          }
        </QuillEditedContent>
      </Fragment>
    </Container>
  );
});

const IdeaBodyWithHOCs = withTheme(IdeaBody);

const Data = adopt<DataProps, InputProps>({
  windowSize: <GetWindowSize debounce={50} />
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataProps => <IdeaBodyWithHOCs {...inputProps} {...dataProps} />}
  </Data>
);
