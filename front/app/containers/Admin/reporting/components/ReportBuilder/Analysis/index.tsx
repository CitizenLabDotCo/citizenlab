import React, { useCallback, useState } from 'react';

import {
  Box,
  Button,
  Title,
  Text,
  Tooltip,
} from '@citizenlab/cl2-component-library';
import { IOption } from 'typings';

import useFeatureFlag from 'hooks/useFeatureFlag';

import { useReportContext } from 'containers/Admin/reporting/context/ReportContext';

import { useIntl } from 'utils/cl-intl';

import ProjectFilter from '../Widgets/_shared/ProjectFilter';
import widgetMessages from '../Widgets/messages';

import Analyses from './Analyses';
import messages from './messages';

const Analysis = ({ selectedLocale }: { selectedLocale: string }) => {
  const isAnalysisAllowed = useFeatureFlag({
    name: 'analysis',
    onlyCheckAllowed: true,
  });
  const { projectId: contextProjectId } = useReportContext();

  const [projectId, setProjectId] = useState<string | undefined>(
    contextProjectId
  );

  const { formatMessage } = useIntl();

  const handleProjectFilter = useCallback(({ value }: IOption) => {
    setProjectId(value);
  }, []);

  return (
    <>
      {!isAnalysisAllowed && (
        <Box p="12px">
          <Title variant="h3">{formatMessage(messages.upsellTitle)}</Title>
          <Text>{formatMessage(messages.upsellDescription)}</Text>
          <Tooltip content={<p>{formatMessage(messages.upsellTooltip)}</p>}>
            <Box>
              <Button disabled icon="lock">
                {formatMessage(messages.upsellButton)}
              </Button>
            </Box>
          </Tooltip>
        </Box>
      )}
      {isAnalysisAllowed && (
        <Box>
          <ProjectFilter
            id="e2e-report-builder-analysis-project-filter-box"
            projectId={projectId}
            emptyOptionMessage={widgetMessages.noProject}
            onProjectFilter={handleProjectFilter}
          />

          <Analyses projectId={projectId} selectedLocale={selectedLocale} />
        </Box>
      )}
    </>
  );
};

export default Analysis;
