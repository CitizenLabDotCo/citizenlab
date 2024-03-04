import React from 'react';

import { fontSizes, colors } from '@citizenlab/cl2-component-library';
import { MessageDescriptor } from 'react-intl';
import styled from 'styled-components';

import VerticalCenterer from 'components/VerticalCenterer';

import { FormattedMessage } from 'utils/cl-intl';

const Container = styled(VerticalCenterer)`
  font-size: ${fontSizes.l}px;
  color: ${colors.textSecondary};
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
