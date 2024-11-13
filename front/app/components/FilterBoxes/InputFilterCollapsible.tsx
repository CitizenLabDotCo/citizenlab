import React from 'react';

import { CollapsibleContainer } from '@citizenlab/cl2-component-library';

interface Props {
  title: string;
  children: JSX.Element;
  className?: string;
}

const InputFilterCollapsible = ({ title, children, className }: Props) => {
  return (
    <CollapsibleContainer
      titleAs="h2"
      titleVariant="h6"
      titleFontWeight="bold"
      title={title.toUpperCase()}
      isOpenByDefault={true}
      className={className}
    >
      {children}
    </CollapsibleContainer>
  );
};

export default InputFilterCollapsible;
