import React, { memo } from 'react';

// components
import Error from 'components/UI/Error';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// styling
import styled from 'styled-components';
import { Title } from 'components/SignUpIn/styles';

const Container = styled.div``;

interface Props {
  className?: string;
}

const SignUpError = memo<Props>(({ className }) => {
  return (
    <Container className={className}>
      <Title>
        <FormattedMessage {...messages.somethingWentWrongTitle} />
      </Title>
      <Error text={<FormattedMessage {...messages.somethingWentWrongText} />} />
    </Container>
  );
});

export default SignUpError;
