import React, { useState } from 'react';

import Badge from 'design-system/Badge';
import Button from 'design-system/Button';

import SettingsSection from 'containers/Admin/projects/project/backofficeRedesign/_shared/components/SettingsModal/SettingsSection';
import backofficeRedesignMessages from 'containers/Admin/projects/project/backofficeRedesign/messages';

import { useIntl } from 'utils/cl-intl';

import AddFilesModal from './AddFilesModal';
import ManageFilesModal from './ManageFilesModal';
import messages from './messages';
import useFilesCount from './useFilesCount';
import { FilesDraft } from './useFilesDraft';
import 'design-system/tokens.css';

interface Props {
  projectId: string;
  draft: FilesDraft;
}

const ResourcesSection = ({ projectId, draft }: Props) => {
  const { formatMessage } = useIntl();
  const savedCount = useFilesCount(projectId);
  const [manageModalOpened, setManageModalOpened] = useState(false);
  const [addModalOpened, setAddModalOpened] = useState(false);

  if (savedCount === undefined) return null;

  const count = savedCount + draft.uploads.length - draft.deletedIds.length;

  return (
    <SettingsSection
      title={formatMessage(backofficeRedesignMessages.filesSection)}
      description={formatMessage(messages.filesDescription)}
      action={
        <Button
          variant="secondary"
          onPress={() =>
            count > 0 ? setManageModalOpened(true) : setAddModalOpened(true)
          }
        >
          {formatMessage(count > 0 ? messages.manageFiles : messages.addFiles)}
        </Button>
      }
    >
      {count > 0 && (
        <Badge tone="selected" icon="paperclip-16">
          {formatMessage(messages.filesCount, { count })}
        </Badge>
      )}
      <ManageFilesModal
        projectId={projectId}
        draft={draft}
        opened={manageModalOpened}
        onClose={() => setManageModalOpened(false)}
        onAddFiles={() => setAddModalOpened(true)}
      />
      <AddFilesModal
        draft={draft}
        opened={addModalOpened}
        onClose={() => setAddModalOpened(false)}
      />
    </SettingsSection>
  );
};

export default ResourcesSection;
