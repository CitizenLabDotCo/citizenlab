import React from 'react';

import { Box, Icon } from '@citizenlab/cl2-component-library';

import { IProjectData } from 'api/projects/types';

import {
  NoPostPage,
  NoPostHeader,
  NoPostDescription,
} from 'components/admin/PostManager/components/PostTable/NoPost';
import Button from 'components/UI/ButtonWithLink';

import { FormattedMessage } from 'utils/cl-intl';

import messages from './messages';

interface Props {
  isJobInProgress: boolean;
  importedCount?: number;
  totalInputsToBeImported?: number;
  project: IProjectData | undefined;
  phaseId: string;
  setShowPastInputsModal: (value: React.SetStateAction<boolean>) => void;
}

const NoInputsDisplay = ({
  isJobInProgress,
  importedCount,
  totalInputsToBeImported,
  project,
  phaseId,
  setShowPastInputsModal,
}: Props) => {
  return (
    <NoPostPage>
      <Icon name="sidebar-pages-menu" />
      <NoPostHeader>
        {isJobInProgress ? (
          <FormattedMessage
            {...messages.inputImportProgress}
            values={{ importedCount, totalCount: totalInputsToBeImported }}
          />
        ) : (
          <FormattedMessage {...messages.noInputs} />
        )}
      </NoPostHeader>
      <NoPostDescription>
        <FormattedMessage {...messages.noInputsDescription} />
      </NoPostDescription>
      <Box display="flex" gap="8px">
        <Button
          buttonStyle="secondary-outlined"
          width="auto"
          linkTo={`/projects/${project?.attributes.slug}/ideas/new?phase_id=${phaseId}`}
        >
          <FormattedMessage {...messages.createInput} />
        </Button>
        <Button
          buttonStyle="admin-dark"
          onClick={() => setShowPastInputsModal(true)}
          disabled={!!isJobInProgress}
        >
          <FormattedMessage {...messages.startFromPastInputs} />
        </Button>
      </Box>
    </NoPostPage>
  );
};

export default NoInputsDisplay;
