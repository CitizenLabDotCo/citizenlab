import React, { useState } from 'react';

import AlertDialog from 'design-system/AlertDialog';
import Banner from 'design-system/Banner';
import Switch from 'design-system/Switch';

import useDismissed from 'hooks/useDismissed';
import useEarlyAccess from 'hooks/useEarlyAccess';

import { usePageSave } from 'components/admin/PageSaveContext';

import { FormattedMessage, useIntl } from 'utils/cl-intl';

import styles from './EarlyAccessBanner.module.css';
import messages from './messages';
import ProfileSettingsLink from './ProfileSettingsLink';
import useSwitchBackOffice, {
  BACK_OFFICE_FEATURE,
} from './useSwitchBackOffice';
import 'design-system/tokens.css';

interface Props {
  // Adds the space the new workspace gives its panels, for pages without it.
  inset?: boolean;
}

// Says which project back office the user is in, with a switch to change it.
// Shown in both versions to the admins the new one is offered to.
const EarlyAccessBanner = ({ inset = false }: Props) => {
  const { formatMessage } = useIntl();
  const { offered, tier, optedIn } = useEarlyAccess(BACK_OFFICE_FEATURE);
  const { switchBackOffice, isPending, isError } = useSwitchBackOffice();
  const pageSave = usePageSave();
  const [confirming, setConfirming] = useState(false);
  // Each version keeps the dismissal its notice had before the switch was added.
  const { dismissed, dismiss } = useDismissed(
    optedIn
      ? 'project_backoffice_redesign_feedback_notice_dismissed'
      : 'project_backoffice_redesign_turn_on_notice_dismissed'
  );

  if (!offered || dismissed) return null;

  const turnOn = !optedIn;
  // The previous version cannot tell whether the page has unsaved changes,
  // so it always asks before reloading.
  const mayLoseChanges = pageSave ? pageSave.dirty : true;

  const hint = optedIn
    ? messages.turnOffBannerHint
    : tier === 'internal'
    ? messages.turnOnBannerHintInternal
    : messages.turnOnBannerHint;

  return (
    <div className={`${styles.banner} ${inset ? styles.inset : ''}`}>
      <Banner
        tone="info"
        action={
          <Switch
            size={28}
            isSelected={optedIn}
            isDisabled={isPending}
            onChange={() =>
              mayLoseChanges ? setConfirming(true) : switchBackOffice(turnOn)
            }
          >
            {formatMessage(messages.switchLabel)}
          </Switch>
        }
        onDismiss={dismiss}
      >
        <span className={styles.message}>
          <FormattedMessage
            {...(optedIn
              ? messages.feedbackNoticeTitle
              : messages.turnOnNoticeTitle)}
          />{' '}
          <FormattedMessage
            {...hint}
            values={{ profileSettingsLink: <ProfileSettingsLink /> }}
          />
          {isError && (
            <span className={styles.error} role="alert">
              {formatMessage(messages.switchFailed)}
            </span>
          )}
        </span>
      </Banner>
      <AlertDialog
        isOpen={confirming}
        onOpenChange={setConfirming}
        title={formatMessage(
          turnOn ? messages.turnOnTitle : messages.turnOffTitle
        )}
        confirmLabel={formatMessage(
          turnOn ? messages.turnOn : messages.turnOff
        )}
        isPending={isPending}
        onConfirm={() => switchBackOffice(turnOn)}
      >
        {formatMessage(messages.switchLosesChanges)}
      </AlertDialog>
    </div>
  );
};

export default EarlyAccessBanner;
