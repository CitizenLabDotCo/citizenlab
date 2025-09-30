import React from 'react';

import { Box, Divider, Text } from '@citizenlab/cl2-component-library';
import { RouteType } from 'routes';

import useAnalyses from 'api/analyses/useAnalyses';

import ButtonWithLink from 'components/UI/ButtonWithLink';

import { useIntl } from 'utils/cl-intl';

import Insights from './Insights';
import messages from './messages';

const Analyses = ({
  projectId,
  selectedLocale,
}: {
  projectId?: string;
  selectedLocale: string;
}) => {
  const { formatMessage } = useIntl();
  const { data: analyses, isLoading } = useAnalyses({
    projectId,
  });

  console.log({ analyses, isLoading });

  const projectLink: RouteType = `/admin/projects/${projectId}`;

  if (analyses?.data.length === 0 && !isLoading) {
    return (
      <Box id="e2e-report-buider-ai-no-analyses">
        <Divider />
        <Text>{formatMessage(messages.noInsights)}</Text>
        <Box display="flex">
          <ButtonWithLink
            linkTo={projectLink}
            buttonStyle="secondary-outlined"
            openLinkInNewTab
          >
            {formatMessage(messages.openProject)}
          </ButtonWithLink>
        </Box>
      </Box>
    );
  }

  return (
    <div>
      {projectId &&
        analyses?.data.map((analysis) => (
          <Insights
            analysisId={analysis.id}
            key={analysis.id}
            projectId={projectId}
            selectedLocale={selectedLocale}
          />
        ))}
    </div>
  );
};

export default Analyses;
