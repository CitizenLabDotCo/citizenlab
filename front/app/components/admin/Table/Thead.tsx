import React from 'react';

interface Props {
  children: React.ReactNode;
}

const THead = ({ children }: Props) => <thead>{children}</thead>;

export default THead;
