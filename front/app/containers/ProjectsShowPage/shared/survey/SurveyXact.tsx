import React, { memo, useState } from 'react';

// styling
import { defaultCardStyle, viewportWidths } from 'utils/styleUtils';
import styled from 'styled-components';

// components
import { Spinner, useWindowSize } from '@citizenlab/cl2-component-library';
import Iframe from 'react-iframe';

const surveyHeightDesktop = '600px';
const surveyHeightMobile = '500px';

const Container = styled.div`
  display: flex;
  flex-direction: column;

  iframe {
    border: solid 1px #ccc;
    border-radius: ${(props: any) => props.theme.borderRadius};
  }
`;

const Placeholder = styled.div`
  width: 100%;
  height: ${surveyHeightDesktop};
  display: flex;
  align-items: center;
  justify-content: center;
  ${defaultCardStyle};
`;

type Props = {
  surveyXactUrl: string;
  className?: string;
};

export default memo<Props>(({ surveyXactUrl, className }) => {
  const [isIframeLoaded, setIsIframeLoaded] = useState(false);
  const [hackyWidthThingy, setHackyWidthThingy] = useState<string>('100%');
  const windowSize = useWindowSize();
  const smallerThanLargeTablet = windowSize
    ? windowSize.windowWidth <= viewportWidths.largeTablet
    : false;

  const handleIframeOnLoad = () => {
    setIsIframeLoaded(true);
    setTimeout(() => {
      setHackyWidthThingy(
        document.getElementById('survey-xact-frame')?.clientWidth.toString() ||
          '100%'
      );
      setTimeout(() => {
        setHackyWidthThingy((width) =>
          width === '100%'
            ? document
                .getElementById('survey-xact-frame')
                ?.clientWidth.toString() || '99%'
            : (parseInt(width, 10) - 1).toString()
        );
      }, 1000);
    }),
      10000;
  };

  return (
    <Container className={className || ''}>
      {!isIframeLoaded && (
        <Placeholder>
          <Spinner />
        </Placeholder>
      )}
      <Iframe
        url={surveyXactUrl}
        width={hackyWidthThingy}
        height={
          smallerThanLargeTablet ? surveyHeightMobile : surveyHeightDesktop
        }
        display={isIframeLoaded ? 'block' : 'none'}
        overflow="hidden"
        onLoad={handleIframeOnLoad}
        id="survey-xact-frame"
      />
    </Container>
  );
});
