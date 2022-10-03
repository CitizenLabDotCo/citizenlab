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
  language?: string;
}

const TypeformSurvey = memo<Props>(
  ({ typeformUrl, email, user_id, className, language }) => {
    const isLargeTablet = useBreakpoint('tablet');
    const queryString = stringify(omitBy({ email, user_id, language }, isNil));
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
