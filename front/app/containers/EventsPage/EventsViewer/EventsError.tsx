import React from 'react';

// components
import Centerer from './Centerer';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from '..//messages';

// style
import styled from 'styled-components';
import { fontSizes, colors } from 'utils/styleUtils';

const Container = styled(Centerer)`
  font-size: ${fontSizes.large}px;
  color: ${colors.label};
`;

interface Props {
  className?: string;
}

const ProjectNotFound = ({ className }: Props) => (
  <Container className={className || ''}>
    <FormattedMessage {...messages.errorWhenFetchingEvents} />
  </Container>
);

export default ProjectNotFound;
