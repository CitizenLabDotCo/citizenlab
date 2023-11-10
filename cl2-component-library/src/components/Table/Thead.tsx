import React from 'react';

export interface Props {
  children: React.ReactNode;
}

const Thead = ({ children }: Props) => <thead>{children}</thead>;

export default Thead;
