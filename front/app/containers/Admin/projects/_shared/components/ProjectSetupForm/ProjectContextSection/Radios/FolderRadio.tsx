import React from 'react';

import { Box, Radio, Error } from '@citizenlab/cl2-component-library';

import { fragmentId as folderFragmentId } from 'containers/Admin/projects/project/projectHeader/FolderProjectDropdown';

import Highlighter from 'components/Highlighter';

import { FormattedMessage, useIntl } from 'utils/cl-intl';

import { LabelHeaderDescription } from '../../../labels';
import messages from '../messages';
import ProjectFolderSelect from '../ProjectFolderSelect';
import { Props } from '../types';

const FolderRadio = ({
  projectContext,
  folder_id,
  error,
  onSetContext,
  onChangeFolder,
}: Props) => {
  const { formatMessage } = useIntl();

  return (
    <>
      <Radio
        name="folder"
        value="folder"
        currentValue={projectContext}
        label={
          <LabelHeaderDescription
            header={<FormattedMessage {...messages.folder} />}
            description={<FormattedMessage {...messages.folderDescription} />}
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
              onChange={onChangeFolder}
            />
          </Highlighter>
          {error && <Error text={formatMessage(messages.folderError)} />}
        </Box>
      )}
    </>
  );
};

export default FolderRadio;
