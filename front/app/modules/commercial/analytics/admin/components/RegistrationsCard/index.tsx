import React from 'react';

// hooks
import useRegistrations from '../../hooks/useRegistrations';

// components
import GraphCard from 'components/admin/GraphCard';

// i18n
import messages from './messages';
import { useIntl } from 'utils/cl-intl';

// typings
import { Moment } from 'moment';
import { IResolution } from 'components/admin/ResolutionControl';

interface Props {
  startAtMoment: Moment | null | undefined;
  endAtMoment: Moment | null;
  resolution: IResolution;
}

const RegistrationsCard = ({
  startAtMoment,
  endAtMoment,
  resolution,
}: Props) => {
  const { formatMessage } = useIntl();
  const registrations = useRegistrations({
    startAtMoment,
    endAtMoment,
    resolution,
  });
  console.log(registrations);

  return (
    <GraphCard title={formatMessage(messages.registrations)}>Test</GraphCard>
  );
};

export default RegistrationsCard;
