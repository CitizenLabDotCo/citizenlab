import React, { memo } from 'react';
import LazyImage from '../../../components/LazyImage';
import styled from 'styled-components';

const Container = styled.div`
  width: 100%;
  height: 115px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-top-left-radius: ${(props: any) => props.theme.borderRadius};
  border-top-right-radius: ${(props: any) => props.theme.borderRadius};
`;

const Image = styled(LazyImage)`
  width: 100%;
`;

interface Props {
  imageUrl: string;
  imageAltText: string;
  className?: string;
}

const CardImage = memo<Props>(({ imageUrl, imageAltText, className }) => {
  return (
    <Container className={className}>
      <Image src={imageUrl} alt={imageAltText} />
    </Container>
  );
});

export default CardImage;
