import React from 'react';

import '../tokens.css';
import styles from './Icon.module.css';
import { icons, IconName } from './icons';

export type { IconName };

type Props = {
  name: IconName;
  className?: string;
} & (
  | { 'aria-label'?: undefined }
  | {
      // An icon that carries meaning on its own needs a label.
      'aria-label': string;
    }
);

const Icon = ({ name, className, 'aria-label': ariaLabel }: Props) => {
  const icon = icons[name];

  return (
    <svg
      width={icon.size}
      height={icon.height}
      viewBox={icon.viewBox}
      fill="none"
      className={className ? `${styles.icon} ${className}` : styles.icon}
      aria-hidden={ariaLabel ? undefined : true}
      aria-label={ariaLabel}
      role={ariaLabel ? 'img' : undefined}
      focusable="false"
    >
      {icon.paths}
    </svg>
  );
};

export default Icon;
