import React, { memo, useCallback, useState, useEffect } from 'react';
import { isNilOrError } from 'utils/helperUtils';
import { includes } from 'lodash-es';

// components
import Table from 'components/UI/Table';
import ModerationRow from './ModerationRow';
import Pagination from 'components/admin/Pagination/Pagination';
import Checkbox from 'components/UI/Checkbox';
import { Icon, IconTooltip, Select } from 'cl2-component-library';
import Button from 'components/UI/Button';
import Tabs from 'components/UI/Tabs';
import { PageTitle } from 'components/admin/Section';
import SelectType from './SelectType';
import SelectProject from './SelectProject';
import SearchInput from 'components/UI/SearchInput';

// hooks
import useModerations from 'modules/moderation/hooks/useModerations';

// services
import {
  updateModerationStatus,
  IModerationData,
  TModerationStatuses,
  TModeratableTypes,
} from 'modules/moderation/services/moderations';

// i18n
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from './messages';

// analytics
import { trackEventByName } from 'utils/analytics';
import tracks from './tracks';

// styling
import styled from 'styled-components';
import { colors, fontSizes } from 'utils/styleUtils';

// typings
import { IOption } from 'typings';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  margin-bottom: 80px;
`;

const PageTitleWrapper = styled.div`
  display: flex;
  align-items: flex-end;
  margin-bottom: 40px;
`;

const StyledPageTitle = styled(PageTitle)`
  line-height: ${fontSizes.xxxl}px;
  margin-bottom: 0px;
`;

const StyledIconTooltip = styled(IconTooltip)`
  margin-left: 8px;
  margin-bottom: 3px;
`;

const Filters = styled.div`
  min-height: 50px;
  display: flex;
  align-items: center;
  margin-bottom: 55px;
`;

const MarkAsButton = styled(Button)``;

const StyledTabs = styled(Tabs)`
  margin-right: 20px;
`;

const StyledTable = styled(Table)`
  th,
  td {
    text-align: left;
    vertical-align: top;
    padding-left: 0px;
    padding-right: 20px;

    &.checkbox {
      width: 70px;
      padding-left: 8px;
    }

    &.content {
      width: 50%;
      padding-right: 25px;
    }
  }
`;

const StyledCheckbox = styled(Checkbox)`
  margin-top: -3px;
`;

const Footer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 30px;
`;

const StyledPagination = styled(Pagination)`
  margin-left: -12px;
`;

const Spacer = styled.div`
  flex: 1;
`;

const RowsPerPage = styled.div`
  display: flex;
  align-items: center;
`;

const RowsPerPageLabel = styled.div`
  color: ${colors.adminTextColor};
  font-size: ${fontSizes.base}px;
  font-weight: 500;
  margin-right: 10px;
`;

const PageSizeSelect = styled(Select)`
  select {
    padding-top: 8px;
    padding-bottom: 8px;
  }
`;

const Empty = styled.div`
  height: 50vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const EmptyIcon = styled(Icon)`
  height: 60px;
  fill: #bfe7eb;
  margin-bottom: 18px;
`;

const EmptyMessage = styled.div`
  max-width: 350px;
  color: ${colors.adminTextColor};
  font-size: ${fontSizes.medium}px;
  line-height: normal;
  font-weight: 500;
  text-align: center;
`;

const StyledSearchInput = styled(SearchInput)`
  margin-left: auto;
  width: 320px;
`;

interface Props {
  className?: string;
}

const Moderation = memo<Props & InjectedIntlProps>(({ className, intl }) => {
  const moderationStatuses = [
    {
      value: 'unread',
      label: intl.formatMessage(messages.unread),
    },
    {
      value: 'read',
      label: intl.formatMessage(messages.read),
    },
  ];

  const pageSizes = [
    {
      value: 10,
      label: '10',
    },
    {
      value: 25,
      label: '25',
    },
    {
      value: 50,
      label: '50',
    },
    {
      value: 100,
      label: '100',
    },
  ];

  const {
    list,
    pageSize,
    moderationStatus,
    currentPage,
    lastPage,
    onModerationStatusChange,
    onPageNumberChange,
    onPageSizeChange,
    onModeratableTypesChange,
    onProjectIdsChange,
    onSearchTermChange,
  } = useModerations({
    pageSize: pageSizes[1].value,
    moderationStatus: 'unread',
    moderatableTypes: [],
    projectIds: [],
    searchTerm: '',
  });

  const [moderationItems, setModerationItems] = useState(list);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [processing, setProcessing] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState<TModeratableTypes[]>([]);
  const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>([]);

  const handleOnSelectAll = useCallback(
    (_event: React.ChangeEvent) => {
      if (!isNilOrError(moderationItems) && !processing) {
        const newSelectedRows =
          selectedRows.length < moderationItems.length
            ? moderationItems.map((item) => item.id)
            : [];
        setSelectedRows(newSelectedRows);
      }
    },
    [moderationItems, selectedRows, processing]
  );

  const handleOnModerationStatusChange = useCallback(
    (value: TModerationStatuses) => {
      trackEventByName(
        value === 'read' ? tracks.viewedTabClicked : tracks.notViewedTabClicked
      );
      onModerationStatusChange(value);
    },
    [onModerationStatusChange]
  );

  const handePageNumberChange = useCallback(
    (pageNumber: number) => {
      trackEventByName(tracks.pageNumberClicked);
      onPageNumberChange(pageNumber);
    },
    [onPageNumberChange]
  );

  const handleOnPageSizeChange = useCallback(
    (option: IOption) => {
      onPageSizeChange(option.value);
    },
    [onPageSizeChange]
  );

  const handleModeratableTypesChange = useCallback(
    (newSelectedTypes: TModeratableTypes[]) => {
      setSelectedTypes(newSelectedTypes);
      onModeratableTypesChange(newSelectedTypes);
      trackEventByName(tracks.typeFilterUsed);
    },
    [onModeratableTypesChange]
  );

  const handleProjectIdsChange = useCallback(
    (newProjectIds: string[]) => {
      setSelectedProjectIds(newProjectIds);
      onProjectIdsChange(newProjectIds);
      trackEventByName(tracks.projectFilterUsed);
    },
    [onModeratableTypesChange]
  );

  const handleSearchTermChange = useCallback(
    (searchTerm: string) => {
      onSearchTermChange(searchTerm);
      trackEventByName(tracks.searchUsed, {
        searchTerm,
      });
    },
    [onSearchTermChange]
  );

  const handleRowOnSelect = useCallback(
    (selectedModerationId: string) => {
      if (!processing) {
        const newSelectedRows = includes(selectedRows, selectedModerationId)
          ? selectedRows.filter((id) => id !== selectedModerationId)
          : [...selectedRows, selectedModerationId];
        setSelectedRows(newSelectedRows);
      }
    },
    [selectedRows, processing]
  );

  const markAs = useCallback(
    async (event: React.FormEvent) => {
      if (
        selectedRows.length > 0 &&
        !isNilOrError(moderationItems) &&
        moderationStatus &&
        !processing
      ) {
        event.preventDefault();
        trackEventByName(
          moderationStatus === 'read'
            ? tracks.markedAsNotViewedButtonClicked
            : tracks.markedAsNotViewedButtonClicked,
          { selectedItemsCount: selectedRows.length }
        );
        setProcessing(true);
        const moderations = selectedRows.map((moderationId) =>
          moderationItems.find((item) => item.id === moderationId)
        ) as IModerationData[];
        const updatedModerationStatus =
          moderationStatus === 'read' ? 'unread' : 'read';
        const promises = moderations.map((moderation) =>
          updateModerationStatus(
            moderation.id,
            moderation.attributes.moderatable_type,
            updatedModerationStatus
          )
        );
        await Promise.all(promises);
        setProcessing(false);
        setSelectedRows([]);
      }
    },
    [selectedRows, moderationItems, moderationStatus]
  );

  useEffect(() => {
    if (!processing) {
      setSelectedRows([]);
    }
  }, [currentPage, moderationStatus, pageSize, processing]);

  useEffect(() => {
    if (!processing) {
      setModerationItems(list);
    }
  }, [list, processing]);

  if (!isNilOrError(moderationItems)) {
    return (
      <Container className={className}>
        <PageTitleWrapper>
          <StyledPageTitle>
            <FormattedMessage {...messages.pageTitle} />
          </StyledPageTitle>
          <StyledIconTooltip
            content={<FormattedMessage {...messages.moderationHelpTooltip} />}
            iconSize="20px"
            placement="right"
          />
        </PageTitleWrapper>

        <Filters>
          {selectedRows.length > 0 && (
            <MarkAsButton
              icon="label"
              buttonStyle="cl-blue"
              processing={processing}
              onClick={markAs}
            >
              {moderationStatus === 'unread' ? (
                <FormattedMessage
                  {...messages.markAsViewed}
                  values={{ selectedItemsCount: selectedRows.length }}
                />
              ) : (
                <FormattedMessage
                  {...messages.markAsNotViewed}
                  values={{ selectedItemsCount: selectedRows.length }}
                />
              )}
            </MarkAsButton>
          )}

          {selectedRows.length === 0 && (
            <>
              <StyledTabs
                items={moderationStatuses}
                selectedValue={moderationStatus || 'unread'}
                onClick={handleOnModerationStatusChange}
              />
              <SelectType
                selectedTypes={selectedTypes}
                onChange={handleModeratableTypesChange}
              />
              <SelectProject
                selectedProjectIds={selectedProjectIds}
                onChange={handleProjectIdsChange}
              />
            </>
          )}
          <StyledSearchInput onChange={handleSearchTermChange} />
        </Filters>

        <StyledTable>
          <thead>
            <tr>
              <th className="checkbox">
                <StyledCheckbox
                  checked={
                    moderationItems.length > 0 &&
                    selectedRows.length === moderationItems.length
                  }
                  indeterminate={
                    selectedRows.length > 0 &&
                    selectedRows.length < moderationItems.length
                  }
                  disabled={moderationItems.length === 0}
                  onChange={handleOnSelectAll}
                />
              </th>
              <th className="date">
                <FormattedMessage {...messages.date} />
              </th>
              <th className="type">
                <FormattedMessage {...messages.type} />
              </th>
              <th className="belongsTo">
                <FormattedMessage {...messages.belongsTo} />
              </th>
              <th className="content">
                <FormattedMessage {...messages.content} />
              </th>
              <th className="goto">&nbsp;</th>
            </tr>
          </thead>
          {moderationItems.length > 0 && (
            <tbody>
              {moderationItems.map((moderationItem) => (
                <ModerationRow
                  key={moderationItem.id}
                  moderation={moderationItem}
                  selected={includes(selectedRows, moderationItem.id)}
                  onSelect={handleRowOnSelect}
                />
              ))}
            </tbody>
          )}
        </StyledTable>

        {moderationItems.length > 0 && (
          <Footer>
            <StyledPagination
              currentPage={currentPage}
              totalPages={lastPage}
              loadPage={handePageNumberChange}
            />

            <Spacer />

            <RowsPerPage>
              <RowsPerPageLabel>
                <FormattedMessage {...messages.rowsPerPage} />:
              </RowsPerPageLabel>
              <PageSizeSelect
                options={pageSizes}
                onChange={handleOnPageSizeChange}
                value={pageSizes.find((item) => item.value === pageSize)}
              />
            </RowsPerPage>
          </Footer>
        )}

        {moderationItems.length === 0 && (
          <Empty>
            <EmptyIcon name="inbox" />
            <EmptyMessage>
              {moderationStatus === 'read' ? (
                <FormattedMessage {...messages.noViewedItems} />
              ) : (
                <FormattedMessage {...messages.noUnviewedItems} />
              )}
            </EmptyMessage>
          </Empty>
        )}
      </Container>
    );
  }

  return null;
});

export default injectIntl(Moderation);
