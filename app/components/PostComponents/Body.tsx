import React, { memo } from 'react';
import { adopt } from 'react-adopt';
import { isNilOrError } from 'utils/helperUtils';

// components
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
  id: string;
  body: string;
  locale?: Locale;
  translateButtonClicked?: boolean;
  className?: string;
  context: 'idea' | 'initiative';
}

interface DataProps {
  windowSize: GetWindowSizeChildProps;
}

interface Props extends InputProps, DataProps {
  theme: any;
}

const Body = memo<Props>(({ id, body, locale, translateButtonClicked, theme, windowSize, className, context }) => {
  const smallerThanSmallTablet = windowSize ? windowSize <= viewportWidths.smallTablet : false;

  return (
    <Container id={`e2e-${context}-description`} className={className}>
      <QuillEditedContent
        textColor={theme.colorText}
        fontSize={smallerThanSmallTablet ? 'base' : 'large'}
        fontWeight={300}
      >
        {(translateButtonClicked && locale) ?
          <GetMachineTranslation attributeName="body_multiloc" localeTo={locale} id={id} context={context}>
            {translation => {
              if (!isNilOrError(translation)) {
                return <span dangerouslySetInnerHTML={{ __html: translation.attributes.translation }} />;
              }

              return <span dangerouslySetInnerHTML={{ __html: body }} />;
            }}
          </GetMachineTranslation>
          :
          <span dangerouslySetInnerHTML={{ __html: body }} />
        }
      </QuillEditedContent>
    </Container>
  );
});

const BodyWithHOCs = withTheme(Body);

const Data = adopt<DataProps, InputProps>({
  windowSize: <GetWindowSize debounce={50} />
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataProps => <BodyWithHOCs {...inputProps} {...dataProps} />}
  </Data>
);
