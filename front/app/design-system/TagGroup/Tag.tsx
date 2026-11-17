import React from 'react';

import { Button, Key, Tag as AriaTag } from 'react-aria-components';

import { useIntl } from 'utils/cl-intl';

import Icon from '../Icon';
import '../tokens.css';

import messages from './messages';
import styles from './TagGroup.module.css';

type TagProps = {
  children: string;
  id?: Key;
};

// Removable when the TagGroup has onRemove.
const Tag = ({ children, id }: TagProps) => {
  const { formatMessage } = useIntl();

  return (
    <AriaTag id={id} textValue={children} className={styles.tag}>
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
