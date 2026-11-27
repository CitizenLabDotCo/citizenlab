import React, { useEffect, useRef, useState } from 'react';

import Button from 'design-system/Button';
import { InCardContext } from 'design-system/Field';
import TextField from 'design-system/TextField';

import useAuthUser from 'api/me/useAuthUser';
import useAddProjectModerator from 'api/project_moderators/useAddProjectModerator';
import { IProjectData } from 'api/projects/types';
import useUsers from 'api/users/useUsers';

import useFeatureFlag from 'hooks/useFeatureFlag';

import projectHeaderMessages from 'containers/Admin/projects/project/projectHeader/messages';
import shareLinkTracks from 'containers/Admin/projects/project/projectHeader/ShareLink/tracks';

import { trackEventByName } from 'utils/analytics';
import { MessageDescriptor, useIntl } from 'utils/cl-intl';

import getPublicationState, {
  PublicationState,
} from '../PublishDropdown/publicationState';

import AccessPeopleRow from './AccessPeopleRow';
import messages from './messages';
import styles from './ShareDropdown.module.css';
import 'design-system/tokens.css';

// A live project shares its own address instead, with nothing to explain.
const PREVIEW_EXPLANATIONS: Partial<
  Record<PublicationState, MessageDescriptor>
> = {
  draft: messages.sharePreviewExplanation,
  scheduled: messages.shareScheduledPreviewExplanation,
  archived: messages.shareArchivedPreviewExplanation,
};

// The list scrolls; one page holds the people of nearly every project.
const PEOPLE_PAGE_SIZE = 100;

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
  // Admins and the project's managers: everyone who can open it here.
  const { data: people } = useUsers({
    can_moderate_project: project.id,
    // Keeps people who have not accepted their invite yet.
    include_inactive: true,
    pageSize: PEOPLE_PAGE_SIZE,
  });
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
  const publicationState = getPublicationState(project);
  const isLive = publicationState === 'published';
  const previewExplanation = PREVIEW_EXPLANATIONS[publicationState];

  // The signed-in person leads the list, as "you".
  const sortedPeople = [...(people?.data ?? [])].sort(
    (a, b) =>
      Number(b.id === authUser?.data.id) - Number(a.id === authUser?.data.id)
  );

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

  const handleCopyProjectLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/projects/${slug}`);
    onLinkCopied();
  };

  return (
    <InCardContext.Provider value>
      <div className={styles.panel}>
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
          {sortedPeople.map((person) => (
            <AccessPeopleRow
              key={person.id}
              user={person}
              isAuthUser={person.id === authUser?.data.id}
            />
          ))}
        </div>

        <div className={styles.linkSection}>
          {previewExplanation && (
            <p className={styles.helper}>{formatMessage(previewExplanation)}</p>
          )}
          {isLive ? (
            <Button
              fullWidth
              id="e2e-share-project-link"
              variant="secondary"
              size={32}
              icon={linkCopied ? 'circle-check-filled-16' : 'link-16'}
              onPress={handleCopyProjectLink}
            >
              {formatMessage(
                linkCopied
                  ? projectHeaderMessages.shareLinkCopied
                  : messages.shareCopyLink
              )}
            </Button>
          ) : (
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
          )}
        </div>
      </div>
    </InCardContext.Provider>
  );
};

export default SharePanel;
