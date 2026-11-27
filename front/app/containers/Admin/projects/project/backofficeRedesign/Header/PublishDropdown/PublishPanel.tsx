import React, { useId } from 'react';

import Button from 'design-system/Button';
import { IconName } from 'design-system/Icon';
import ListBox, { ListBoxOption } from 'design-system/ListBox';
import { PopoverSwitchRow } from 'design-system/SwitchRow';
import { Selection } from 'design-system/types';

import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import useProjectPublicationRecipientCount from 'api/project_publication_recipient_count/useProjectPublicationRecipientCount';
import { IProjectData, Visibility } from 'api/projects/types';
import useUpdateProject from 'api/projects/useUpdateProject';

import {
  FIND_OPTIONS,
  OPEN_OPTIONS,
} from 'containers/Admin/projects/_shared/visibilityOptions';
import visibilityMessages from 'containers/Admin/projects/_shared/visibilityOptions/messages';
import { getMissingItems } from 'containers/Admin/projects/project/backofficeRedesign/ProjectSetupPanel/setupItems';
import useSetupReadiness from 'containers/Admin/projects/project/backofficeRedesign/ProjectSetupPanel/useSetupReadiness';

import { useIntl } from 'utils/cl-intl';

import backofficeRedesignMessages from '../../messages';

import { ConfirmableStatus } from './ConfirmStatusChangeModal';
import GroupsChecklist from './GroupsChecklist';
import messages from './messages';
import { MissingEssentialsIntent } from './MissingEssentialsModal';
import getPublicationState from './publicationState';
import styles from './PublishDropdown.module.css';
import usePublishNow from './usePublishNow';
import 'design-system/tokens.css';

// The visibility icons as the library draws them, in design-system names.
const OPTION_ICONS: Record<string, IconName> = {
  listed: 'eye-16',
  unlisted: 'eye-off-16',
  public: 'users-16',
  admins: 'lock-16',
  groups: 'lock-16',
};

// The first key of a selection; picking the selected row again clears it,
// which leaves nothing to save.
const firstKey = (keys: Selection) =>
  keys === 'all' ? undefined : keys.values().next().value;

interface Props {
  project: IProjectData;
  onSchedule: () => void;
  onConfirmStatusChange: (status: ConfirmableStatus) => void;
  onMissingEssentials: (intent: MissingEssentialsIntent) => void;
  onDone: () => void;
}

const PublishPanel = ({
  project,
  onSchedule,
  onConfirmStatusChange,
  onMissingEssentials,
  onDone,
}: Props) => {
  const { formatMessage, formatDate, formatTime } = useIntl();
  const findLabelId = useId();
  const openLabelId = useId();
  const { mutate: updateProject } = useUpdateProject();
  const { publishNow, isPending } = usePublishNow(project);
  const { readiness, isLoading: readinessLoading } = useSetupReadiness(project);
  const hasMissingItems = getMissingItems(readiness).length > 0;
  const { data: recipientCount } = useProjectPublicationRecipientCount(
    project.id
  );
  const { data: appConfiguration } = useAppConfiguration();
  const tenantTimezone =
    appConfiguration?.data.attributes.settings.core.timezone;

  const {
    listed,
    visible_to,
    scheduled_at,
    publication_email_enabled,
    global_publication_email_enabled,
  } = project.attributes;

  const publicationState = getPublicationState(project);

  const isDraftOrScheduled =
    publicationState === 'draft' || publicationState === 'scheduled';

  const dateOptions: Intl.DateTimeFormatOptions = {
    timeZone: tenantTimezone,
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  };

  const timeOptions: Intl.DateTimeFormatOptions = {
    timeZone: tenantTimezone,
    hour: 'numeric',
    minute: '2-digit',
  };

  const scheduledHeader =
    publicationState === 'scheduled' && scheduled_at
      ? formatMessage(messages.publishStateScheduledAt, {
          date: formatDate(scheduled_at, dateOptions),
          time: formatTime(scheduled_at, timeOptions),
        })
      : null;

  const emailToggleDisabled = !global_publication_email_enabled || !listed;

  const setListed = (nextListed: boolean) =>
    updateProject({ projectId: project.id, listed: nextListed });

  const setVisibleTo = (nextVisibleTo: Visibility) =>
    updateProject({ projectId: project.id, visible_to: nextVisibleTo });

  const handleListedChange = (keys: Selection) => {
    const key = firstKey(keys);
    if (key !== undefined) setListed(key === 'listed');
  };

  const handleVisibleToChange = (keys: Selection) => {
    const option = OPEN_OPTIONS.find(
      (openOption) => openOption.value === firstKey(keys)
    );
    if (option) setVisibleTo(option.value);
  };

  const setSendEmail = (enabled: boolean) =>
    updateProject({
      projectId: project.id,
      publication_email_enabled: enabled,
    });

  const handlePublishNow = () =>
    hasMissingItems ? onMissingEssentials('publish') : publishNow(onDone);

  const handleSchedule = () =>
    hasMissingItems ? onMissingEssentials('schedule') : onSchedule();

  const count = recipientCount?.data.attributes.count;

  return (
    <div className={styles.panel}>
      <div className={styles.lists}>
        {scheduledHeader && (
          <h2 className={styles.header}>{scheduledHeader}</h2>
        )}

        <h3 id={findLabelId} className={styles.groupLabel}>
          {formatMessage(visibilityMessages.publishWhoCanFind)}
        </h3>
        <ListBox
          aria-labelledby={findLabelId}
          selectionMode="single"
          selectedKeys={new Set([listed ? 'listed' : 'unlisted'])}
          onSelectionChange={handleListedChange}
        >
          {FIND_OPTIONS.map((option) => (
            <ListBoxOption
              key={option.value}
              id={option.value}
              icon={OPTION_ICONS[option.value]}
              description={formatMessage(option.description)}
            >
              {formatMessage(option.label)}
            </ListBoxOption>
          ))}
        </ListBox>

        <h3 id={openLabelId} className={styles.groupLabel}>
          {formatMessage(messages.publishWhoCanOpen)}
        </h3>
        <ListBox
          aria-labelledby={openLabelId}
          selectionMode="single"
          selectedKeys={new Set([visible_to])}
          onSelectionChange={handleVisibleToChange}
        >
          {OPEN_OPTIONS.map((option) => (
            <ListBoxOption
              key={option.value}
              id={option.value}
              icon={OPTION_ICONS[option.value]}
              description={formatMessage(
                option.value === 'public'
                  ? messages.publishOpenEveryoneDescription
                  : option.description
              )}
            >
              {formatMessage(option.label)}
            </ListBoxOption>
          ))}
        </ListBox>
        {visible_to === 'groups' && <GroupsChecklist projectId={project.id} />}

        {/* The email goes out on publishing, so a live project has no row for it. */}
        {isDraftOrScheduled && (
        <div className={styles.email}>
          <PopoverSwitchRow
            isSelected={publication_email_enabled && !emailToggleDisabled}
            disabledReason={
              emailToggleDisabled
                ? formatMessage(messages.publishEmailUnavailable)
                : undefined
            }
            onChange={() => setSendEmail(!publication_email_enabled)}
            description={
              count !== undefined
                ? formatMessage(messages.publishEmailRecipients, { count })
                : undefined
            }
          >
            {formatMessage(messages.publishSendEmail)}
          </PopoverSwitchRow>
        </div>
        )}
      </div>

      <div className={styles.footer}>
        {publicationState === 'published' && (
          <>
            <div className={styles.action}>
              <Button
                fullWidth
                variant="secondary"
                size={32}
                onPress={() => onConfirmStatusChange('draft')}
              >
                {formatMessage(
                  backofficeRedesignMessages.publishRestoreToDraft
                )}
              </Button>
            </div>
            <div className={styles.action}>
              <Button
                fullWidth
                variant="secondary"
                size={32}
                onPress={() => onConfirmStatusChange('archived')}
              >
                {formatMessage(messages.publishMoveToArchive)}
              </Button>
            </div>
          </>
        )}

        {isDraftOrScheduled && (
          <>
            <div className={styles.action}>
              <Button
                fullWidth
                variant="secondary"
                size={32}
                icon="calendar-16"
                onPress={handleSchedule}
                isPending={readinessLoading}
              >
                {formatMessage(messages.publishSchedule)}
              </Button>
            </div>
            <div id="e2e-publish-now" className={styles.action}>
              <Button
                fullWidth
                variant="primary"
                size={32}
                onPress={handlePublishNow}
                isPending={isPending || readinessLoading}
              >
                {formatMessage(messages.publishNow)}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PublishPanel;
