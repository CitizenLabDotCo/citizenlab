import React from 'react';
import { MessageDescriptor } from 'react-intl';
// i18n
import { FormattedMessage } from 'utils/cl-intl';
import { fontSizes, colors } from 'utils/styleUtils';
// components
import VerticalCenterer from 'components/VerticalCenterer';
// style
import styled from 'styled-components';

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
