import React from 'react';

import { Box, Error, Select } from '@citizenlab/cl2-component-library';
import { IOption } from 'typings';

import { fragmentId as folderFragmentId } from 'containers/Admin/projects/project/projectHeader/FolderProjectDropdown';

import Highlighter from 'components/Highlighter';
import Warning from 'components/UI/Warning';

import { FormattedMessage, useIntl } from 'utils/cl-intl';

import messages from './messages';
import { Props } from './types';
import useProjectContext, { NONE } from './useProjectContext';

const Inner = ({
  spaceId,
  folderId,
  projectInRoot,
  error,
  onChange,
}: Props) => {
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

  return (
    <Box display="flex" flexDirection="column" gap="20px">
      {showSpaceSelect && (
        <Select
          id="project-context-space-select"
          label={formatMessage(messages.spaceLabel)}
          labelTooltipText={formatMessage(messages.spaceTooltip)}
          value={spaceId ?? NONE}
          options={[
            { value: NONE, label: formatMessage(messages.noSpace) },
            ...spaceOptions,
          ]}
          onChange={({ value }: IOption) => handleSpaceChange(value)}
          dataCy="space-select"
        />
      )}
      <Highlighter fragmentId={folderFragmentId}>
        <Select
          id="project-context-folder-select"
          label={formatMessage(messages.folderLabel)}
          value={folderId ?? NONE}
          options={[
            { value: NONE, label: formatMessage(messages.noFolder) },
            ...folderOptions,
          ]}
          onChange={({ value }: IOption) => handleFolderChange(value)}
          dataCy="project-folder-select"
        />
      </Highlighter>
      {error && (
        <Error
          text={formatMessage(
            showSpaceSelect
              ? messages.canOnlyMoveToManagedSpaceOrFolder
              : messages.canOnlyMoveToManagedFolder
          )}
        />
      )}
      {showApprovalWarning && (
        <Warning>
          <FormattedMessage
            {...(showSpaceSelect
              ? messages.approvalNeededWithSpaces
              : messages.approvalNeededWithoutSpaces)}
          />
        </Warning>
      )}
    </Box>
  );
};

export default Inner;
