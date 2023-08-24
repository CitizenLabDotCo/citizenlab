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

  return (
    <Box display="flex" w="32px" h="32px">
      {anythingInProgress ? (
        <Button
          buttonStyle="text"
          width="24px"
          height="24px"
          aria-label="background jobs"
          onClick={() => setIsDropdownOpened(!isDropdownOpened)}
        >
          <Spinner />
        </Button>
      ) : (
        <IconButton
          iconName="book"
          a11y_buttonActionMessage="background jobs"
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
                      {task.attributes.type}
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
                        {task.attributes.auto_tagging_method}
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
                    {task.attributes.state}
                  </Box>
                  <Box display="flex" justifyContent="space-between">
                    <span> Triggered at</span>
                    <span>
                      {timeAgo(Date.parse(task.attributes.created_at), locale)}
                    </span>
                  </Box>
                  <Box display="flex" justifyContent="space-between">
                    <span>Started at </span>
                    <span>
                      {task.attributes.started_at &&
                        timeAgo(Date.parse(task.attributes.started_at), locale)}
                    </span>
                  </Box>
                  <Box display="flex" justifyContent="space-between">
                    <span>Ended at </span>
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
