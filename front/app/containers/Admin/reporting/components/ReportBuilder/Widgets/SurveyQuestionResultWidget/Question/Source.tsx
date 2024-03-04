import React from 'react';

import { Text } from '@citizenlab/cl2-component-library';

import { FormattedMessage, useIntl } from 'utils/cl-intl';
import Link from 'utils/cl-router/Link';

import usePhases from 'api/phases/usePhases';
import useProjectById from 'api/projects/useProjectById';

import useLocalize from 'hooks/useLocalize';

import messages from '../messages';

import { generateDateRange, getPhaseIndex } from './utils';

interface Props {
  projectId: string;
  phaseId: string;
}

const Source = ({ projectId, phaseId }: Props) => {
  const { data: project } = useProjectById(projectId);
  const { data: phases } = usePhases(projectId);
  const localize = useLocalize();
  const { formatMessage } = useIntl();

  if (!project || !phases) return null;

  const phaseIndex = getPhaseIndex(phases.data, phaseId);
  if (phaseIndex === -1) return null;

  const phase = phases.data[phaseIndex];
  const phaseNumber = phaseIndex + 1;

  return (
    <Text color="textSecondary" variant="bodyS" mb="0" mt="20px">
      <FormattedMessage
        {...messages.sourceAndReference}
        values={{
          phase: (
            <Link
              to={`/projects/${project.data.attributes.slug}/${phaseNumber}`}
              target="_blank"
            >
              {localize(phase.attributes.title_multiloc)}
            </Link>
          ),
          period: generateDateRange(
            formatMessage,
            phase.attributes.start_at,
            phase.attributes.end_at
          ),
        }}
      />
    </Text>
  );
};

export default Source;
