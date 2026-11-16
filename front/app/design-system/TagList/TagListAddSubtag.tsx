import React from 'react';

import { Key, TreeItem, TreeItemContent } from 'react-aria-components';

import { useIntl } from 'utils/cl-intl';

import Icon from '../Icon';
import '../tokens.css';

import messages from './messages';
import styles from './TagListAddSubtag.module.css';

export type TagListAddSubtagProps = {
  id: Key;
  // Put a Subtag row in Editing in its place until Enter.
  onPress: () => void;
  'data-cy'?: string;
};

// The last tree item of an open tag; the row itself is the button.
const TagListAddSubtag = ({
  id,
  onPress,
  'data-cy': dataCy,
}: TagListAddSubtagProps) => {
  const { formatMessage } = useIntl();
  const label = formatMessage(messages.addSubtag);

  return (
    <TreeItem
      id={id}
      textValue={label}
      className={styles.item}
      isDisabled
      onAction={onPress}
      data-cy={dataCy}
    >
      <TreeItemContent>
        <span className={styles.button}>
          <Icon name="plus-16" className={styles.icon} />
          {label}
        </span>
      </TreeItemContent>
    </TreeItem>
  );
};

export default TagListAddSubtag;
