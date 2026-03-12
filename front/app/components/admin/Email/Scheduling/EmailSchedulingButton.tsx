import * as React from 'react';
import { useState } from 'react';

import {
  Box,
  Button,
  Dropdown,
  colors,
} from '@citizenlab/cl2-component-library';

import { ICampaign } from 'api/campaigns/types';
import { isDraft } from 'api/campaigns/util';

import { FormattedMessage } from 'utils/cl-intl';

import messages from './messages';

interface Props {
  campaign: ICampaign;
  timeZone: string | undefined;
  onOpenScheduleModal: () => void;
  onOpenCancelScheduleModal: () => void;
}

const EmailSchedulingButton = ({
  campaign,
  onOpenScheduleModal,
  onOpenCancelScheduleModal,
}: Props) => {
  const [openedDropdown, setOpenedDropdown] = useState(false);

  const toggleScheduleSendDropdown = () => {
    setOpenedDropdown(!openedDropdown);
  };

  return (
    <>
      <Button
        buttonStyle="admin-dark"
        icon="chevron-down"
        onClick={toggleScheduleSendDropdown}
        borderRadius="0px 3px 3px 0px"
        padding="0px 8px"
        height="45px"
      />
      <Dropdown
        opened={openedDropdown}
        onClickOutside={() => setOpenedDropdown(false)}
        width="200px"
        top="65px"
        right="0px"
        content={
          <Box background={colors.white}>
            {isDraft(campaign.data) && (
              <Button
                onClick={onOpenScheduleModal}
                buttonStyle="text"
                justify="left"
                bgHoverColor={colors.background}
              >
                <FormattedMessage {...messages.scheduleSend} />
              </Button>
            )}
            {campaign.data.attributes.scheduled_at && (
              <>
                <Button
                  onClick={onOpenScheduleModal}
                  buttonStyle="text"
                  justify="left"
                  bgHoverColor={colors.background}
                >
                  <FormattedMessage {...messages.rescheduleSend} />
                </Button>
                <Button
                  onClick={onOpenCancelScheduleModal}
                  buttonStyle="text"
                  justify="left"
                  bgHoverColor={colors.background}
                >
                  <FormattedMessage {...messages.cancelSchedule} />
                </Button>
              </>
            )}
          </Box>
        }
      />
    </>
  );
};

export default EmailSchedulingButton;
