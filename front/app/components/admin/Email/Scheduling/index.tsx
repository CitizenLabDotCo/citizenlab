import * as React from 'react';
import { useState } from 'react';

import { ICampaign } from 'api/campaigns/types';

import CancelScheduleModal from './CancelScheduleModal';
import EmailSchedulingButton from './EmailSchedulingButton';
import ScheduleModal from './ScheduleModal';

interface Props {
  campaign: ICampaign;
  timeZone: string | undefined;
}

const EmailScheduling = ({ campaign, timeZone }: Props) => {
  const [openScheduleModal, setOpenScheduleModal] = useState(false);
  const [openCancelScheduleModal, setOpenCancelScheduleModal] = useState(false);

  return (
    <>
      <EmailSchedulingButton
        campaign={campaign}
        timeZone={timeZone}
        onOpenScheduleModal={() => setOpenScheduleModal(true)}
        onOpenCancelScheduleModal={() => setOpenCancelScheduleModal(true)}
      />
      <ScheduleModal
        opened={openScheduleModal}
        onClose={() => setOpenScheduleModal(false)}
        campaign={campaign}
        timeZone={timeZone}
      />
      <CancelScheduleModal
        opened={openCancelScheduleModal}
        onClose={() => setOpenCancelScheduleModal(false)}
        campaign={campaign}
      />
    </>
  );
};

export default EmailScheduling;
