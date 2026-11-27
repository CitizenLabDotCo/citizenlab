import React, { ReactNode } from 'react';

import UnstyledButton from '../UnstyledButton';

import styles from './CommentRow.module.css';
import '../tokens.css';

type Props = {
  // A 24 px muted Avatar.
  avatar: ReactNode;
  name: ReactNode;
  // When it was posted, e.g. "2 days ago".
  time: string;
  // The comment, or the form that edits it.
  children: ReactNode;
  // CommentAction links under the comment: Reply, Delete…
  actions?: ReactNode;
  // A reply sits under its parent, lined up with the parent's text.
  isReply?: boolean;
};

// One comment of a thread in the back office's idea panel.
const CommentRow = ({
  avatar,
  name,
  time,
  children,
  actions,
  isReply = false,
}: Props) => (
  <div className={`${styles.row} ${isReply ? styles.reply : ''}`}>
    {avatar}
    <div className={styles.content}>
      <div className={styles.header}>
        <span className={styles.name}>{name}</span>
        <span className={styles.time}>{time}</span>
      </div>
      <div className={styles.body}>{children}</div>
      {actions && <div className={styles.actions}>{actions}</div>}
    </div>
  </div>
);

type ActionProps = {
  children: ReactNode;
  onPress: () => void;
  className?: string;
};

// A quiet text action of a comment.
export const CommentAction = ({ children, onPress, className }: ActionProps) => (
  <UnstyledButton
    className={`${styles.action} ${className ?? ''}`}
    onPress={onPress}
  >
    {children}
  </UnstyledButton>
);

export default CommentRow;
