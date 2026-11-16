import React from 'react';

import { IOption } from 'typings';

import Banner from 'design-system/Banner';
import { ListBoxOption } from 'design-system/ListBox';
import Select from 'design-system/Select';
import 'design-system/tokens.css';

import { FormattedMessage, useIntl } from 'utils/cl-intl';

import contextMessages from '../ProjectSetupForm/ProjectContextSection/messages';
import { SpaceAndFolderId } from '../ProjectSetupForm/ProjectContextSection/types';
import useProjectContext, {
  NONE,
} from '../ProjectSetupForm/ProjectContextSection/useProjectContext';

import messages from './messages';

const SELECT_SIZES: Record<'medium' | 'compact', 36 | 32> = {
  medium: 36,
  compact: 32,
};

interface Params {
  spaceId?: string | null;
  folderId?: string | null;
  projectInRoot: boolean;
  onChange: (spaceAndFolderId: SpaceAndFolderId) => void;
  size?: keyof typeof SELECT_SIZES;
}

const useContextPickers = ({
  spaceId,
  folderId,
  projectInRoot,
  onChange,
  size = 'medium',
}: Params) => {
  const { formatMessage } = useIntl();
  const projectContext = useProjectContext({
    spaceId,
    folderId,
    projectInRoot,
    onChange,
  });

  if (!projectContext) return null;

  const {
    showSpaceSelect,
    spaceOptions,
    folderOptions,
    handleSpaceChange,
    handleFolderChange,
    showApprovalWarning,
  } = projectContext;

  const spacePicker = showSpaceSelect ? (
    <Select
      label={formatMessage(contextMessages.spaceLabel)}
      size={SELECT_SIZES[size]}
      items={[
        { value: NONE, label: formatMessage(messages.contextNoSpace) },
        ...spaceOptions,
      ]}
      value={spaceId ?? NONE}
      onChange={(key) => {
        if (typeof key === 'string') handleSpaceChange(key);
      }}
    >
      {(option: IOption) => (
        <ListBoxOption id={String(option.value)} icon="space-16">
          {option.label}
        </ListBoxOption>
      )}
    </Select>
  ) : null;

  const folderPicker = (
    <Select
      label={formatMessage(contextMessages.folderLabel)}
      size={SELECT_SIZES[size]}
      items={[
        { value: NONE, label: formatMessage(messages.contextNoFolder) },
        ...folderOptions,
      ]}
      value={folderId ?? NONE}
      onChange={(key) => {
        if (typeof key === 'string') handleFolderChange(key);
      }}
    >
      {(option: IOption) => (
        <ListBoxOption id={String(option.value)} icon="folder-16">
          {option.label}
        </ListBoxOption>
      )}
    </Select>
  );

  const approvalWarning = showApprovalWarning ? (
    <Banner tone="warning">
      <FormattedMessage
        {...(showSpaceSelect
          ? contextMessages.approvalNeededWithSpaces
          : contextMessages.approvalNeededWithoutSpaces)}
      />
    </Banner>
  ) : null;

  return { spacePicker, folderPicker, approvalWarning };
};

export default useContextPickers;
