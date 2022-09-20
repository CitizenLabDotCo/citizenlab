import React from 'react';

// components
import GraphCard from 'components/admin/GraphCard';
import { Box } from '@citizenlab/cl2-component-library';

// i18n
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';

const VisitorsCard = () => (
  <GraphCard
    title={<FormattedMessage {...messages.cardTitle} />}
  >
    <Box width="100%" display="flex" flexDirection="row">

    </Box>
  </GraphCard>
)

export default VisitorsCard;
