import React from 'react';

import MentionsTextArea from 'components/UI/MentionsTextArea';

import { panelTextAreaStyle, useIsPanelComments } from '../commentsVariant';

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
  const isPanel = useIsPanelComments();

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
      color={isPanel ? panelTextAreaStyle.color : undefined}
      fontWeight={isPanel ? panelTextAreaStyle.fontWeight : '300'}
      fontSize={isPanel ? panelTextAreaStyle.fontSize : undefined}
      lineHeight={isPanel ? panelTextAreaStyle.lineHeight : undefined}
      padding="10px"
      borderRadius="none"
      border="none"
      boxShadow="none"
      getTextareaRef={getTextAreaRef}
    />
  );
};

export default TextArea;
