import React from 'react';

import { IOption } from 'typings';

import contextMessages from 'containers/Admin/projects/_shared/components/ProjectSetupForm/ProjectContextSection/messages';

import { ListBoxOption } from 'design-system/ListBox';
import Select from 'design-system/Select';

import { useIntl } from 'utils/cl-intl';
import 'design-system/tokens.css';

interface Props {
  options: IOption[];
  value: string | null;
  onChange: (folderId: string) => void;
}

const FolderPicker = ({ options, value, onChange }: Props) => {
  const { formatMessage } = useIntl();

  return (
    <Select
      label={formatMessage(contextMessages.folderLabel)}
      items={options}
      value={value}
      onChange={(key) => {
        if (typeof key === 'string') onChange(key);
      }}
    >
      {(option: IOption) => (
        <ListBoxOption id={String(option.value)} icon="folder-16">
          {option.label}
        </ListBoxOption>
      )}
    </Select>
  );
};

export default FolderPicker;
