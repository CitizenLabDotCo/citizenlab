import React, { useState } from 'react';

import AnnouncementModal from 'design-system/AnnouncementModal';

import useDeclineEarlyAccess from 'api/me/useDeclineEarlyAccess';

import useEarlyAccess from 'hooks/useEarlyAccess';

import { useIntl } from 'utils/cl-intl';

import BuilderPreview from './BuilderPreview';
import messages from './messages';
import useSwitchBackOffice, {
  BACK_OFFICE_FEATURE,
} from './useSwitchBackOffice';

interface Props {
  // Where "Enable" takes the user. Without it, the page reloads as it is.
  enablePath?: string;
}

// Invites the user of the previous back office to turn the new one on. The back
// end decides when to invite them again after "Not now".
const IntroModal = ({ enablePath }: Props) => {
  const { formatMessage } = useIntl();
  const { promptDue } = useEarlyAccess(BACK_OFFICE_FEATURE);
  const { mutate: decline } = useDeclineEarlyAccess();
  const { switchBackOffice, isPending, isError } = useSwitchBackOffice();
  const [declined, setDeclined] = useState(false);

  if (!promptDue) return null;

  return (
    <AnnouncementModal
      isOpen={!declined}
      media={<BuilderPreview />}
      title={formatMessage(messages.introTitle)}
      points={[
        formatMessage(messages.introFasterSetup),
        formatMessage(messages.introFullControl),
        formatMessage(messages.introLivePreview),
      ]}
      primaryAction={{
        label: formatMessage(messages.introEnable),
        onPress: () => switchBackOffice(true, enablePath),
        isPending,
      }}
      secondaryAction={{
        label: formatMessage(messages.introNotNow),
        onPress: () => {
          setDeclined(true);
          decline(BACK_OFFICE_FEATURE);
        },
      }}
      note={formatMessage(messages.introNote)}
      error={isError && formatMessage(messages.switchFailed)}
    />
  );
};

export default IntroModal;
