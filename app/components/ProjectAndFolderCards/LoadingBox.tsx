import React, { memo } from 'react';
import Spinner from 'components/UI/Spinner';
import styled from 'styled-components';

const Container = styled.div`
  width: 100%;
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  border-radius: ${(props: any) => props.theme.borderRadius};
  box-shadow: 1px 2px 2px rgba(0, 0, 0, 0.06);
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
