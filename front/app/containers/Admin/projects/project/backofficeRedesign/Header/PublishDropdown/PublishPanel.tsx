import React from 'react';

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

import Button from 'design-system/Button';
import Divider from 'design-system/Divider';
import RadioGroup, { Radio } from 'design-system/RadioGroup';
import { PopoverSwitchRow } from 'design-system/SwitchRow';
import 'design-system/tokens.css';

import { MessageDescriptor, useIntl } from 'utils/cl-intl';

import backofficeRedesignMessages from '../../messages';

import { ConfirmableStatus } from './ConfirmStatusChangeModal';
import GroupsChecklist from './GroupsChecklist';
import messages from './messages';
import { MissingEssentialsIntent } from './MissingEssentialsModal';
import getPublicationState, { PublicationState } from './publicationState';
import styles from './PublishDropdown.module.css';
import usePublishNow from './usePublishNow';

const HEADER_MESSAGES: Record<PublicationState, MessageDescriptor> = {
  published: messages.publishStatePublished,
  archived: messages.publishStateArchived,
  scheduled: messages.publishStateScheduled,
  draft: messages.publishStateDraft,
};

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

  const header =
    publicationState === 'scheduled' && scheduled_at
      ? formatMessage(messages.publishStateScheduledAt, {
          date: formatDate(scheduled_at, dateOptions),
          time: formatTime(scheduled_at, timeOptions),
        })
      : formatMessage(HEADER_MESSAGES[publicationState]);

  const emailToggleDisabled = !global_publication_email_enabled || !listed;

  const setListed = (nextListed: boolean) =>
    updateProject({ projectId: project.id, listed: nextListed });

  const setVisibleTo = (nextVisibleTo: Visibility) =>
    updateProject({ projectId: project.id, visible_to: nextVisibleTo });

  const handleVisibleToChange = (value: string) => {
    const option = OPEN_OPTIONS.find(
      (openOption) => openOption.value === value
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
      <h2 className={styles.header}>{header}</h2>

      <div className={styles.radioGroups}>
        <RadioGroup
          label={formatMessage(visibilityMessages.publishWhoCanFind)}
          value={listed ? 'listed' : 'unlisted'}
          onChange={(value) => setListed(value === 'listed')}
        >
          {FIND_OPTIONS.map((option) => (
            <Radio key={option.value} value={option.value}>
              <span className={styles.option}>
                <span className={styles.optionLabel}>
                  {formatMessage(option.label)}
                </span>
                <span className={styles.optionDescription}>
                  {formatMessage(option.description)}
                </span>
              </span>
            </Radio>
          ))}
        </RadioGroup>

        <RadioGroup
          label={formatMessage(visibilityMessages.publishWhoCanSee)}
          value={visible_to}
          onChange={handleVisibleToChange}
        >
          {OPEN_OPTIONS.map((option) => (
            <Radio key={option.value} value={option.value}>
              <span className={styles.option}>
                <span className={styles.optionLabel}>
                  {formatMessage(option.label)}
                </span>
                <span className={styles.optionDescription}>
                  {formatMessage(option.description)}
                </span>
              </span>
            </Radio>
          ))}
        </RadioGroup>
      </div>
      {visible_to === 'groups' && <GroupsChecklist projectId={project.id} />}

      <div className={styles.divider}>
        <Divider />
      </div>

      <div className={styles.emailRow}>
        <PopoverSwitchRow
          isSelected={publication_email_enabled && !emailToggleDisabled}
          disabledReason={
            emailToggleDisabled
              ? formatMessage(messages.publishEmailUnavailable)
              : undefined
          }
          onChange={() => setSendEmail(!publication_email_enabled)}
        >
          {formatMessage(messages.publishSendEmail)}
        </PopoverSwitchRow>
        {count !== undefined && (
          <p className={styles.micro}>
            {formatMessage(messages.publishEmailRecipients, { count })}
          </p>
        )}
      </div>

      <div className={styles.footer}>
        {publicationState === 'published' && (
          <>
            <div className={styles.action}>
              <Button
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
                variant="secondary"
                size={32}
                onPress={() => onConfirmStatusChange('archived')}
              >
                {formatMessage(messages.publishMoveToArchive)}
              </Button>
            </div>
          </>
        )}

        {publicationState === 'archived' && (
          <div className={styles.action}>
            <Button
              variant="secondary"
              size={32}
              onPress={() => onConfirmStatusChange('draft')}
            >
              {formatMessage(backofficeRedesignMessages.publishRestoreToDraft)}
            </Button>
          </div>
        )}

        {isDraftOrScheduled && (
          <>
            <div className={styles.action}>
              <Button
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
