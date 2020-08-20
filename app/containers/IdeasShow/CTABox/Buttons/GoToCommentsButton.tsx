import React from 'react';
import CTAButton from './IdeaCTAButton';

interface Props {
  className?: string;
}

const GoToCommentsButton = ({ className }: Props) => {
  // TODO: add icon
  return <CTAButton className={className} copy="Join the discussion" />;
}

export default GoToCommentsButton;
