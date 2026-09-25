import React from 'react';

import { Box, Divider, IconNames } from '@citizenlab/cl2-component-library';
import { IOption } from 'typings';

import { IProjectData } from 'api/projects/types';
import useUpdateProject from 'api/projects/useUpdateProject';

import contextMessages from 'containers/Admin/projects/_shared/components/ProjectSetupForm/ProjectContextSection/messages';
import useProjectContext, {
  NONE,
} from 'containers/Admin/projects/_shared/components/ProjectSetupForm/ProjectContextSection/useProjectContext';

import OptionPicker, { PickerOption } from 'components/UI/OptionPicker';
import Warning from 'components/UI/Warning';

import { FormattedMessage, useIntl } from 'utils/cl-intl';

import messages from '../../messages';
import PanelHeading from '../PanelHeading';

const withIcon = (
  options: IOption[],
  icon: IconNames
): PickerOption<string>[] =>
  options.map(({ value, label }) => ({ value, label, icon }));

interface Props {
  project: IProjectData;
}

const ContextDropdowns = ({ project }: Props) => {
  const { formatMessage } = useIntl();
  const { mutate: updateProject } = useUpdateProject();

  const { space_id: spaceId, folder_id: folderId } = project.attributes;

  const projectContext = useProjectContext({
    spaceId,
    folderId,
    projectInRoot: !spaceId && !folderId,
    onChange: (spaceAndFolderId) =>
      updateProject({ projectId: project.id, ...spaceAndFolderId }),
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
    <>
      <PanelHeading title={formatMessage(contextMessages.projectContext)} />
      <Box
        display="flex"
        flexDirection="column"
        alignItems="flex-start"
        gap="8px"
      >
        {showSpaceSelect && (
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
        )}

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

        {showApprovalWarning && (
          <Warning>
            <FormattedMessage
              {...(showSpaceSelect
                ? contextMessages.approvalNeededWithSpaces
                : contextMessages.approvalNeededWithoutSpaces)}
            />
          </Warning>
        )}
      </Box>
      <Divider />
    </>
  );
};

export default ContextDropdowns;
