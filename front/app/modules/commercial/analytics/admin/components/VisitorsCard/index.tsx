import React from 'react';

// components
import GraphCard from 'components/admin/GraphCard';
import { Box } from '@citizenlab/cl2-component-library';
import VisitorStats from './VisitorStats';

// i18n
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';

// typings
import { IResolution } from 'components/admin/ResolutionControl';

interface Props {
  resolution: IResolution;
}

const VisitorsCard = ({ resolution }: Props) => (
  <GraphCard title={<FormattedMessage {...messages.visitors} />}>
    <Box width="100%" display="flex" flexDirection="row">
      <VisitorStats resolution={resolution} />
    </Box>
  </GraphCard>
);

export default VisitorsCard;
