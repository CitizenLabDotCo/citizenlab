import React, { memo, useCallback, MouseEvent } from 'react';

import {
  colors,
  isRtl,
  Icon,
  Box,
  Text,
} from '@citizenlab/cl2-component-library';
import { capitalize, get } from 'lodash-es';
import { darken } from 'polished';
import styled from 'styled-components';

import { IIdeaStatusData } from 'api/idea_statuses/types';

import T from 'components/T';

import { ScreenReaderOnly } from 'utils/a11y';
import { FormattedMessage, useIntl } from 'utils/cl-intl';
import { isNilOrError, removeFocusAfterMouseClick } from 'utils/helperUtils';

import InputFilterCollapsible from './InputFilterCollapsible';
import messages from './messages';
import { FilterCounts } from './types';

const Count = styled(Text)`
  color: ${colors.textSecondary};
  margin: 0px;
`;

const Status = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-between;

  width: 100%;
  padding: 8px;
  margin-top: 4px;
  border-radius: 3px;

  ${isRtl`
    flex-direction: row-reverse;
  `}

  &:not(.selected):hover {
    background: ${colors.grey100};
  }

  &.selected {
    color: #fff;
    background: ${({ theme }) => theme.colors.tenantPrimary};

    &:hover {
      background: ${({ theme }) => darken(0.15, theme.colors.tenantPrimary)};
    }

    ${Count} {
      color: #fff;
    }
  }
`;

const AllStatus = styled(Status)``;

interface Props {
  statuses: IIdeaStatusData[];
  filterCounts: FilterCounts;

  selectedStatusId: string | null | undefined;
  onChange: (arg: string | null) => void;
  className?: string;
}

const StatusFilter = memo<Props>(
  ({ statuses, filterCounts, selectedStatusId, onChange, className }) => {
    const { formatMessage } = useIntl();

    const handleOnClick = useCallback(
      (event: MouseEvent<HTMLElement>) => {
        event.preventDefault();
        const statusId = event.currentTarget.dataset.id as string;

        // deselect if already selected, otherwise select the new status
        const nextSelectedStatusId =
          selectedStatusId !== statusId ? statusId : null;

        onChange(nextSelectedStatusId);
      },
      [selectedStatusId, onChange]
    );

    if (!isNilOrError(statuses) && statuses.length > 0) {
      const allPostsCount = filterCounts?.total || 0;
      const allFilterSelected = !selectedStatusId;
      return (
        <InputFilterCollapsible
          title={formatMessage(messages.statusTitle)}
          className={`e2e-statuses-filters ${className}`}
        >
          <Box>
            <AllStatus
              data-id={null}
              onMouseDown={removeFocusAfterMouseClick}
              onClick={handleOnClick}
              className={allFilterSelected ? 'selected' : ''}
            >
              <Box display="flex" gap="8px">
                <Box my="auto" w="14px" h="14px" bgColor={colors.grey500} />
                <FormattedMessage {...messages.all} />
              </Box>
              <Count aria-hidden>{allPostsCount}</Count>
              <ScreenReaderOnly>
                {/* Pronounce number of ideas of All status when focus/hover it */}
                <FormattedMessage
                  {...messages.a11y_numberOfInputs}
                  values={{ inputsCount: allPostsCount }}
                />
              </ScreenReaderOnly>
              <ScreenReaderOnly aria-live="polite">
                {/*
              When we focus a selected status filter and hit enter again, this filter gets removed and
              the 'all' status filter is selected again. Screen readers don't pick this up, so hence this helper text
            */}
                {allFilterSelected && (
                  <FormattedMessage {...messages.a11y_allFilterSelected} />
                )}
              </ScreenReaderOnly>
            </AllStatus>

            {statuses.map((status) => {
              const filterPostCount = get(
                filterCounts,
                `idea_status_id.${status.id}`,
                0
              );
              const isFilterSelected = status.id === selectedStatusId;

              return (
                <Status
                  key={status.id}
                  data-id={status.id}
                  onMouseDown={removeFocusAfterMouseClick}
                  onClick={handleOnClick}
                  className={`e2e-status ${isFilterSelected ? 'selected' : ''}`}
                >
                  <Box display="flex" gap="8px">
                    <Box
                      my="auto"
                      w="14px"
                      h="14px"
                      bgColor={status.attributes.color}
                    />
                    <Text m="0px">
                      <T value={status.attributes.title_multiloc}>
                        {(statusTitle) => <>{capitalize(statusTitle)}</>}
                      </T>
                    </Text>
                  </Box>

                  {!isFilterSelected ? (
                    <Count aria-hidden>{filterPostCount}</Count>
                  ) : (
                    <>
                      <Icon fill={colors.white} name="close" />
                      <ScreenReaderOnly>
                        <FormattedMessage {...messages.a11y_removeFilter} />
                      </ScreenReaderOnly>
                    </>
                  )}

                  <ScreenReaderOnly>
                    {/* Pronounce number of ideas per status when focus/hover it */}
                    <FormattedMessage
                      {...messages.a11y_numberOfInputs}
                      values={{ inputsCount: filterPostCount }}
                    />
                  </ScreenReaderOnly>
                  <ScreenReaderOnly aria-live="polite">
                    {/*
                    Added this for consistency with the all filter, see comment above AllStatus component.
                    Pronounces the selected filter.
                  */}
                    {isFilterSelected && (
                      <FormattedMessage
                        {...messages.a11y_selectedFilter}
                        values={{
                          filter: (
                            <T value={status.attributes.title_multiloc} />
                          ),
                        }}
                      />
                    )}
                  </ScreenReaderOnly>
                </Status>
              );
            })}
          </Box>
        </InputFilterCollapsible>
      );
    }

    return null;
  }
);

export default StatusFilter;
