import React, { memo, useCallback } from 'react';
import { isNilOrError } from 'utils/helperUtils';
import moment from 'moment';
import { omitBy, isNil, isEmpty } from 'lodash-es';

// components
import Table from 'components/UI/Table';
import Pagination from 'components/admin/Pagination/Pagination';
import { PageTitle } from 'components/admin/Section';

// hooks
import useModerations from 'hooks/useModerations';
import useTenantLocales from 'hooks/useTenantLocales';

// i18n
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';
import T from 'components/T';

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

const Content = styled.div`
  &:not(.last) {
    margin-bottom: 25px;
  }
`;

const ContentLocale = styled.div`
  font-size: ${fontSizes.small}px;
  font-weight: 600;
  text-transform: uppercase;
  margin-bottom: 5px;
`;

const ContentBody = styled.div``;

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
            {list.map((listItem, index) => {
              return (
                <tr key={index}>
                  <td className="date nowrap">
                    {moment(listItem.attributes.created_at).format('LLL')}
                  </td>
                  <td className="type nowrap">
                    {listItem.attributes.moderatable_type}
                  </td>
                  <td className="context">
                    <a href={listItem.attributes.context_url} role="button" target="_blank">
                      <T value={listItem.attributes.context_multiloc} />
                    </a>
                  </td>
                  <td className="content">
                    <>
                      {Object.keys(omitBy(listItem.attributes.content_multiloc, (value) => isNil(value) || isEmpty(value))).map((locale, index) => {
                        const content = listItem.attributes.content_multiloc[locale];
                        const languageCount = Object.keys(omitBy(listItem.attributes.content_multiloc, (value) => isNil(value) || isEmpty(value))).length;

                        return (
                          <Content key={`${listItem.id}-${index}`} className={index + 1 === languageCount ? 'last' : ''}>
                            {languageCount > 1 && <ContentLocale>{locale}</ContentLocale>}
                            <ContentBody dangerouslySetInnerHTML={{ __html: content }} />
                          </Content>
                        );
                      })}
                    </>
                  </td>
                </tr>
              );
            })}
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
