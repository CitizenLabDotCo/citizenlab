import React, { memo, useCallback, useState, useEffect } from 'react';
import { isNilOrError } from 'utils/helperUtils';
import { includes, cloneDeep } from 'lodash-es';

// components
import Table from 'components/UI/Table';
import ModerationRow from './ModerationRow';
import Pagination from 'components/admin/Pagination/Pagination';
import Checkbox from 'components/UI/Checkbox';
import Select from 'components/UI/Select';
import Icon from 'components/UI/Icon';
// import Label from 'components/UI/Label';
import Button from 'components/UI/Button';
import Tabs from 'components/UI/Tabs';
import Dropdown, { DropdownListItem } from 'components/UI/Dropdown';
import { PageTitle } from 'components/admin/Section';

// hooks
import useModerations from 'hooks/useModerations';

// services
import { updateModerationStatus, IModerationData, TModerationStatuses } from 'services/moderations';

// i18n
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from './messages';

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

const BetaLabel = styled.span`
  color: ${colors.clIconAccent};
  font-size: ${fontSizes.medium}px;
  line-height: ${fontSizes.medium + 4}px;
  font-weight: 600;
  margin-left: 8px;
`;

const Filters = styled.div`
  min-height: 44px;
  display: flex;
  align-items: center;
  margin-bottom: 50px;
`;

// const Filter = styled.div`
//   width: 250px;
//   display: flex;
//   flex-direction: column;
// `;

// const FilterLabel = styled(Label)`
//   color: ${colors.adminTextColor};
//   font-size: ${fontSizes.base}px;
//   font-weight: 500;
//   margin-bottom: 5px;
// `;

const MarkAsButtonWrapper = styled.div`
  height: 100%;
  display: flex;
  position: relative;
  margin-right: 20px;
`;

const MarkAsButton = styled(Button)``;

const StyledTable = styled(Table)`
  table-layout: fixed;

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

    &.belongsTo {
      width: 20%;
    }

    &.content {
      width: 60%;
      padding-right: 8px;
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
  height: 30vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const EmptyIcon = styled(Icon)`
  height: 60px;
  fill:${colors.clIconAccent};
  margin-bottom: 20px;
`;

const EmptyMessage = styled.div`
  color: ${colors.adminTextColor};
  font-size: ${fontSizes.base}px;
  line-height: normal;
  font-weight: 500;
  text-align: center;
`;

interface Props {
  className?: string;
}

const Moderation = memo<Props & InjectedIntlProps>(({ className, intl }) => {

  const moderationStatuses = [
    {
      value: 'all',
      label: intl.formatMessage(messages.all)
    },
    {
      value: 'unread',
      label: intl.formatMessage(messages.unread)
    },
    {
      value: 'read',
      label: intl.formatMessage(messages.read)
    }
  ];

  const pageSizes = [
    {
      value: 10,
      label: '10'
    },
    {
      value: 25,
      label: '25'
    },
    {
      value: 50,
      label: '50'
    },
    {
      value: 100,
      label: '100'
    }
  ];

  const { list, pageSize, moderationStatus, currentPage, lastPage, onModerationStatusChange, onPageNumberChange, onPageSizeChange } = useModerations({
    pageSize: pageSizes[0].value,
    // moderationStatus: 'unread'
  });

  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [markAsDropdownOpened, setMarkAsDropdownOpened] = useState(false);

  const handleOnSelectAll = useCallback((event: React.MouseEvent | React.KeyboardEvent) => {
    if (!isNilOrError(list)) {
      event.preventDefault();
      const newSelectedRows = selectedRows.length < list.length ? list.map(item => item.id) : [];
      setSelectedRows(newSelectedRows);
    }
  }, [list, selectedRows]);

  // const handleOnModerationStatusChange = useCallback((option: IOption) => {
  //   onModerationStatusChange(option.value);
  // }, [onModerationStatusChange]);

  const handleOnModerationStatusChange = useCallback((value: TModerationStatuses) => {
    onModerationStatusChange(value);
  }, [onModerationStatusChange]);

  const handePageNumberChange = useCallback((pageNumber: number) => {
    onPageNumberChange(pageNumber);
  }, [onPageNumberChange]);

  const handleOnPageSizeChange = useCallback((option: IOption) => {
    onPageSizeChange(option.value);
  }, [onPageSizeChange]);

  const handleRowOnSelect = useCallback((selectedModerationId: string) => {
    const newSelectedRows = includes(selectedRows, selectedModerationId) ? selectedRows.filter(id => id !== selectedModerationId) : [...selectedRows, selectedModerationId];
    setSelectedRows(newSelectedRows);
  }, [selectedRows]);

  const toggleMarkAsDropdown = useCallback((event: React.FormEvent) => {
    event.preventDefault();
    setMarkAsDropdownOpened(!markAsDropdownOpened);
  }, [markAsDropdownOpened]);

  const markAs = useCallback((moderationStatus: TModerationStatuses) => async (event: React.MouseEvent) => {
    const copiedSelectedRows = cloneDeep(selectedRows);
    event.preventDefault();
    setMarkAsDropdownOpened(false);
    setSelectedRows([]);
    await Promise.all(
      copiedSelectedRows.map((moderationId) => {
        const moderation = (list as IModerationData[]).find(item => item.id === moderationId) as IModerationData;
        return updateModerationStatus(moderation.id, moderation.attributes.moderatable_type, moderationStatus);
      })
    );
  }, [selectedRows, list]);

  useEffect(() => {
    setSelectedRows([]);
  }, [currentPage, moderationStatus, pageSize]);

  if (!isNilOrError(list)) {
    return (
      <Container className={className}>
        <PageTitleWrapper>
          <StyledPageTitle>
            <FormattedMessage {...messages.pageTitle} />
          </StyledPageTitle>
          <BetaLabel>(Beta)</BetaLabel>
        </PageTitleWrapper>

        <Filters>
          {selectedRows.length > 0 &&
            <MarkAsButtonWrapper>
              <MarkAsButton
                icon="label"
                style="admin-dark"
                onClick={toggleMarkAsDropdown}
              >
                <FormattedMessage {...messages.markAs} />
              </MarkAsButton>

              <Dropdown
                top="46px"
                right="0x"
                opened={markAsDropdownOpened}
                onClickOutside={toggleMarkAsDropdown}
                content={
                  <>
                    <DropdownListItem onClick={markAs('read')}>
                      <FormattedMessage {...messages.read} />
                    </DropdownListItem>
                    <DropdownListItem onClick={markAs('unread')}>
                      <FormattedMessage {...messages.unread} />
                    </DropdownListItem>
                  </>
                }
              />
            </MarkAsButtonWrapper>
          }
          <Tabs
            items={moderationStatuses}
            selectedValue={moderationStatus || 'all'}
            onClick={handleOnModerationStatusChange}
          />
        </Filters>

        {list.length > 0 ? (
          <>
            <StyledTable>
              <thead>
                <tr>
                  <th className="checkbox">
                    <StyledCheckbox
                      checked={selectedRows.length === list.length}
                      indeterminate={selectedRows.length > 0 && selectedRows.length !== list.length}
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
                </tr>
              </thead>
              <tbody>
                {list.map(listItem => (
                  <ModerationRow
                    key={listItem.id}
                    moderation={listItem}
                    selected={includes(selectedRows, listItem.id)}
                    onSelect={handleRowOnSelect}
                  />
                ))}
              </tbody>
            </StyledTable>
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
                  value={pageSizes.find(item => item.value === pageSize)}
                />
              </RowsPerPage>
            </Footer>
          </>
        ) : (
          <Empty>
            <EmptyIcon name="empty" />
            <EmptyMessage>
              {moderationStatus === undefined && <FormattedMessage {...messages.noItems} />}
              {moderationStatus === 'read' && <FormattedMessage {...messages.noReadItems} />}
              {moderationStatus === 'unread' && <FormattedMessage {...messages.noUnreadItems} />}
            </EmptyMessage>
          </Empty>
        )}
      </Container>
    );
  }

  return null;
});

export default injectIntl(Moderation);
