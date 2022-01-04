import React, { memo } from 'react';
import { Spinner } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';
import { defaultCardStyle } from 'utils/styleUtils';

const Container = styled.div`
  width: 100%;
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  ${defaultCardStyle};
`;

interface Props {
  className?: string;
}

const LoadingBox = memo<Props>(({ className }) => (
  <Container className={className || ''}>
    <Spinner />
  </Container>
));

export default LoadingBox;
