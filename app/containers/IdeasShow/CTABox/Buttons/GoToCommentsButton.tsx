import React from 'react';
import IdeaCTAButton from './IdeaCTAButton';

interface Props {
  className?: string;
}

const GoToCommentsButton = ({ className }: Props) => {
  const onClick = () => {
    const commentInputField = document.getElementById("comment-input");

    // TODO: check after comments have been redesigned
    commentInputField && commentInputField.scrollIntoView({ behavior: "smooth" })
  }
  // TODO: add icon
  return <IdeaCTAButton onClick={onClick} className={className} copy="Join the discussion" />;
}

export default GoToCommentsButton;
