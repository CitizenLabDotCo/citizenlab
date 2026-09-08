import React, { useState } from 'react';

import {
  Box,
  Button,
  Divider,
  Input,
  Text,
  Tooltip,
  colors,
} from '@citizenlab/cl2-component-library';

import useAuthUser from 'api/me/useAuthUser';
import useAddProjectModerator from 'api/project_moderators/useAddProjectModerator';
import useProjectModerators from 'api/project_moderators/useProjectModerators';
import { IProjectData } from 'api/projects/types';

import useFeatureFlag from 'hooks/useFeatureFlag';

import { trackEventByName } from 'utils/analytics';
import { useIntl } from 'utils/cl-intl';

import projectHeaderMessages from '../../../projectHeader/messages';
import shareLinkTracks from '../../../projectHeader/ShareLink/tracks';
import HeaderDropdown from '../HeaderDropdown';
import messages from '../messages';

import AccessPeopleRow from './AccessPeopleRow';

const splitEmails = (value: string) =>
  value
    .split(',')
    .map((email) => email.trim())
    .filter(Boolean);

interface Props {
  project: IProjectData;
  opened: boolean;
  onOpenChange: (opened: boolean) => void;
}

const ShareDropdown = ({ project, opened, onOpenChange }: Props) => {
  const { formatMessage } = useIntl();
  const isPreviewLinkEnabled = useFeatureFlag({ name: 'project_preview_link' });
  const { data: authUser } = useAuthUser();
  const { data: moderators } = useProjectModerators({ projectId: project.id });
  const { mutateAsync: addProjectModerator, isPending: isInviting } =
    useAddProjectModerator();

  const [invitees, setInvitees] = useState('');
  const [linkCopied, setLinkCopied] = useState(false);

  const { slug, preview_token } = project.attributes;

  const handleInvite = async () => {
    const emails = splitEmails(invitees);
    if (emails.length === 0) return;

    for (const user_email of emails) {
      await addProjectModerator({ projectId: project.id, user_email });
    }
    setInvitees('');
  };

  const handleCopyPreviewLink = () => {
    navigator.clipboard.writeText(
      `${window.location.origin}/projects/${slug}/preview/${preview_token}`
    );
    setLinkCopied(true);
    trackEventByName(shareLinkTracks.copyProjectPreviewLink);
  };

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
        <Box>
          <Text m="0 0 16px 0" fontSize="m" color="teal500">
            {formatMessage(projectHeaderMessages.shareTitle)}
          </Text>

          <Text m="0 0 4px 0" fontSize="s" color="textSecondary">
            {formatMessage(messages.shareInvitePeople)}
          </Text>
          <Box display="flex" gap="8px" alignItems="flex-start">
            <Box flex="1 1 auto" minWidth="0">
              <Input
                type="text"
                value={invitees}
                onChange={setInvitees}
                placeholder={formatMessage(messages.shareInvitePlaceholder)}
                aria-label={formatMessage(messages.shareInvitePeople)}
              />
            </Box>
            <Button
              buttonStyle="admin-dark"
              onClick={handleInvite}
              processing={isInviting}
              disabled={splitEmails(invitees).length === 0}
            >
              {formatMessage(messages.shareInvite)}
            </Button>
          </Box>

          <Text m="16px 0 0 0" fontSize="s" color="textSecondary">
            {formatMessage(messages.sharePeopleWithAccess)}
          </Text>
          <Box display="flex" flexDirection="column">
            {moderators?.data.map((moderator) => (
              <AccessPeopleRow
                key={moderator.id}
                user={moderator}
                isAuthUser={moderator.id === authUser?.data.id}
              />
            ))}
          </Box>

          <Divider />

          <Text m="0 0 12px 0" fontSize="s" color="textSecondary">
            {formatMessage(messages.sharePreviewExplanation)}
          </Text>
          <Tooltip
            content={formatMessage(
              projectHeaderMessages.shareLinkUpsellTooltip
            )}
            disabled={isPreviewLinkEnabled}
            width="100%"
          >
            <Button
              buttonStyle="secondary-outlined"
              icon={linkCopied ? 'check-circle' : 'link'}
              iconColor={linkCopied ? colors.success : undefined}
              onClick={handleCopyPreviewLink}
              disabled={!isPreviewLinkEnabled}
              width="100%"
              id="e2e-share-preview-link"
            >
              {formatMessage(
                linkCopied
                  ? projectHeaderMessages.shareLinkCopied
                  : messages.sharePreviewLink
              )}
            </Button>
          </Tooltip>
        </Box>
      }
    />
  );
};

export default ShareDropdown;
