import React from 'react';

import useFiles from 'api/files/useFiles';

import OptionPicker, { PickerOption } from 'components/UI/OptionPicker';

import { useIntl } from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';

import messages from '../../messages';
import PanelHeading from '../PanelHeading';

const ADD_FILES = 'add-files';

interface Props {
  projectId: string;
}

// temporary until we have a proper design for this dropdown. For now, it will just redirect to the files page.

const FilesDropdown = ({ projectId }: Props) => {
  const { formatMessage } = useIntl();
  const { data: files } = useFiles({ project: [projectId] });

  if (!files) return null;

  const title = formatMessage(messages.filesSection);
  const options: PickerOption<string>[] = [
    ...files.data.map(
      (file): PickerOption<string> => ({
        value: file.id,
        icon: 'paperclip',
        label: file.attributes.name,
      })
    ),
    {
      value: ADD_FILES,
      icon: 'plus',
      label: formatMessage(messages.addFiles),
    },
  ];

  return (
    <>
      <PanelHeading title={title} />
      <OptionPicker
        title={title}
        description={formatMessage(messages.filesDescription)}
        options={options}
        triggerIcon="paperclip"
        triggerLabel={
          files.data.length > 0
            ? formatMessage(messages.filesCount, { count: files.data.length })
            : formatMessage(messages.noAttachments)
        }
        onChange={() =>
          clHistory.push(
            `/admin/projects/${projectId}/files?project_backoffice_redesign`
          )
        }
      />
    </>
  );
};

export default FilesDropdown;
