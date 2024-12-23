import React from 'react';

import MentionsTextArea from 'components/UI/MentionsTextArea';

interface Props {
  id?: string;
  className: string;
  placeholder: string;
  rows: number;
  postId?: string;
  value: string;
  error?: JSX.Element;
  onChange: (value: string) => void;
  onFocus: () => void;
  getTextAreaRef: (element: HTMLTextAreaElement) => void;
}

const TextArea = ({
  id,
  className,
  placeholder,
  rows,
  postId,
  value,
  error,
  onChange,
  onFocus,
  getTextAreaRef,
}: Props) => {
  return (
    <MentionsTextArea
      name="comment"
      id={id}
      className={className}
      placeholder={placeholder}
      rows={rows}
      postId={postId}
      value={value}
      error={error}
      onChange={onChange}
      onFocus={onFocus}
      fontWeight="300"
      padding="10px"
      borderRadius="none"
      border="none"
      boxShadow="none"
      getTextareaRef={getTextAreaRef}
    />
  );
};

export default TextArea;
