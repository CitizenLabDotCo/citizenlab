import React, { memo, useCallback } from 'react';
import { isNilOrError } from 'utils/helperUtils';

// components
import Table from 'components/UI/Table';
import ModerationRow from './ModerationRow';
import Pagination from 'components/admin/Pagination/Pagination';
import { PageTitle } from 'components/admin/Section';

// hooks
import useModerations from 'hooks/useModerations';
import useTenantLocales from 'hooks/useTenantLocales';

// i18n
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';

// styling
import styled from 'styled-components';
import { colors, fontSizes } from 'utils/styleUtils';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  margin-bottom: 100px;
`;

const PageTitleWrapper = styled.div`
  display: flex;
  align-items: flex-end;
  margin-bottom: 60px;
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

const StyledTable = styled(Table)`
  th,
  td {
    text-align: left;
    vertical-align: top;
    padding-left: 10px;
    padding-right: 10px;
    overflow-wrap: normal;

    &.nowrap {
      overflow-wrap: normal;
      white-space: nowrap;
    }

    &.date {
      padding-right: 20px;
    }

    &.type {
      padding-right: 20px;
    }

    &.content {
      width: calc(100vw - 900px);
    }
  }
`;

const StyledPagination = styled(Pagination)`
  margin-top: 40px;
`;

interface Props {
  className?: string;
}

const Moderation = memo<Props>(({ className }) => {

  const moderations = useModerations();
  const tenantLocales = useTenantLocales();

  const handlePaginationClick = useCallback((pageNumber: number) => {
    if (!isNilOrError(moderations)) {
      moderations.onPageChange(pageNumber);
    }
  }, [moderations]);

  if (!isNilOrError(moderations?.list) && !isNilOrError(tenantLocales)) {
    const { list, currentPage, lastPage } = moderations;

    return (
      <Container className={className}>
        <PageTitleWrapper>
          <StyledPageTitle>
            <FormattedMessage {...messages.pageTitle} />
          </StyledPageTitle>
          <BetaLabel>(Beta)</BetaLabel>
        </PageTitleWrapper>

        <StyledTable>
          <thead>
            <tr>
              <th></th>
              <th className="date">
                <FormattedMessage {...messages.date} />
              </th>
              <th className="type">
                <FormattedMessage {...messages.type} />
              </th>
              <th className="context">
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

        <StyledPagination
          currentPage={currentPage}
          totalPages={lastPage}
          loadPage={handlePaginationClick}
        />
      </Container>
    );
  }

  return null;
});

export default Moderation;
