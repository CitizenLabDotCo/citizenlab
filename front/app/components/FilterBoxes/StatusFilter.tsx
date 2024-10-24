import React, { memo, useCallback, MouseEvent } from 'react';

import {
  fontSizes,
  colors,
  defaultCardStyle,
  isRtl,
  Icon,
} from '@citizenlab/cl2-component-library';
import { capitalize, get } from 'lodash-es';
import { darken } from 'polished';
import styled from 'styled-components';

import { IIdeaStatusData } from 'api/idea_statuses/types';
import { IIdeasFilterCounts } from 'api/ideas_filter_counts/types';

import T from 'components/T';

import { ScreenReaderOnly } from 'utils/a11y';
import { FormattedMessage } from 'utils/cl-intl';
import { isNilOrError, removeFocusAfterMouseClick } from 'utils/helperUtils';

import messages from './messages';
import { Header, Title } from './styles';

const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  padding-top: 25px;
  padding-bottom: 20px;
  padding-left: 20px;
  padding-right: 20px;
  ${defaultCardStyle};
`;

const Count = styled.span`
  color: ${colors.textSecondary};
  font-size: ${fontSizes.base}px;
  font-weight: 300;
  transition: all 80ms ease-out;
  margin-left: auto;

  ${isRtl`
    margin-left: 0;
    margin-right: auto;
  `}
`;

const CloseIcon = styled(Icon)`
  fill: #fff;
  margin-left: auto;

  ${isRtl`
    margin-left: 0;
    margin-right: auto;
  `}
`;

const StatusesContainer = styled.div``;

const Status = styled.button`
  color: ${({ theme }) => theme.colors.tenantText};
  font-size: ${fontSizes.base}px;
  font-weight: 400;
  line-height: normal;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-left: 18px;
  padding-right: 18px;
  padding-top: 7px;
  padding-bottom: 7px;
  margin: 0px;
  margin-right: 10px;
  margin-bottom: 6px;
  cursor: pointer;
  border-radius: 5px;
  user-select: none;
  transition: all 80ms ease-out;
  width: 100%;

  ${isRtl`
    flex-direction: row-reverse;
  `}

  &:not(.selected):hover {
    background: rgba(132, 147, 158, 0.15);
  }

  &.selected {
    color: #fff;
    background: ${({ theme }) => theme.colors.tenantSecondary};

    &:hover {
      background: ${({ theme }) => darken(0.15, theme.colors.tenantSecondary)};
    }

    ${Count} {
      color: #fff;
    }
  }
`;

const AllStatus = styled(Status)``;

interface Props {
  statuses: IIdeaStatusData[];
  filterCounts: IIdeasFilterCounts['data']['attributes'] | null | undefined;

  selectedStatusId: string | null | undefined;
  onChange: (arg: string | null) => void;
  className?: string;
}

const StatusFilter = memo<Props>(
  ({ statuses, filterCounts, selectedStatusId, onChange, className }) => {
    const handleOnClick = useCallback(
      (event: MouseEvent<HTMLElement>) => {
        event.preventDefault();
        const statusId = event.currentTarget.dataset.id as string;
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
        <Container className={`e2e-statuses-filters ${className}`}>
          <Header>
            <Title>
              <FormattedMessage {...messages.statusTitle} />
            </Title>
          </Header>

          <StatusesContainer>
            <AllStatus
              data-id={null}
              onMouseDown={removeFocusAfterMouseClick}
              onClick={handleOnClick}
              className={allFilterSelected ? 'selected' : ''}
            >
              <FormattedMessage {...messages.all} />
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
                  <T value={status.attributes.title_multiloc}>
                    {(statusTitle) => <>{capitalize(statusTitle)}</>}
                  </T>
                  {!isFilterSelected ? (
                    <Count aria-hidden>{filterPostCount}</Count>
                  ) : (
                    <>
                      <CloseIcon name="close" />
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
          </StatusesContainer>
        </Container>
      );
    }

    return null;
  }
);

export default StatusFilter;
