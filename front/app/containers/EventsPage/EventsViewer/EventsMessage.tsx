import React from 'react';

// components
import Centerer from './Centerer';

// i18n
import { FormattedMessage, MessageDescriptor } from 'utils/cl-intl';

// style
import styled from 'styled-components';
import { fontSizes, colors } from 'utils/styleUtils';

const Container = styled(Centerer)`
  font-size: ${fontSizes.large}px;
  color: ${colors.label};
`;

interface Props {
  className?: string;
  message: MessageDescriptor;
}

const ProjectNotFound = ({ className, message }: Props) => (
  <Container className={className || ''}>
    <FormattedMessage {...message} />
  </Container>
);

export default ProjectNotFound;
