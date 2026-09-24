import React, { useState } from 'react';

import { IProjectData } from 'api/projects/types';

import projectHeaderMessages from 'containers/Admin/projects/project/projectHeader/messages';

import { useIntl } from 'utils/cl-intl';

import HeaderDropdown from '../HeaderDropdown';

import SharePanel from './SharePanel';

interface Props {
  project: IProjectData;
  opened: boolean;
  onOpenChange: (opened: boolean) => void;
}

const ShareDropdown = ({ project, opened, onOpenChange }: Props) => {
  const { formatMessage } = useIntl();
  const [linkCopied, setLinkCopied] = useState(false);

  return (
    <HeaderDropdown
      opened={opened}
      onOpenChange={(nextOpened) => {
        setLinkCopied(false);
        onOpenChange(nextOpened);
      }}
      label={formatMessage(projectHeaderMessages.share)}
      buttonStyle="secondary-outlined"
      icon="chevron-down"
      id="e2e-share-dropdown-toggle"
      width="420px"
      content={
        <SharePanel
          project={project}
          linkCopied={linkCopied}
          onLinkCopied={() => setLinkCopied(true)}
        />
      }
    />
  );
};

export default ShareDropdown;
