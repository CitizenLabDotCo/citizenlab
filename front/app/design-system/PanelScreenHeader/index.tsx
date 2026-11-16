import React, { ReactNode, useEffect, useRef } from 'react';

import { Heading, PressEvent } from 'react-aria-components';

import IconButton from '../IconButton';
import '../tokens.css';

import styles from './PanelScreenHeader.module.css';

export type PanelScreenHeaderProps = {
  title: ReactNode;
  // Names the Back button and is its tooltip, e.g. "Back to Ideation setup".
  backLabel: string;
  onBack: (e: PressEvent) => void;
  level?: number;
  'data-cy'?: string;
};

const PanelScreenHeader = ({
  title,
  backLabel,
  onBack,
  level = 2,
  'data-cy': dataCy,
}: PanelScreenHeaderProps) => {
  const titleRef = useRef<HTMLHeadingElement>(null);

  // The header mounts when its screen opens; focus lands on the title.
  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  return (
    <div className={styles.header} data-cy={dataCy}>
      <IconButton
        icon="arrow-left-16"
        aria-label={backLabel}
        onPress={onBack}
      />
      <Heading
        ref={titleRef}
        level={level}
        tabIndex={-1}
        className={styles.title}
      >
        {title}
      </Heading>
    </div>
  );
};

export default PanelScreenHeader;
