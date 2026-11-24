import React, { useState } from 'react';

import Button from 'design-system/Button';
import ListBox, { ListBoxOption } from 'design-system/ListBox';
import Popover, { DialogTrigger } from 'design-system/Popover';
import Text from 'design-system/Text';

import { useIntl } from 'utils/cl-intl';

import ColorDot from '../ColorDot';
import messages from '../messages';
import { Option } from '../OptionList';

import styles from './StatusPicker.module.css';

interface Props {
  options: Option[];
  selected: string[];
  onSelect: (statusId: string) => void;
}

// A popover, not a Menu, because the note under the statuses is not a menu item.
const StatusPicker = ({ options, selected, onSelect }: Props) => {
  const { formatMessage } = useIntl();
  const [isOpen, setIsOpen] = useState(false);
  const label = formatMessage(messages.batchStatus);

  return (
    <DialogTrigger isOpen={isOpen} onOpenChange={setIsOpen}>
      <Button size={28} icon="status-16">
        {label}
      </Button>
      <Popover aria-label={label} placement="bottom start">
        <ListBox
          aria-label={label}
          selectionMode="single"
          selectedKeys={new Set(selected)}
          disabledKeys={options
            .filter((option) => option.disabled && !option.disabledReason)
            .map((option) => option.value)}
          onSelectionChange={(keys) => {
            const picked = keys === 'all' ? [] : [...keys];
            // An empty selection means the current status was picked again.
            const statusId =
              picked.length === 0 ? selected[0] : String(picked[0]);
            if (statusId) onSelect(statusId);
            setIsOpen(false);
          }}
        >
          {options.map((option) => (
            <ListBoxOption
              key={option.value}
              id={option.value}
              textValue={option.label}
              disabledReason={
                option.disabled ? option.disabledReason : undefined
              }
            >
              <span className={styles.label}>
                {option.color && <ColorDot color={option.color} />}
                {option.label}
              </span>
            </ListBoxOption>
          ))}
        </ListBox>
        <Text variant="small" tone="secondary">
          {formatMessage(messages.statusChangeNotifies)}
        </Text>
      </Popover>
    </DialogTrigger>
  );
};

export default StatusPicker;
