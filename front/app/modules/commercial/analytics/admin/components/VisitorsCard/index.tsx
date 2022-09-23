import React from 'react';

// components
import GraphCard from 'components/admin/GraphCard';
import { Box } from '@citizenlab/cl2-component-library';
import VisitorStats from './VisitorStats';
import Chart from './Chart';

// i18n
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';

// typings
import { IResolution } from 'components/admin/ResolutionControl';

interface Props {
  resolution: IResolution;
}

const VisitorsCard = ({ resolution }: Props) => (
  <GraphCard
    title={<FormattedMessage {...messages.visitors} />}
    infoTooltipContent={<FormattedMessage {...messages.titleTooltipMessage} />}
  >
    <Box width="100%" display="flex" flexDirection="row">
      <Box display="flex" flexDirection="row" pl="20px">
        <VisitorStats resolution={resolution} />
      </Box>

      <Box flexGrow={1} display="flex" justifyContent="center">
        <Chart resolution={resolution} />
      </Box>
    </Box>
  </GraphCard>
);

export default VisitorsCard;
