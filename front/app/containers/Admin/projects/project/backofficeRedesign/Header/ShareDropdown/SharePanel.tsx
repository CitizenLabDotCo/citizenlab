import React, { useEffect, useRef, useState } from 'react';

import Button from 'design-system/Button';
import Divider from 'design-system/Divider';
import TextField from 'design-system/TextField';

import useAuthUser from 'api/me/useAuthUser';
import useAddProjectModerator from 'api/project_moderators/useAddProjectModerator';
import useProjectModerators from 'api/project_moderators/useProjectModerators';
import { IProjectData } from 'api/projects/types';

import useFeatureFlag from 'hooks/useFeatureFlag';

import projectHeaderMessages from 'containers/Admin/projects/project/projectHeader/messages';
import shareLinkTracks from 'containers/Admin/projects/project/projectHeader/ShareLink/tracks';

import { trackEventByName } from 'utils/analytics';
import { useIntl } from 'utils/cl-intl';

import AccessPeopleRow from './AccessPeopleRow';
import messages from './messages';
import styles from './ShareDropdown.module.css';
import 'design-system/tokens.css';

const splitEmails = (value: string) =>
  value
    .split(',')
    .map((email) => email.trim())
    .filter(Boolean);

interface Props {
  project: IProjectData;
  linkCopied: boolean;
  onLinkCopied: () => void;
}

const SharePanel = ({ project, linkCopied, onLinkCopied }: Props) => {
  const { formatMessage } = useIntl();
  const isPreviewLinkEnabled = useFeatureFlag({ name: 'project_preview_link' });
  const { data: authUser } = useAuthUser();
  const { data: moderators } = useProjectModerators({ projectId: project.id });
  const { mutateAsync: addProjectModerator, isPending: isInviting } =
    useAddProjectModerator();

  const [invitees, setInvitees] = useState('');
  const peopleListRef = useRef<HTMLDivElement>(null);

  // The list scrolls inside the dropdown, which would otherwise scroll the
  // page along with it once the list hits its end.
  useEffect(() => {
    const peopleList = peopleListRef.current;
    if (!peopleList) return;

    const keepWheelLocal = (event: WheelEvent) => event.stopPropagation();
    peopleList.addEventListener('wheel', keepWheelLocal);

    return () => peopleList.removeEventListener('wheel', keepWheelLocal);
  }, []);

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
    onLinkCopied();
    trackEventByName(shareLinkTracks.copyProjectPreviewLink);
  };

  return (
    <div className={styles.panel}>
      <h2 className={styles.title}>
        {formatMessage(projectHeaderMessages.shareTitle)}
      </h2>

      <div className={styles.inviteRow}>
        <div className={styles.inviteField}>
          <TextField
            label={formatMessage(messages.shareInvitePeople)}
            size={32}
            value={invitees}
            onChange={setInvitees}
            placeholder={formatMessage(messages.shareInvitePlaceholder)}
          />
        </div>
        <Button
          variant="primary"
          size={32}
          onPress={handleInvite}
          isPending={isInviting}
          isDisabled={splitEmails(invitees).length === 0}
        >
          {formatMessage(messages.shareInvite)}
        </Button>
      </div>

      <h3 className={styles.sectionTitle}>
        {formatMessage(messages.sharePeopleWithAccess)}
      </h3>
      <div ref={peopleListRef} className={styles.peopleList}>
        {moderators?.data.map((moderator) => (
          <AccessPeopleRow
            key={moderator.id}
            user={moderator}
            isAuthUser={moderator.id === authUser?.data.id}
          />
        ))}
      </div>

      <div className={styles.divider}>
        <Divider />
      </div>

      <p className={styles.helper}>
        {formatMessage(messages.sharePreviewExplanation)}
      </p>
      <Button
        fullWidth
        id="e2e-share-preview-link"
        variant="secondary"
        size={32}
        icon={linkCopied ? 'circle-check-filled-16' : 'link-16'}
        onPress={handleCopyPreviewLink}
        isDisabled={!isPreviewLinkEnabled}
        disabledReason={
          isPreviewLinkEnabled
            ? undefined
            : formatMessage(projectHeaderMessages.shareLinkUpsellTooltip)
        }
      >
        {formatMessage(
          linkCopied
            ? projectHeaderMessages.shareLinkCopied
            : messages.sharePreviewLink
        )}
      </Button>
    </div>
  );
};

export default SharePanel;
