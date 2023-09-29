import React, { useState } from 'react';
import useAnalysisBackgroundTasks from 'api/analysis_background_tasks/useAnalysisBackgroundTasks';
import { useParams } from 'react-router-dom';
import {
  Box,
  colors,
  IconButton,
  Dropdown,
  Button,
  Text,
  Spinner,
} from '@citizenlab/cl2-component-library';
import ProgressBar from 'components/UI/ProgressBar';
import styled from 'styled-components';
import Divider from 'components/admin/Divider';
import { TagTypeColorMap } from '../Tags/Tag';
import { timeAgo } from 'utils/dateUtils';
import useLocale from 'hooks/useLocale';
import { isNilOrError } from 'utils/helperUtils';

import { useIntl } from 'utils/cl-intl';
import translations from './translations';
import {
  AutoTaggingMethod,
  IBackgroundTaskData,
} from 'api/analysis_background_tasks/types';

const StyledProgressBar = styled(ProgressBar)`
  height: 8px;
  width: 100%;
`;

const stateColorMap = {
  in_progress: colors.blue500,
  queued: colors.brown,
  succeeded: colors.success,
  failed: colors.error,
};

const Tasks = () => {
  const { formatMessage } = useIntl();
  const [isDropdownOpened, setIsDropdownOpened] = useState(false);

  const { analysisId } = useParams() as { analysisId: string };
  const { data: tasks } = useAnalysisBackgroundTasks(analysisId);

  const locale = useLocale();

  const anythingInProgress = tasks?.data.find(
    (t) =>
      t.attributes.state === 'in_progress' || t.attributes.state === 'queued'
  );

  if (isNilOrError(locale)) {
    return null;
  }

  const typeTranslationMap: Record<
    IBackgroundTaskData['attributes']['type'],
    string
  > = {
    auto_tagging_task: formatMessage(translations.autotaggingTask),
    summarization_task: formatMessage(translations.summarizationTask),
  };

  const taggingMethodTranslationMap: Record<AutoTaggingMethod, string> = {
    custom: formatMessage(translations.custom),
    language: formatMessage(translations.language),
    platform_topic: formatMessage(translations.platformTopic),
    nlp_topic: formatMessage(translations.nlpTopic),
    sentiment: formatMessage(translations.sentiment),
    controversial: formatMessage(translations.controversial),
    label_classification: formatMessage(translations.labelClassification),
    few_shot_classification: formatMessage(translations.fewShotClassification),
  };

  const stateTranslationMap: Record<
    IBackgroundTaskData['attributes']['state'],
    string
  > = {
    queued: formatMessage(translations.queued),
    in_progress: formatMessage(translations.inProgress),
    succeeded: formatMessage(translations.succeeded),
    failed: formatMessage(translations.failed),
  };

  return (
    <Box display="flex" w="32px" h="32px">
      {anythingInProgress ? (
        <Button
          buttonStyle="text"
          width="24px"
          height="24px"
          aria-label={formatMessage(translations.backgroundJobs)}
          onClick={() => setIsDropdownOpened(!isDropdownOpened)}
        >
          <Spinner />
        </Button>
      ) : (
        <IconButton
          iconName="list"
          a11y_buttonActionMessage={formatMessage(translations.backgroundJobs)}
          iconColor={colors.grey800}
          iconColorOnHover={colors.black}
          onClick={() => setIsDropdownOpened(!isDropdownOpened)}
          iconHeight="28px"
          iconWidth="28px"
        />
      )}

      <Dropdown
        opened={isDropdownOpened}
        width="300px"
        onClickOutside={() => setIsDropdownOpened(false)}
        right="20px"
        top="60px"
        content={
          <Box p="12px">
            {tasks?.data.length === 0 && (
              <Text>{formatMessage(translations.noJobs)}</Text>
            )}
            {tasks?.data.map((task) => {
              return (
                <Box
                  key={task.id}
                  display="flex"
                  flexDirection="column"
                  gap="4px"
                >
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    gap="8px"
                  >
                    <Text
                      fontWeight="bold"
                      fontSize="s"
                      my="4px"
                      style={{
                        wordBreak: 'break-all',
                      }}
                    >
                      {typeTranslationMap[task.attributes.type]}
                    </Text>
                    {task.attributes.type === 'auto_tagging_task' && (
                      <Box
                        as="span"
                        bg={
                          TagTypeColorMap[task.attributes.auto_tagging_method]
                            ?.background
                        }
                        color={
                          TagTypeColorMap[task.attributes.auto_tagging_method]
                            ?.text
                        }
                        borderRadius="3px"
                        py="4px"
                        px="8px"
                        w="fit-content"
                      >
                        {
                          taggingMethodTranslationMap[
                            task.attributes.auto_tagging_method
                          ]
                        }
                      </Box>
                    )}
                  </Box>
                  {task.attributes.progress && (
                    <StyledProgressBar
                      progress={task.attributes.progress}
                      color={colors.green400}
                      bgColor={colors.grey100}
                    />
                  )}
                  <Box
                    as="span"
                    bg={stateColorMap[task.attributes.state]}
                    color="white"
                    borderRadius="3px"
                    py="4px"
                    px="8px"
                    w="fit-content"
                    mb="4px"
                  >
                    {stateTranslationMap[task.attributes.state]}
                  </Box>
                  <Box display="flex" justifyContent="space-between">
                    <span>{formatMessage(translations.triggeredAt)} </span>
                    <span>
                      {timeAgo(Date.parse(task.attributes.created_at), locale)}
                    </span>
                  </Box>
                  <Box display="flex" justifyContent="space-between">
                    <span>{formatMessage(translations.startedAt)} </span>
                    <span>
                      {task.attributes.started_at &&
                        timeAgo(Date.parse(task.attributes.started_at), locale)}
                    </span>
                  </Box>
                  <Box display="flex" justifyContent="space-between">
                    <span>{formatMessage(translations.endedAt)} </span>
                    <span>
                      {task.attributes.ended_at &&
                        timeAgo(Date.parse(task.attributes.ended_at), locale)}
                    </span>
                  </Box>

                  <Divider />
                </Box>
              );
            })}
          </Box>
        }
      />
    </Box>
  );
};

export default Tasks;
