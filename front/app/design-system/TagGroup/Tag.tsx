import React from 'react';

import { Button, Key, Tag as AriaTag } from 'react-aria-components';

import { useIntl } from 'utils/cl-intl';

import Icon from '../Icon';
import '../tokens.css';

import messages from './messages';
import styles from './TagGroup.module.css';

export type TagProps = {
  children: string;
  id?: Key;
  isDisabled?: boolean;
  'data-cy'?: string;
};

// Removable when the TagGroup has onRemove.
const Tag = ({ children, id, isDisabled, 'data-cy': dataCy }: TagProps) => {
  const { formatMessage } = useIntl();

  return (
    <AriaTag
      id={id}
      textValue={children}
      isDisabled={isDisabled}
      className={styles.tag}
      data-cy={dataCy}
    >
      {({ allowsRemoving }) => (
        <>
          {children}
          {allowsRemoving && (
            <Button
              slot="remove"
              className={styles.remove}
              aria-label={formatMessage(messages.remove)}
            >
              <Icon name="x-14" />
            </Button>
          )}
        </>
      )}
    </AriaTag>
  );
};

export default Tag;
