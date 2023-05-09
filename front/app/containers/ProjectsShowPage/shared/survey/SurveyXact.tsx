import React, { memo, useState } from 'react';

// styling
import { defaultCardStyle } from 'utils/styleUtils';
import styled from 'styled-components';

// components
import { Spinner, useBreakpoint } from '@citizenlab/cl2-component-library';

const surveyHeightDesktop = '600px';
const surveyHeightMobile = '500px';

const Container = styled.div`
  display: flex;
  flex-direction: column;

  iframe {
    border: solid 1px #ccc;
    border-radius: ${(props) => props.theme.borderRadius};
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

export default memo(({ surveyXactUrl, className }: Props) => {
  const [isIframeLoaded, setIsIframeLoaded] = useState(false);
  const [hackyWidthThingy, setHackyWidthThingy] = useState<string>('100%');
  const isSmallerThanTablet = useBreakpoint('tablet');

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
      <iframe
        src={surveyXactUrl}
        width={hackyWidthThingy}
        height={isSmallerThanTablet ? surveyHeightMobile : surveyHeightDesktop}
        style={{ overflow: 'hidden' }}
        onLoad={handleIframeOnLoad}
        id="survey-xact-frame"
      />
    </Container>
  );
});
