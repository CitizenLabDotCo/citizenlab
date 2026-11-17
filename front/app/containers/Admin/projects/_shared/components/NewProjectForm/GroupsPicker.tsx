import React, { useEffect, useRef } from 'react';

import { DialogTrigger, Key } from 'react-aria-components';

import useGroups from 'api/groups/useGroups';

import useLocalize from 'hooks/useLocalize';

import { fieldStyles } from 'design-system/Field';
import { ListBoxOption } from 'design-system/ListBox';
import TagGroup, { Tag, TagAdd } from 'design-system/TagGroup';
import TagPicker from 'design-system/TagPicker';

import { useIntl } from 'utils/cl-intl';

import visibilityMessages from '../../visibilityOptions/messages';

import messages from './messages';
import styles from './NewProjectForm.module.css';
import 'design-system/tokens.css';

interface Props {
  groupIds: string[];
  showError: boolean;
  onChange: (groupIds: string[]) => void;
}

const GroupsPicker = ({ groupIds, showError, onChange }: Props) => {
  const { formatMessage } = useIntl();
  const localize = useLocalize();
  const { data: groups } = useGroups({});
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    containerRef.current?.scrollIntoView({
      block: 'nearest',
      behavior: 'smooth',
    });
  }, []);

  const options = (groups?.data ?? []).map((group) => ({
    id: group.id,
    name: localize(group.attributes.title_multiloc),
  }));
  const selectedOptions = options.filter((option) =>
    groupIds.includes(option.id)
  );
  const chooseGroupsLabel = formatMessage(messages.chooseGroups);

  const handleSelectionChange = (keys: Set<Key>) => {
    onChange(
      options.filter((option) => keys.has(option.id)).map(({ id }) => id)
    );
  };

  return (
    <div ref={containerRef} className={styles.groupsPicker}>
      <TagGroup
        label={formatMessage(visibilityMessages.publishOpenGroups)}
        items={selectedOptions}
        onRemove={(keys) =>
          onChange(groupIds.filter((groupId) => !keys.has(groupId)))
        }
        add={
          <DialogTrigger>
            <TagAdd>{chooseGroupsLabel}</TagAdd>
            <TagPicker
              aria-label={chooseGroupsLabel}
              items={options}
              selectedKeys={new Set(groupIds)}
              onSelectionChange={handleSelectionChange}
            >
              {(option) => (
                <ListBoxOption id={option.id}>{option.name}</ListBoxOption>
              )}
            </TagPicker>
          </DialogTrigger>
        }
      >
        {(option) => <Tag id={option.id}>{option.name}</Tag>}
      </TagGroup>
      {showError && (
        <p className={fieldStyles.error}>
          {formatMessage(messages.groupsRequired)}
        </p>
      )}
    </div>
  );
};

export default GroupsPicker;
