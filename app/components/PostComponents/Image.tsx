import React, { memo } from 'react';
import styled from 'styled-components';
import { colors } from 'utils/styleUtils';
import messages from './messages';

const Image = styled.img`
  width: 100%;
  height: auto;
  margin-bottom: 25px;
  border-radius: ${(props: any) => props.theme.borderRadius};
  border: 1px solid ${colors.separation};
`;

interface Props {
  src: string;
  postType: 'idea' | 'initiative';
  className?: string;
}

export default memo(({ src, postType, className }: Props) => {
  return (
    <Image
      src={src}
      // alt={formatMessage(messages.imageAltText, {
      //   postContext: formatMessage(messages.initiative),
      //   title: initiativeTitle
      // })}
      className={className}
    />
  );
});
