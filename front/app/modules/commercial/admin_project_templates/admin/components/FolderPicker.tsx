import React from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';
import { IOption } from 'typings';

import pickerMessages from 'containers/Admin/projects/_shared/components/ProjectContextPickers/messages';
import contextMessages from 'containers/Admin/projects/_shared/components/ProjectSetupForm/ProjectContextSection/messages';

import OptionPicker from 'components/UI/OptionPicker';

import { useIntl } from 'utils/cl-intl';

interface Props {
  options: IOption[];
  value: string | null;
  onChange: (folderId: string) => void;
}

const FolderPicker = ({ options, value, onChange }: Props) => {
  const { formatMessage } = useIntl();
  const title = formatMessage(contextMessages.folderLabel);

  return (
    <Box display="flex" alignItems="center" gap="12px" minWidth="0">
      <Text as="span" variant="boLabel" m="0px">
        {title}
      </Text>
      <OptionPicker
        title={title}
        description={formatMessage(pickerMessages.contextFolderDescription)}
        searchPlaceholder={formatMessage(pickerMessages.contextSearchFolders)}
        options={options.map((option) => ({
          value: String(option.value),
          label: option.label,
          icon: 'folder-outline',
        }))}
        value={value ?? undefined}
        onChange={onChange}
      />
    </Box>
  );
};

export default FolderPicker;
