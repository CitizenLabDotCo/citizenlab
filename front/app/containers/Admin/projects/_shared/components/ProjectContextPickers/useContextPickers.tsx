import React from 'react';

import { IconNames } from '@citizenlab/cl2-component-library';
import { IOption } from 'typings';

import OptionPicker, { PickerOption } from 'components/UI/OptionPicker';
import Warning from 'components/UI/Warning';

import { FormattedMessage, useIntl } from 'utils/cl-intl';

import contextMessages from '../ProjectSetupForm/ProjectContextSection/messages';
import { SpaceAndFolderId } from '../ProjectSetupForm/ProjectContextSection/types';
import useProjectContext, {
  NONE,
} from '../ProjectSetupForm/ProjectContextSection/useProjectContext';

import messages from './messages';

const withIcon = (
  options: IOption[],
  icon: IconNames
): PickerOption<string>[] =>
  options.map(({ value, label }) => ({ value, label, icon }));

interface Params {
  spaceId?: string | null;
  folderId?: string | null;
  projectInRoot: boolean;
  onChange: (spaceAndFolderId: SpaceAndFolderId) => void;
}

const useContextPickers = ({
  spaceId,
  folderId,
  projectInRoot,
  onChange,
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
    <OptionPicker
      title={formatMessage(contextMessages.spaceLabel)}
      description={formatMessage(messages.contextSpaceDescription)}
      searchPlaceholder={formatMessage(messages.contextSearchSpaces)}
      options={withIcon(
        [
          { value: NONE, label: formatMessage(messages.contextNoSpace) },
          ...spaceOptions,
        ],
        'spaces'
      )}
      value={spaceId ?? NONE}
      onChange={handleSpaceChange}
    />
  ) : null;

  const folderPicker = (
    <OptionPicker
      title={formatMessage(contextMessages.folderLabel)}
      description={formatMessage(messages.contextFolderDescription)}
      searchPlaceholder={formatMessage(messages.contextSearchFolders)}
      options={withIcon(
        [
          { value: NONE, label: formatMessage(messages.contextNoFolder) },
          ...folderOptions,
        ],
        'folder-outline'
      )}
      value={folderId ?? NONE}
      onChange={handleFolderChange}
    />
  );

  const approvalWarning = showApprovalWarning ? (
    <Warning>
      <FormattedMessage
        {...(showSpaceSelect
          ? contextMessages.approvalNeededWithSpaces
          : contextMessages.approvalNeededWithoutSpaces)}
      />
    </Warning>
  ) : null;

  return { spacePicker, folderPicker, approvalWarning };
};

export default useContextPickers;
