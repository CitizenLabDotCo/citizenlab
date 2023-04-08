import React from 'react';
import { Title } from '@citizenlab/cl2-component-library';
import { Column } from 'components/admin/GraphWrappers';
import Outlet from 'components/Outlet';
import { useIntl } from 'utils/cl-intl';
import messages from './messages';
import { TMomentTime } from '.';
import { IResolution } from 'components/admin/ResolutionControl';

interface Props {
  currentProjectFilter: string | undefined;
  startAtMoment: TMomentTime;
  endAtMoment: TMomentTime;
  resolution: IResolution;
}

const Management = ({
  currentProjectFilter,
  startAtMoment,
  endAtMoment,
  resolution,
}: Props) => {
  const { formatMessage } = useIntl();
  return (
    <>
      <Title
        ml="12px"
        mt="40px"
        width="100%"
        variant="h2"
        color="primary"
        fontWeight="normal"
      >
        {formatMessage(messages.management)}
      </Title>
      <Column>
        <Outlet
          id="app.containers.Admin.dashboard.summary.inputStatus"
          projectId={currentProjectFilter}
          startAtMoment={startAtMoment}
          endAtMoment={endAtMoment}
          resolution={resolution}
        />
        <Outlet
          id="app.containers.Admin.dashboard.summary.events"
          projectId={currentProjectFilter}
          startAtMoment={startAtMoment}
          endAtMoment={endAtMoment}
          resolution={resolution}
        />
      </Column>
      <Column>
        <Outlet
          id="app.containers.Admin.dashboard.summary.emailDeliveries"
          projectId={currentProjectFilter}
          startAtMoment={startAtMoment}
          endAtMoment={endAtMoment}
          resolution={resolution}
        />
        <Outlet
          id="app.containers.Admin.dashboard.summary.invitations"
          projectId={currentProjectFilter}
          startAtMoment={startAtMoment}
          endAtMoment={endAtMoment}
          resolution={resolution}
        />
      </Column>
    </>
  );
};

export default Management;
