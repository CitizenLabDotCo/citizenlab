import React, { memo, useCallback, useState } from 'react';
import { isNilOrError } from 'utils/helperUtils';

// components
import Table from 'components/UI/Table';
import ModerationRow from './ModerationRow';
import Pagination from 'components/admin/Pagination/Pagination';
import Checkbox from 'components/UI/Checkbox';
import Select from 'components/UI/Select';
import Label from 'components/UI/Label';
import Tabs from 'components/UI/Tabs';
import { PageTitle } from 'components/admin/Section';

// hooks
import useModerations from 'hooks/useModerations';
import useTenantLocales from 'hooks/useTenantLocales';

// i18n
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from './messages';

// styling
import styled from 'styled-components';
import { colors, fontSizes } from 'utils/styleUtils';
import { rgba } from 'polished';

// typings
import { IOption } from 'typings';
import { TModerationStatuses } from 'services/moderations';

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
  margin-bottom: 60px;
`;

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
    }

    &.belongsTo {
      width: 20%;
    }

    &.content {
      width: 60%;
      padding-right: 0px;
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
  margin-left: -10px;
`;

const Spacer = styled.div`
  flex: 1;
`;

const RowsPerPage = styled.div`
  display: flex;
  align-items: center;
  color: ${colors.adminTextColor};
  font-size: ${fontSizes.base}px;
`;

const RowsPerPageLabel = styled(Label)`
  margin: 0;
  margin-right: 10px;
`;

const StyledSelect = styled(Select)`
  select {
    color: ${colors.adminTextColor};
    font-size: ${fontSizes.base}px;
    font-weight: 500;
    padding-top: 8px;
    padding-bottom: 8px;
    background: ${colors.lightGreyishBlue};
    border: none;

    &.enabled:hover {
      background: ${rgba(colors.adminTextColor, .2)};
    }

    option {
      background: #fff;
    }
  }

  .arrow {
    border-top-color: ${colors.adminTextColor};
    top: 18px;
  }
`;

interface Props {
  className?: string;
}

const Moderation = memo<Props & InjectedIntlProps>(({ className, intl }) => {

  const moderationStatuses = [
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

  const tenantLocales = useTenantLocales();
  const moderations = useModerations({
    pageSize: pageSizes[0].value,
    moderationStatus: moderationStatuses[0].value as TModerationStatuses
  });

  // const [selected, setSelected] = useState<'all' | 'some' | 'none'>('none');

  const handleOnSelectAll = useCallback((event: React.MouseEvent | React.KeyboardEvent) => {
    event.preventDefault();
  }, []);

  const handleOnModerationStatusChange = useCallback((moderationStatus: TModerationStatuses) => {
    moderations.onModerationStatusChange(moderationStatus);
  }, [moderations]);

  const handePageNumberChange = useCallback((pageNumber: number) => {
    moderations.onPageNumberChange(pageNumber);
  }, [moderations]);

  const handleOnPageSizeChange = useCallback((option: IOption) => {
    moderations.onPageSizeChange(option.value);
  }, [moderations]);

  if (!isNilOrError(moderations?.list) && !isNilOrError(tenantLocales)) {
    const { list, pageSize, moderationStatus, currentPage, lastPage } = moderations;

    return (
      <Container className={className}>
        <PageTitleWrapper>
          <StyledPageTitle>
            <FormattedMessage {...messages.pageTitle} />
          </StyledPageTitle>
          <BetaLabel>(Beta)</BetaLabel>
        </PageTitleWrapper>

        <Filters>
          <Tabs
            items={moderationStatuses}
            selectedValue={moderationStatus}
            onClick={handleOnModerationStatusChange}
          />
        </Filters>

        <StyledTable>
          <thead>
            <tr>
              <th className="checkbox">
                <StyledCheckbox
                  checked={false}
                  indeterminate={true}
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
            {list.map(listItem => <ModerationRow key={listItem.id} moderation={listItem} />)}
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
            <StyledSelect
              options={pageSizes}
              onChange={handleOnPageSizeChange}
              value={pageSizes.find(item => item.value === pageSize)}
            />
          </RowsPerPage>
        </Footer>
      </Container>
    );
  }

  return null;
});

export default injectIntl(Moderation);
