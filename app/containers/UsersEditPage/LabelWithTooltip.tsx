import React from 'react';
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';
import styled from 'styled-components';
import Label from 'components/UI/Label';

const Container = styled.div`
  display: flex;
`;

interface Props {
  htmlFor?: string;
  className?: string;
  translateId: string;
}

const LabelWithTooltip = ({ htmlFor, className, translateId }: Props) => (
  <Container className={className}>
    <Label htmlFor={htmlFor}>
      <FormattedMessage {...messages[translateId]} />
    </Label>
  </Container>
);

export default LabelWithTooltip;
