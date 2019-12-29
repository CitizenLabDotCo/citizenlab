import React, { memo, useCallback, useState, useEffect } from 'react';
import { isNilOrError } from 'utils/helperUtils';
import { includes } from 'lodash-es';

// components
import Table from 'components/UI/Table';
import ModerationRow from './ModerationRow';
import Pagination from 'components/admin/Pagination/Pagination';
import Checkbox from 'components/UI/Checkbox';
import Select from 'components/UI/Select';
import Icon from 'components/UI/Icon';
import Button from 'components/UI/Button';
import Tabs from 'components/UI/Tabs';
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
  min-height: 50px;
  display: flex;
  align-items: center;
  margin-bottom: 55px;
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
  height: 50vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const EmptyIcon = styled(Icon)`
  height: 55px;
  fill:${colors.mediumGrey};
  fill: #BFE7EB;
  margin-bottom: 15px;
`;

const EmptyMessage = styled.div`
  max-width: 350px;
  color: ${colors.adminTextColor};
  font-size: ${fontSizes.medium}px;
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
      value: 'unread',
      label: intl.formatMessage(messages.unread),
      // icon: 'eyeClosed'
    },
    {
      value: 'read',
      label: intl.formatMessage(messages.read),
      // icon: 'eyeOpened'
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
    moderationStatus: 'unread'
  });

  const [moderationItems, setModerationItems] = useState(list);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [processing, setProcessing] = useState(false);

  const handleOnSelectAll = useCallback((event: React.MouseEvent | React.KeyboardEvent) => {
    if (!isNilOrError(moderationItems) && !processing) {
      event.preventDefault();
      const newSelectedRows = selectedRows.length < moderationItems.length ? moderationItems.map(item => item.id) : [];
      setSelectedRows(newSelectedRows);
    }
  }, [moderationItems, selectedRows, processing]);

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
    if (!processing) {
      const newSelectedRows = includes(selectedRows, selectedModerationId) ? selectedRows.filter(id => id !== selectedModerationId) : [...selectedRows, selectedModerationId];
      setSelectedRows(newSelectedRows);
    }
  }, [selectedRows, processing]);

  const markAs = useCallback(async (event: React.FormEvent) => {
    if (selectedRows.length > 0 && !isNilOrError(moderationItems) && moderationStatus && !processing) {
      event.preventDefault();
      setProcessing(true);
      const moderations = selectedRows.map((moderationId) => moderationItems.find(item => item.id === moderationId)) as IModerationData[];
      const updatedModerationStatus = (moderationStatus === 'read' ? 'unread' : 'read');
      const promises = moderations.map((moderation) => updateModerationStatus(moderation.id, moderation.attributes.moderatable_type, updatedModerationStatus));
      await Promise.all(promises);
      setProcessing(false);
      setSelectedRows([]);
    }
  }, [selectedRows, moderationItems, moderationStatus]);

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
          <BetaLabel>(Beta)</BetaLabel>
        </PageTitleWrapper>

        <Filters>
          {selectedRows.length > 0 &&
            <MarkAsButton
              icon="label"
              style="cl-blue"
              processing={processing}
              onClick={markAs}
            >
              {moderationStatus === 'unread' ?
                <FormattedMessage {...messages.markAsViewed} values={{ selectedItemsCount: selectedRows.length }} />
                : <FormattedMessage {...messages.markAsNotViewed} values={{ selectedItemsCount: selectedRows.length }} />}
            </MarkAsButton>
          }

          {selectedRows.length === 0 &&
            <Tabs
              items={moderationStatuses}
              selectedValue={moderationStatus || 'unread'}
              onClick={handleOnModerationStatusChange}
            />
          }
        </Filters>

        <StyledTable>
          <thead>
            <tr>
              <th className="checkbox">
                <StyledCheckbox
                  checked={moderationItems.length > 0 && selectedRows.length === moderationItems.length}
                  indeterminate={selectedRows.length > 0 && selectedRows.length !== moderationItems.length}
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
            </tr>
          </thead>
          {moderationItems.length > 0 &&
            <tbody>
              {moderationItems.map(moderationItem => (
                <ModerationRow
                  key={moderationItem.id}
                  moderation={moderationItem}
                  selected={includes(selectedRows, moderationItem.id)}
                  onSelect={handleRowOnSelect}
                />
              ))}
            </tbody>
          }
        </StyledTable>

        {moderationItems.length > 0 &&
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
        }

        {moderationItems.length === 0 &&
          <Empty>
            <EmptyIcon name="inbox" />
            <EmptyMessage>
              {moderationStatus === 'read' && <FormattedMessage {...messages.noReadItems} />}
              {moderationStatus === 'unread' && <FormattedMessage {...messages.noUnreadItems} />}
            </EmptyMessage>
          </Empty>
        }
      </Container>
    );
  }

  return null;
});

export default injectIntl(Moderation);
