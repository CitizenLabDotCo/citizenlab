import React from 'react';
import styled from 'styled-components';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

const Container = styled.div``;

interface Props {
  unit: 'Users' | 'Ideas' | 'Comments' | 'Votes';
}

export default ({ unit }: Props) => (
  <Container>
    <FormattedMessage {...messages[`empty${unit}`]} />
  </Container>
);
