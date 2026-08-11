import React from 'react';

import { Box, Text, colors } from '@citizenlab/cl2-component-library';
import { useTheme } from 'styled-components';

import { IJobData } from 'api/jobs/types';
import useUserById from 'api/users/useUserById';

import ProgressBar from 'components/UI/ProgressBar';

import { FormattedMessage } from 'utils/cl-intl';
import { getFullName } from 'utils/textUtils';

import messages from './messages';

type Props = {
  job: IJobData;
};

// Progress of the responses PDF export job: a bar over the tracker's
// progress/total plus a status label. The tracker reserves its last unit for
// the Gotenberg render — a single opaque step that dominates the export for
// large phases — so once we reach it, switch to a "rendering" label instead of
// letting the bar sit just short of full.
const PdfExportStatus = ({ job }: Props) => {
  const theme = useTheme();
  const { data: owner } = useUserById(job.relationships.owner.data?.id);

  const { progress, total } = job.attributes;
  // The tracker total is set when the job is enqueued (inputs + 1 reserved
  // render unit), so it is always positive here.
  const rendering = progress >= total - 1;

  return (
    <Box mb="12px" data-cy="e2e-pdf-export-status">
      <Text m="0" mb="8px" fontSize="s" color="textSecondary">
        {rendering ? (
          <FormattedMessage {...messages.renderingPdf} />
        ) : (
          <FormattedMessage
            {...messages.collectingResponses}
            values={{ progress, total: Math.max(total - 1, 1) }}
          />
        )}
        {owner && (
          <>
            {' '}
            <FormattedMessage
              {...messages.exportStartedBy}
              values={{ name: getFullName(owner.data) }}
            />
          </>
        )}
      </Text>
      <ProgressBar
        progress={Math.min(progress / total, 1)}
        color={theme.colors.tenantPrimary}
        bgColor={colors.grey200}
      />
      <Text m="0" mt="8px" fontSize="s" color="orange500">
        <FormattedMessage {...messages.dontCloseWarning} />
      </Text>
    </Box>
  );
};

export default PdfExportStatus;
