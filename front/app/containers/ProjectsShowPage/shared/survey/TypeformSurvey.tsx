import React from 'react';

import { useBreakpoint } from '@citizenlab/cl2-component-library';
import { omitBy, isNil } from 'lodash-es';
import { stringify } from 'qs';
import styled from 'styled-components';

import useAuthUser from 'api/me/useAuthUser';

import { isNilOrError } from 'utils/helperUtils';

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

interface Props {
  typeformUrl: string;
  email: string | null;
  user_id: string | null;
  className?: string;
}

const TypeformSurvey = ({ typeformUrl, email, user_id, className }: Props) => {
  const { data: authUser } = useAuthUser();
  const isSmallerThanTablet = useBreakpoint('tablet');
  const language = !isNilOrError(authUser)
    ? authUser.data.attributes.locale
    : null;
  const queryString = stringify(omitBy({ email, user_id, language }, isNil));
  const surveyUrl = `${typeformUrl}?${queryString}&disable-auto-focus=true`;

  return (
    <Container className={className || ''}>
      <iframe
        src={surveyUrl}
        width="100%"
        height={isSmallerThanTablet ? surveyHeightMobile : surveyHeightDesktop}
      />
    </Container>
  );
};

export default TypeformSurvey;
