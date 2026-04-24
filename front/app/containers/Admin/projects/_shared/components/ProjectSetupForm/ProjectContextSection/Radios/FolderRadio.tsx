import React from 'react';

import { Box, Radio } from '@citizenlab/cl2-component-library';

import { fragmentId as folderFragmentId } from 'containers/Admin/projects/project/projectHeader/FolderProjectDropdown';

import Highlighter from 'components/Highlighter';

import { FormattedMessage, MessageDescriptor } from 'utils/cl-intl';

import { LabelHeaderDescription } from '../../../labels';
import messages from '../messages';
import ProjectFolderSelect from '../ProjectFolderSelect';
import { Props } from '../types';

const FolderRadio = ({
  projectContext,
  onSetContext,
  folder_id,
  onChangeFolder,
  descriptionMessage,
}: Props & { descriptionMessage: MessageDescriptor }) => {
  return (
    <>
      <Radio
        name="folder"
        value="folder"
        currentValue={projectContext}
        label={
          <LabelHeaderDescription
            header={<FormattedMessage {...messages.folder} />}
            description={<FormattedMessage {...descriptionMessage} />}
          />
        }
        onChange={() => onSetContext('folder')}
        mb="12px"
      />
      {projectContext === 'folder' && (
        <Box mb="40px">
          <Highlighter fragmentId={folderFragmentId}>
            <ProjectFolderSelect
              folder_id={folder_id}
              onChange={(folder_id) => {
                onChangeFolder(folder_id);
              }}
            />
          </Highlighter>
        </Box>
      )}
    </>
  );
};

export default FolderRadio;
