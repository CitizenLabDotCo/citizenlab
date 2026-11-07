import React, { ReactNode } from 'react';

import { BoxProps, bo, colors } from '@citizenlab/cl2-component-library';

import { Appear } from '../../animations';

type Props = {
  id?: string;
  pending: boolean;
  removed?: boolean;
  display?: BoxProps['display'];
  flexDirection?: BoxProps['flexDirection'];
  overflow?: BoxProps['overflow'];
  children: ReactNode;
};

const DraftItem = ({
  id,
  pending,
  removed = false,
  display,
  flexDirection,
  overflow,
  children,
}: Props) => {
  const accent = removed ? colors.red400 : colors.teal400;
  const halo = removed ? colors.red100 : colors.teal50;

  return (
    <Appear
      id={id}
      display={display}
      flexDirection={flexDirection}
      overflow={overflow}
      bgColor={colors.white}
      borderRadius={bo.panelBorderRadius}
      border={`1px solid ${pending ? accent : colors.grey300}`}
      boxShadow={pending ? `0 0 0 4px ${halo}` : 'none'}
      opacity={removed ? 0.75 : 1}
    >
      {children}
    </Appear>
  );
};

export default DraftItem;
