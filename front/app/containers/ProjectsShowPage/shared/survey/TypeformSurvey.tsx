import React, { memo } from 'react';
import { stringify } from 'qs';
import { omitBy, isNil } from 'lodash-es';

// components
import { useBreakpoint } from '@citizenlab/cl2-component-library';
import Iframe from 'react-iframe';

// styling
import styled from 'styled-components';
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

interface Props {
  typeformUrl: string;
  email: string | null;
  user_id: string | null;
  className?: string;
}

const TypeformSurvey = memo<Props>(
  ({ typeformUrl, email, user_id, className }) => {
    const isLargeTablet = useBreakpoint('largeTablet');
    const queryString = stringify(omitBy({ email, user_id }, isNil));
    const surveyUrl = `${typeformUrl}?${queryString}&disable-auto-focus=true`;

    return (
      <Container className={className || ''}>
        <Iframe
          url={surveyUrl}
          width="100%"
          height={isLargeTablet ? surveyHeightMobile : surveyHeightDesktop}
        />
      </Container>
    );
  }
);

export default TypeformSurvey;
