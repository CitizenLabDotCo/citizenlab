import React, { useState } from 'react';

import { IProjectData } from 'api/projects/types';

import { useIntl } from 'utils/cl-intl';

import projectHeaderMessages from '../../../projectHeader/messages';
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
