import React, { memo } from 'react';
import styled from 'styled-components';
import { colors } from 'utils/styleUtils';

const Image = styled.img`
  width: 100%;
  height: auto;
  margin-bottom: 25px;
  border-radius: ${(props: any) => props.theme.borderRadius};
  border: 1px solid ${colors.separation};
`;

interface Props {
  src: string;
  alt: string;
  id?: string;
}

export default memo(({ src, alt, id }: Props) => {
  return (
    <Image
      src={src}
      alt={alt}
      id={id}
    />
  );
});
