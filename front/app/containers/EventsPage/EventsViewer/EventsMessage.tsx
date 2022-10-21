import React from 'react';

// components
import VerticalCenterer from 'components/VerticalCenterer';

// i18n
import { MessageDescriptor } from 'react-intl';
import { FormattedMessage } from 'utils/cl-intl';
// style
import styled from 'styled-components';
import { colors, fontSizes } from 'utils/styleUtils';

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
