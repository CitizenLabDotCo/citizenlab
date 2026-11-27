import React from 'react';

import BarRow from 'design-system/BarRow';
import DashboardCard from 'design-system/DashboardCard';
import Skeleton from 'design-system/Skeleton';

import useCauses from 'api/causes/useCauses';

import useLocalize from 'hooks/useLocalize';
import useProjectBackofficeRedesign from 'hooks/useProjectBackofficeRedesign';

import { useIntl } from 'utils/cl-intl';

import { usePdfExportContext } from '../../pdf/PdfExportContext';
import sharedMessages from '../shared/messages';
import { MethodSpecificInsightProps } from '../types';

import messages from './messages';

// How the volunteers spread over the causes, in the redesigned workspace only.
const VolunteeringInsights = ({ phaseId }: MethodSpecificInsightProps) => {
  const { formatMessage } = useIntl();
  const localize = useLocalize();
  const { isPdfRenderMode } = usePdfExportContext();
  const redesigned = useProjectBackofficeRedesign() && !isPdfRenderMode;
  const { data: causes, isLoading } = useCauses({
    phaseId: redesigned ? phaseId : null,
  });

  if (!redesigned) return null;
  if (isLoading) return <Skeleton shape="block" height={160} />;
  if (!causes || causes.data.length === 0) return null;

  const volunteers = causes.data.reduce(
    (total, cause) => total + cause.attributes.volunteers_count,
    0
  );
  const sortedCauses = [...causes.data].sort(
    (a, b) => b.attributes.volunteers_count - a.attributes.volunteers_count
  );

  return (
    <DashboardCard title={formatMessage(messages.volunteersByCause)}>
      <div>
        {sortedCauses.map((cause) => {
          const count = cause.attributes.volunteers_count;
          const share = volunteers > 0 ? count / volunteers : 0;

          return (
            <BarRow
              key={cause.id}
              label={localize(cause.attributes.title_multiloc)}
              value={formatMessage(sharedMessages.shareAndCount, {
                percentage: Math.round(share * 100),
                count,
              })}
              share={share}
            />
          );
        })}
      </div>
    </DashboardCard>
  );
};

export default VolunteeringInsights;
