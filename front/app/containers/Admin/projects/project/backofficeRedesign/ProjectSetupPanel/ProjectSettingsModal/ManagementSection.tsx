import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import useAddProjectModerator from 'api/project_moderators/useAddProjectModerator';

import useFeatureFlag from 'hooks/useFeatureFlag';

import projectManagementMessages from 'containers/Admin/projects/project/permissions/Project/ProjectManagement/messages';

import addModeratorMessages from 'components/admin/AddModerator/messages';
import useAddModerator from 'components/admin/AddModerator/useAddModerator';
import SeatInfo from 'components/admin/SeatBasedBilling/SeatInfo';
import Outlet from 'components/Outlet';
import SettingsSection from 'components/UI/SettingsModal/SettingsSection';
import SettingsSections from 'components/UI/SettingsModal/SettingsSections';

import { FormattedMessage, useIntl } from 'utils/cl-intl';

import ManagerInvite from './ManagerInvite';
import ManagerSearch from './ManagerSearch';
import ManagersList from './ManagersList';
import OrDivider from './OrDivider';

interface Props {
  projectId: string;
}

const ManagementSection = ({ projectId }: Props) => {
  const { formatMessage } = useIntl();
  const { mutateAsync: addProjectModerator } = useAddProjectModerator();
  const { addModerator, seatLimitModal } = useAddModerator(async (params) => {
    await addProjectModerator({ ...params, projectId });
  });

  // Email invites need password login, so we hide them without it.
  const passwordLoginEnabled = useFeatureFlag({ name: 'password_login' });

  return (
    <SettingsSections>
      <Outlet
        id="app.containers.Admin.projects.project.settings.management"
        projectId={projectId}
      />
      <SettingsSection
        title={formatMessage(projectManagementMessages.addProjectManagers)}
        tooltip={
          <FormattedMessage
            {...projectManagementMessages.projectManagerTooltipContent}
            values={{
              moderationInfoCenterLink: (
                <a
                  href={formatMessage(
                    projectManagementMessages.moreInfoModeratorLink2
                  )}
                  target="_blank"
                  rel="noreferrer"
                >
                  <FormattedMessage
                    {...projectManagementMessages.moderationInfoCenterLinkText}
                  />
                </a>
              ),
            }}
          />
        }
      >
        <Box display="flex" flexDirection="column" gap="12px">
          <ManagerSearch
            projectId={projectId}
            onAdd={(user_id) => addModerator({ user_id })}
          />
          {passwordLoginEnabled && (
            <>
              <OrDivider />
              <ManagerInvite
                onInvite={(user_email) => addModerator({ user_email })}
              />
            </>
          )}
        </Box>
      </SettingsSection>
      <SettingsSection
        title={formatMessage(addModeratorMessages.whoAreTheManagers)}
      >
        <ManagersList projectId={projectId} />
        <Box mt="12px">
          <SeatInfo seatType="moderator" />
        </Box>
      </SettingsSection>
      {seatLimitModal}
    </SettingsSections>
  );
};

export default ManagementSection;
