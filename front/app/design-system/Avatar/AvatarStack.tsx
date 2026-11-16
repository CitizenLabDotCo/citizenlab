import React from 'react';

import '../tokens.css';

import styles from './AvatarStack.module.css';

import Avatar, { AvatarContent } from '.';

const MAX_SHOWN = 3;

export type AvatarStackProps = {
  avatars: AvatarContent[];
};

const renderAvatar = (avatar: AvatarContent) => {
  if (avatar.content === 'image') {
    return (
      <Avatar content="image" src={avatar.src} alt={avatar.alt} size={24} />
    );
  }
  if (avatar.content === 'empty') {
    return <Avatar content="empty" size={24} />;
  }
  return <Avatar initials={avatar.initials} size={24} />;
};

const AvatarStack = ({ avatars }: AvatarStackProps) => {
  const shown = avatars.slice(0, MAX_SHOWN);
  const more = avatars.length - shown.length;

  return (
    <span className={styles.stack}>
      {shown.map((avatar, index) => (
        <span key={index} className={styles.item}>
          {renderAvatar(avatar)}
        </span>
      ))}
      {more > 0 && <span className={styles.more}>+{more}</span>}
    </span>
  );
};

export default AvatarStack;
