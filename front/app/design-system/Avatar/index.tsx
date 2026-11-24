import React from 'react';

import Icon from '../Icon';

import styles from './Avatar.module.css';
import '../tokens.css';

type AvatarSize = 24 | 28;

// Initials sit next to the person's name, so they are hidden from assistive tech.
type AvatarContent =
  | { content?: 'initials'; initials: string }
  // Without a src the photo placeholder shows.
  | { content: 'image'; src?: string; alt: string }
  // Nobody assigned.
  | { content: 'empty' };

type AvatarProps = AvatarContent & {
  size?: AvatarSize;
};

const Avatar = (props: AvatarProps) => {
  const size = props.size ?? 28;
  const content = props.content ?? 'initials';
  const className = `${styles.avatar} ${styles[`size${size}`]} ${
    styles[content]
  }`;

  if (props.content === 'image') {
    return (
      <span className={className}>
        {props.src ? (
          <img className={styles.photo} src={props.src} alt={props.alt} />
        ) : (
          <Icon
            name="user-16"
            className={styles.placeholder}
            aria-label={props.alt}
          />
        )}
      </span>
    );
  }

  if (props.content === 'empty') {
    return <span className={className} aria-hidden />;
  }

  return (
    <span className={className} aria-hidden>
      {props.initials}
    </span>
  );
};

export default Avatar;
