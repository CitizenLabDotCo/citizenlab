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
  box-shadow: 0px 2px 2px -1px rgba(152, 162, 179, 0.3), 0px 1px 5px -2px rgba(152, 162, 179, 0.3);
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
